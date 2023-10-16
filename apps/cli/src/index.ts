import yargs from 'yargs';
import figlet from 'figlet';
import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import { KLAVE_CYAN } from './lib/constants';

const usage = 'klave [command] [...flags]';

console.log(figlet.textSync('Klave'));
console.log(KLAVE_CYAN(chalk.bold('Welcome to Klave CLI!')));
console.log();

yargs(hideBin(process.argv))
    .usage(usage)
    .commandDir('commands')
    .alias({ h: 'help' })
    .alias({ v: 'version' })
    .demandCommand()
    .help()
    .argv;

