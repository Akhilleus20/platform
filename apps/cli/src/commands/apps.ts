import type { CommandBuilder } from 'yargs';
import fs from 'fs-extra';
import chalk from 'chalk';
import { KLAVE_JSON, KLAVE_LIGHT_BLUE, KLAVE_CYAN } from '../lib/constants';
import { KlaveJson } from '../lib/types';
import { getAppDataPrompts } from '../lib/prompts';
import prompts from 'prompts';
import path from 'path';
import { newStep } from '../lib/utils';

export const command: string = 'apps';
export const desc: string = '📘 Manage your honest applications';

export const builder: CommandBuilder = (yargs) =>
    yargs
        .command(
            'list',
            'List applications',
            listHandler
        )
        .command(
            'add',
            'Create an application in the project',
            addHandler
        )
        .command(
            'delete [name]',
            'Delete an application',
            (subYargs) => {
                subYargs.positional('name', {
                    type: 'string',
                    describe: 'Name of the application to delete'
                });
            }
        )
        .demandCommand(1, 'You need at least one command before moving on.')
        .help();

// Define a handler function for 'list' subcommand
const listHandler = (): void => {

    // Check if the file 'klave.json' exists in the current directory
    const fileExists = fs.existsSync(KLAVE_JSON);

    if (!fileExists) {
        console.log(`'${KLAVE_JSON}' does not exist in the current directory.`);
        process.exit(0);
    }

    const fileContent = fs.readFileSync(KLAVE_JSON, 'utf-8');

    try {
        const data = JSON.parse(fileContent) as KlaveJson;
        if (data.applications) {
            // Output information about the 'applications' field
            console.log(`Found ${KLAVE_CYAN(chalk.bold(data.applications.length + ' honest application' + (data.applications.length > 1 ? 's' : '')))}`);
            console.log();
            data.applications.forEach((app: any) => {
                console.log(`Name: ${KLAVE_LIGHT_BLUE(chalk.bold(app.name))}`);
                console.log(`Slug: ${KLAVE_LIGHT_BLUE(chalk.bold(app.slug))}`);
                console.log(`Version: ${KLAVE_LIGHT_BLUE(chalk.bold(app.version))}`);
                console.log(`Root Directory: ${KLAVE_LIGHT_BLUE(chalk.bold(app.rootDir))}`);
                console.log('---');
            });
        } else {
            console.log(`'applications' field not found in ${KLAVE_JSON}.`);
        }
    } catch (error) {
        console.error(`Error parsing ${KLAVE_JSON}`, error);
    }

};

// Define a handler function for 'add' subcommand
const addHandler = async () => {
    // Check if the file 'klave.json' exists in the current directory
    const fileExists = fs.existsSync(KLAVE_JSON);

    if (!fileExists) {
        console.log(`'${KLAVE_JSON}' does not exist in the current directory.`);
        process.exit(0);
    }

    const fileContent = fs.readFileSync(KLAVE_JSON, 'utf-8');
    const { name, slug } = await askForAppDataAsync();

    try {
        const data = JSON.parse(fileContent) as KlaveJson;

        // Check if an application with the same name already exists
        if (data.applications && data.applications.some(app => app.name === slug)) {
            console.log(`An application with the name '${slug}' already exists. Please choose a unique name.`);
            process.exit(0);
        }

        // Create a new application object
        const newApp = {
            name: name,
            slug: slug,
            version: '0.0.1',
            rootDir: path.join('apps', slug)
        };

        if (!data.applications) {
            data.applications = [];
        }

        data.applications.push(newApp);

        // Write updated 'klave.json' file
        fs.writeFileSync(KLAVE_JSON, JSON.stringify(data, null, 2));

        // Create a new folder for the app
        const newAppPath = path.join('apps', slug);
        fs.mkdirSync(newAppPath);

        // Create the required files inside the app folder
        await createTemplateAsync(newAppPath);

        console.log();
        console.log(`✅ Successfully created a new honest app '${slug}'.`);

    } catch (error) {
        console.error(`Error parsing ${KLAVE_JSON}`, error);
    }

};

/**
 * Asks the user for some data necessary to create a new honest app.
 */
async function askForAppDataAsync(): Promise<{ name: string, slug: string}> {
    const promptQueries = await getAppDataPrompts();

    // Stop the process when the user cancels/exits the prompt.
    const onCancel = () => {
        process.exit(0);
    };

    const { name, slug } = await prompts(promptQueries, { onCancel });

    return {
        name,
        slug
    };
}

/**
 * Create new Klave app.
 */
async function createTemplateAsync(targetDir: string): Promise<string> {
    return await newStep('Creating template files', async (step) => {

        const sourceDir = path.join(__dirname, '../../', 'template/apps/my-honest-app', '.');
        await fs.copy(sourceDir, targetDir, {
            filter: () => true,
            overwrite: false,
            errorOnExist: true
        });

        step.succeed('Creating a new honest app...');

        return path.join(targetDir, 'temp_dl_folder');
    });
}