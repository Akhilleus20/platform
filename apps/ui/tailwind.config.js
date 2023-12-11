const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('../../tailwind.preset.js')],
    content: [
        join(
            __dirname,
            '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
        ),
        ...createGlobPatternsForDependencies(__dirname)
    ],
    darkMode: process.env.NODE_ENV === 'development' ? 'media' : 'class',
    important: true,
    theme: {
        extend: {}
    },
    daisyui: process.env.NODE_ENV === 'development' ? {
        logs: true,
        themes: true
    } : {
        themes: false,
        darkTheme: 'light'
    },
    plugins: []
};
