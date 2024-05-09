import nodePath from 'node:path';
import fs from 'fs-extra';
import sigstore from 'sigstore';
import fetch from 'node-fetch';
import { webcrypto } from 'node:crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ErrorObject, serializeError } from 'serialize-error';
import type { Stats } from 'assemblyscript/dist/asc';
import { Utils } from '@secretarium/connector';
import { createCompiler } from '@klave/compiler';
import type { Context } from 'probot';
import { buildDepTree, LockfileType, PkgTree } from 'snyk-nodejs-lockfile-parser';
import { DeploymentPushPayload } from '../types';
import { Repo } from '@klave/db';
import { dummyMap } from './dummyVmFs';
import { logger } from '@klave/providers';
import { RepoConfigSchemaLatest } from '@klave/constants';
import { Worker } from 'node:worker_threads';
import { watExtractorModuleFunction } from './watExtractorModule';

type BuildDependenciesManifest = Record<string, {
    version: string;
    digests: Record<string, string>
}>;

type BuildOutput = {
    stdout: string;
    stderr: string;
    dependenciesManifest: BuildDependenciesManifest;
} & ({
    success: true;
    result: {
        stats?: Stats;
        wasm: Uint8Array;
        wat?: string;
        dts?: string;
        routes: string[];
        signature?: sigstore.Bundle;
    };
} | {
    success: false;
    error?: Error | ErrorObject;
})

export type DeploymentContext<Type> = {
    octokit: Context['octokit']
} & Type;

export class BuildMiniVM {

    private proxyAgent: HttpsProxyAgent<string> | undefined;
    private usedDependencies: BuildDependenciesManifest = {};
    private dependencies: Record<string, Array<string>> = {};
    private dependenciesLocks: PkgTree | undefined;

    constructor(private options: {
        type: 'github';
        context: DeploymentContext<DeploymentPushPayload>;
        repo: Repo;
        // TODO Reenable the KlaveRcConfiguration[...] type
        application: NonNullable<RepoConfigSchemaLatest['applications']>[number] | undefined;
        // dependencies: Record<string, string>;
    }) {
        if (process.env['KLAVE_SQUID_URL'])
            this.proxyAgent = new HttpsProxyAgent(process.env['KLAVE_SQUID_URL']);
    }

    getContentSync(path: string): string | null {
        const normalisedPath = path.split(nodePath.sep).join(nodePath.posix.sep);
        return dummyMap[normalisedPath] ?? null;
    }

    async getContent(path?: string, atAbsoluteRoot = false): Promise<Awaited<ReturnType<Context['octokit']['repos']['getContent']>> | { data: string | null }> {

        const { context: { octokit, ...context }, repo } = this.options;
        const normalisedPath = path === '.' ? '' : path?.split(/[\\/]/).filter((s, i) => !(i === 0 && s === '.')).join(nodePath.posix.sep);
        const errorAcc: string[] = [];

        if (normalisedPath === undefined)
            return { data: null };

        if (!normalisedPath.includes('node_modules')) {
            logger.debug(`Getting GitHub content for '${normalisedPath}'`, {
                parent: 'bmv'
            });
            try {
                const fetchRoot = (atAbsoluteRoot ? '' : this.options.application?.rootDir ?? '').replace(/\/*$/g, '');
                const fileDescriptor = await octokit.repos.getContent({
                    owner: repo.owner,
                    repo: repo.name,
                    ref: context.commit.ref,
                    path: `${fetchRoot}${normalisedPath ? `/${normalisedPath}` : ''}`,
                    mediaType: {
                        format: 'raw+json'
                    }
                });
                return fileDescriptor;
            } catch (e) {
                errorAcc.push(`Error downloading content from GihHub: ${e?.toString()}`);
            }
        }

        const components = normalisedPath?.split('node_modules') ?? [];
        const lastComponent = components.pop();

        if (lastComponent?.startsWith('/')) {
            let packageName: string | undefined;
            let packageVersion: string | undefined;
            try {
                const comps = lastComponent.substring(1).split('/');
                packageName = comps[0]?.startsWith('@') ? `${comps.shift()}/${comps.shift()}` : comps.shift() ?? '';
                const packageVersionArray = packageName ? this.dependencies?.[packageName] : undefined;
                packageVersion = packageVersionArray?.length === 1 ? packageVersionArray[0] : undefined;

                if (!packageVersion) {
                    console.log('Need to find correct version for package (multiple choices available):', packageName, packageVersionArray);
                    let chainPackage: PkgTree['dependencies'][string] = {
                        dependencies: this.dependenciesLocks?.dependencies
                    };
                    if (chainPackage) {
                        let chainPackageName: string | undefined;
                        components.forEach(comp => {
                            const chainComps = comp.substring(1).split('/');
                            chainPackageName = chainComps[0]?.startsWith('@') ? `${chainComps.shift()}/${chainComps.shift()}` : chainComps.shift() ?? '';
                            const nextChainPackage = chainPackage.dependencies?.[chainPackageName ?? ''];
                            if (nextChainPackage)
                                chainPackage = nextChainPackage;
                        });
                    }

                    if (chainPackage.name === packageName && chainPackage.version)
                        packageVersion = chainPackage.version;
                }

                const filePath = comps.join('/');
                let version = packageVersion ?? '';
                let data = '';

                const unpkgDomain = 'https://www.unpkg.com/';
                const url = `${unpkgDomain}${packageName}${packageVersion ? `@${packageVersion}` : ''}/${filePath}`;
                const urlHash = Utils.toHex(new Uint8Array(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(url))));
                console.log('URL:', url, urlHash);
                const assetLocation = nodePath.resolve(`./.cache/klave/compiler/assets/${urlHash}`);

                if (fs.existsSync(assetLocation)) {

                    logger.debug(`Getting disk cache content for '${lastComponent}'`, {
                        parent: 'bmv'
                    });

                    if (fs.existsSync(`${assetLocation}/version`) && fs.existsSync(`${assetLocation}/data`)) {
                        version = fs.readFileSync(`${assetLocation}/version`, 'utf-8');
                        data = fs.readFileSync(`${assetLocation}/data`, 'utf-8');
                    }

                } else {
                    logger.debug(`Getting unpkg content for '${lastComponent}'`, {
                        parent: 'bmv'
                    });
                    const response = await fetch(url, {
                        agent: this.proxyAgent
                    });

                    const effectiveComps = response.url.replace(unpkgDomain, '').split('/');
                    const effectiveName = effectiveComps[0]?.startsWith('@') ? `${effectiveComps.shift()}/${effectiveComps.shift()}` : effectiveComps.shift() ?? '';
                    const effectiveVersion = effectiveName ? effectiveName.split('@')[2] ?? effectiveName.split('@')[1] ?? '*' : '*';

                    fs.mkdirpSync(assetLocation);
                    if (response.ok) {
                        version = effectiveVersion;
                        data = await response.text();
                        fs.writeFileSync(`${assetLocation}/version`, version);
                        fs.writeFileSync(`${assetLocation}/data`, data);
                    }
                }

                if (data !== '') {
                    const depHandle = this.usedDependencies[packageName] ?? {
                        version,
                        digests: {}
                    };
                    depHandle.digests[filePath] = Utils.toHex(await Utils.hash(new TextEncoder().encode(data)));
                    this.usedDependencies[packageName] = depHandle;
                    return { data };
                }
            } catch (e) {
                if (packageName && packageVersion)
                    errorAcc.push(`Error getting content for '${packageName}@${packageVersion}': ${e?.toString()}`);
                else
                    errorAcc.push(`Error downloading content for node_modules package: ${e?.toString()}`);
            }
        }

        if (normalisedPath) {
            try {
                return { data: this.getContentSync(normalisedPath) };
            } catch (e) {
                errorAcc.push(`Error retreiving from dummyFs ${e?.toString()}`);
            }
        }

        if (errorAcc.length > 0)
            logger.debug(errorAcc.join('\n'), {
                parent: 'bmv'
            });
        else
            logger.debug(`Couldn't resolve content for '${normalisedPath}'`, {
                parent: 'bmv'
            });

        return { data: null };
    }

    async getRawContent(url: string): Promise<{ data: ArrayBuffer | null }> {

        const errorAcc: string[] = [];
        try {
            const response = await fetch(url, {
                agent: this.proxyAgent
            });
            if (response.ok)
                return { data: await response.arrayBuffer() };
            else
                errorAcc.push(`Error downloading raw content: ${response.statusText}`);
        } catch (e) {
            errorAcc.push(`Error downloading raw content: ${e?.toString()}`);
        }

        if (errorAcc.length > 0)
            logger.debug(errorAcc.join('\n'), {
                parent: 'bmv'
            });
        else
            logger.debug(`Couldn't resolve raw content for '${url}'`, {
                parent: 'bmv'
            });

        return { data: null };
    }

    async getRootList() {
        try {
            const content = await this.getContent('.');
            if (Array.isArray(content.data))
                return content.data.filter(c => c.type === 'file');
            else if (typeof content.data === 'object' && content.data?.type === 'file')
                return [content.data];
            else
                return [];
        } catch (e) {
            logger.debug(`Error getting root content list: ${e}`, {
                parent: 'bmv'
            });
            return [];
        }
    }

    async getTSDependencies() {

        const packageJsonResponse = await this.getContent('package.json', true);
        const packageJsonData = (Array.isArray(packageJsonResponse.data) ? packageJsonResponse.data[0] : packageJsonResponse.data)?.toString();

        let lockData: string | undefined;
        let lockDataType = LockfileType.yarn;

        const yarnLockResponse = await this.getContent('yarn.lock', true);
        lockData = (Array.isArray(yarnLockResponse.data) ? yarnLockResponse.data[0] : yarnLockResponse.data)?.toString();

        if (!lockData) {
            const packageLockResponse = await this.getContent('package-lock.json', true);
            lockDataType = LockfileType.npm;
            lockData = (Array.isArray(packageLockResponse.data) ? packageLockResponse.data[0] : packageLockResponse.data)?.toString();
        }

        if (!lockData) {
            const pnpmLockResponse = await this.getContent('pnpm-lock.yaml', true);
            lockDataType = LockfileType.pnpm;
            lockData = (Array.isArray(pnpmLockResponse.data) ? pnpmLockResponse.data[0] : pnpmLockResponse.data)?.toString();
        }

        if (!packageJsonData)
            throw new Error('No package.json found');

        if (lockData)
            this.dependenciesLocks = await buildDepTree(packageJsonData, lockData, true, lockDataType).catch(() => { return; }) ?? undefined;

        let packageJson: {
            optionalDependencies?: Record<string, string>;
            peerDependencies?: Record<string, string>;
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        } | undefined;
        try {
            packageJson = JSON.parse(packageJsonData.toString()) as typeof packageJson;
        } catch (e) {
            logger.error('Error while parsing package.json', e);
            throw new Error('Error while parsing package.json');
        }

        if (!packageJson)
            throw new Error('No package.json found');

        const addDependencies = (deps: PkgTree['dependencies']) => {
            Object.entries(deps).forEach(([name, dep]) => {
                if (dep.version) {
                    if (this.dependencies[name])
                        this.dependencies[name]?.push(dep.version);
                    else
                        this.dependencies[name] = [dep.version];
                }
                if (dep.dependencies)
                    addDependencies(dep.dependencies);
            });
        };

        if (this.dependenciesLocks)
            addDependencies(this.dependenciesLocks.dependencies);

        const packageJsonDependencies = Object.entries({
            ...packageJson.optionalDependencies,
            ...packageJson.peerDependencies,
            ...packageJson.devDependencies,
            ...packageJson.dependencies
        }).reduce((acc, [name, version]) => {
            if (acc[name])
                acc[name]?.push(version);
            else
                acc[name] = [version];
            return acc;
        }, {} as typeof this.dependencies);

        Object.entries(packageJsonDependencies).forEach(([name, versions]) => {
            const exitstingVersions = this.dependencies[name] ?? [];
            this.dependencies[name] = exitstingVersions.concat(versions);
        });
    }

    async build(): Promise<BuildOutput> {

        const rootContentList = await this.getRootList();
        const selectedEntryPoint = rootContentList.find(f => ['index.ts', 'index.wasm'].includes(f.name));

        if (selectedEntryPoint?.name === 'index.wasm' && selectedEntryPoint.download_url) {
            const wasmContent = (await this.getRawContent(selectedEntryPoint.download_url)).data ?? new ArrayBuffer(0);
            const wasmBuffer = Buffer.from(wasmContent);

            if (wasmBuffer.length) {

                this.usedDependencies = {
                    'index.wasm': {
                        version: this.options.application?.version ?? '0.0.0',
                        digests: {
                            'index.wasm': Utils.toHex(await Utils.hash(wasmBuffer))
                        }
                    }
                };

                try {
                    const workerCodeBase = watExtractorModuleFunction.toString();
                    const workerCode = workerCodeBase.substring(workerCodeBase.indexOf('=>') + 2).replaceAll('__toESM(require_wabt())', 'import("wabt")');
                    const worker = new Worker(workerCode, {
                        eval: true,
                        name: 'Klave WAT Extractor',
                        env: {},
                        argv: []
                    });

                    const wat = await new Promise<string | undefined>((resolve, reject) => {
                        worker.on('message', (message) => {
                            if (message.type === 'done')
                                resolve(message.wat);
                            reject(new Error('Wat extractor service failure'));
                        });
                        worker.postMessage({
                            type: 'start',
                            data: wasmContent
                        });
                    }).catch((error) => {
                        logger.debug('General failure: ' + error, {
                            parent: 'bmv'
                        });
                    });

                    // TODO: There is no support for WASM components in wasm2wat
                    // https://github.com/WebAssembly/wabt/issues/2405
                    logger.debug('Support for WASM components in wasm2wat: ' + wat, {
                        parent: 'bmv'
                    });

                    return {
                        success: true,
                        result: {
                            wasm: wasmBuffer,
                            routes: []
                        },
                        dependenciesManifest: this.usedDependencies,
                        stdout: '',
                        stderr: ''
                    };
                } catch (error) {
                    logger.debug('General failure: ' + error, {
                        parent: 'bmv'
                    });
                    return {
                        success: false,
                        error: serializeError(error as Error | ErrorObject),
                        dependenciesManifest: this.usedDependencies,
                        stdout: '',
                        stderr: ''
                    };
                }

            }

        } else if (selectedEntryPoint?.name === 'index.ts') {

            // We first need to fetch dependencies from package.json
            await this.getTSDependencies();

            const rootContent = await this.getContent(selectedEntryPoint.path);
            dummyMap['..ts'] = typeof rootContent?.data === 'string' ? rootContent.data : null;

            let compiledBinary = new Uint8Array(0);
            let compiledWAT: string | undefined;
            let compiledDTS: string | undefined;
            try {
                const compiler = await createCompiler();
                return new Promise<BuildOutput>((resolve) => {
                    compiler.on('message', (message) => {
                        if (message.type === 'start') {
                            this.usedDependencies['@klave/compiler'] = {
                                version: compiler.version,
                                digests: {
                                    ['git:*']: process.env['GIT_REPO_COMMIT'] ?? 'unknown'
                                }
                            };
                            this.usedDependencies['assemblyscript'] = {
                                version: compiler.ascVersion ?? message.version ?? 'unknown',
                                digests: {}
                            };
                        } else if (message.type === 'read') {
                            this.getContent(message.filename).then(response => {
                                compiler.postMessage({
                                    type: 'read',
                                    id: message.id,
                                    contents: typeof response.data === 'string' ? response.data : null
                                });
                            }).catch(() => { return; });
                        } else if (message.type === 'write') {
                            if ((message.filename).endsWith('.wasm'))
                                compiledBinary = message.contents ? Uint8Array.from(Buffer.from(message.contents)) : new Uint8Array(0);
                            if ((message.filename).endsWith('.wat'))
                                compiledWAT = message.contents ?? undefined;
                            if ((message.filename).endsWith('.d.ts'))
                                compiledDTS = message.contents ?? undefined;
                        } else if (message.type === 'diagnostic') {
                            //
                        } else if (message.type === 'errored') {
                            logger.debug(`Compiler errored: ${message.error?.message ?? message.error ?? 'Unknown'}`, {
                                parent: 'bmv'
                            });
                            compiler.terminate().finally(() => {
                                resolve({
                                    success: false,
                                    error: message.error,
                                    dependenciesManifest: this.usedDependencies,
                                    stdout: message.stdout ?? '',
                                    stderr: message.stderr ?? ''
                                });
                            }).catch(() => { return; });
                        } else if (message.type === 'done') {
                            let signature: sigstore.Bundle;
                            // TODO Add OIDC token
                            sigstore.sign(Buffer.from(compiledBinary), { identityToken: '' })
                                .then(bundle => {
                                    signature = bundle;
                                })
                                .catch(() => { return; })
                                .finally(() => {

                                    const matches = compiledDTS ? Array.from(compiledDTS.matchAll(/^export declare function (.*)\(/gm)) : [];
                                    const validRoutes = matches
                                        .map(match => match[1])
                                        .filter(Boolean)
                                        .filter(match => !['__new', '__pin', '__unpin', '__collect', 'register_routes'].includes(match));

                                    const output: BuildOutput = {
                                        success: true,
                                        result: {
                                            stats: message.stats,
                                            wasm: compiledBinary,
                                            routes: validRoutes,
                                            wat: compiledWAT,
                                            dts: compiledDTS,
                                            signature
                                        },
                                        dependenciesManifest: this.usedDependencies,
                                        stdout: message.stdout ?? '',
                                        stderr: message.stderr ?? ''
                                    };
                                    compiler.terminate().finally(() => {
                                        resolve(output);
                                    }).catch(() => { return; });
                                });
                        }
                    });
                });
            } catch (error) {
                logger.debug('General failure: ' + error, {
                    parent: 'bmv'
                });
                return {
                    success: false,
                    error: serializeError(error as Error | ErrorObject),
                    dependenciesManifest: this.usedDependencies,
                    stdout: '',
                    stderr: ''
                };
            }
        }
        return {
            success: false,
            error: new Error('No entry point found'),
            dependenciesManifest: this.usedDependencies,
            stdout: '',
            stderr: ''
        };
    }
}

export default BuildMiniVM;