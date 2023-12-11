const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('../../tailwind.preset.js')],
    content: [
        join(__dirname, 'src/**/*.{ts,tsx}'),
        ...createGlobPatternsForDependencies(__dirname)
    ],
    theme: {
        extend: {}
    },
    plugins: []
};

