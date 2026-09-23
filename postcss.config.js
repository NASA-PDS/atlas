// Externalized from the old config/webpack.config.js `postcssOptions` block
// (Phase 2 Vite migration) so Vite's built-in PostCSS support picks it up.
// Vite auto-discovers this file — no wiring needed in vite.config.js.
module.exports = {
    plugins: {
        'postcss-flexbugs-fixes': {},
        'postcss-preset-env': {
            autoprefixer: {
                flexbox: 'no-2009',
            },
            stage: 3,
        },
    },
}
