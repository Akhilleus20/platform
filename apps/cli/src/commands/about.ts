import fs from 'fs-extra';

export const command: string = 'about';
export const desc: string = '📘 Display some details about the honest application';

// Define a handler function for your new command
export const handler = (): void => {
    const fileName = 'klave.json';

    // Check if the file 'klave.json' exists in the current directory
    const fileExists = fs.existsSync(fileName);

    if (fileExists) {
        console.log(`'${fileName}' exists in the current directory.`);
    } else {
        console.log(`'${fileName}' does not exist in the current directory.`);
    }
};