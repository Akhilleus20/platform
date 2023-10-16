import { PromptObject } from 'prompts';

/**
 * Possible command options.
 */
export type CommandOptions = {
    target: string;
    source?: string;
    withReadme: boolean;
    withChangelog: boolean;
    example: boolean;
};

/**
 * Represents an object that is passed to `ejs` when rendering the template.
 */
export type SubstitutionData = {
    project: {
        slug: string;
        name: string;
        version: string;
        description: string;
        package: string;
    };
    author: string;
    license: string;
    repo: string;
};

export type KlaveJson = {
    version: string;
    branch: string;
    applications: HonestApplication[];
};

export type HonestApplication = {
    name: string;
    slug: string;
    version: string;
    rootDir: string;
    id?: string;
};

export type CustomPromptObject = PromptObject & {
    name: string;
    resolvedValue?: string | null;
};

export type Answers = Record<string, string>;
