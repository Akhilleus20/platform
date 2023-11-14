import { defineConfig as defineViteConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import federation from '@originjs/vite-plugin-federation';

export default defineViteConfig({
    cacheDir: '../../node_modules/.vite/ui',

    server: {
        host: 'localhost',
        fs: {
            // Allow serving files from one level up to the project root
            allow: ['..']
        }
    },

    preview: {
        host: 'localhost'
    },

    plugins: [
        react(),
        nxViteTsPaths(),
        federation({
            name: 'app',
            filename: 'remoteEntry.js',
            remotes: {
                remoteApp: 'http://localhost:4200/_next/static/chunks/remoteEntry.js',
                from: 'webpack'
            }
        })
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    define: {
        'import.meta.vitest': undefined
    },

    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest'
        },
        environment: 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
    }
});
