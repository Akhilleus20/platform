import type { Arguments, CommandBuilder } from 'yargs';
import { openURL } from '../lib/utils';
import { KLAVE_URL } from '../lib/constants';

type Options = {
    browserless: boolean | undefined;
};

export const command: string = 'login';
export const desc: string = '📘 Login to Klave';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
    yargs
        .options({
            browserless: { type: 'boolean' }
        });

export const handler = (argv: Arguments<Options>) => {
    const { browserless } = argv;

    if (browserless)
        console.log('Sorry! Browserless login is not yet supported!');
    else
        openURL(KLAVE_URL);

    process.exit(0);
};