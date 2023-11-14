// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const NextFederationPlugin = require('@module-federation/nextjs-mf');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
    nx: {
        // Set this to true if you would like to use SVGR
        // See: https://github.com/gregberge/svgr
        svgr: false
    },
    webpack(config) {
        config.plugins.push(
            new NextFederationPlugin({
                name: 'remoteApp',
                library: { type: 'modules', name: 'remoteApp' },
                filename: 'static/chunks/remoteEntry.js',
                exposes: {
                    // specify exposed pages and components
                    './KlaveWebsite': './pages/_app.tsx'
                },
                shared: {
                    'react': { singleton: true },
                    'react-dom': { singleton: true }
                }
            })
        );

        return config;
    }
};

const plugins = [
    // Add more Next.js plugins to this list if needed.
    withNx
];

module.exports = composePlugins(...plugins)(nextConfig);
