import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import html2pug from './plugins/vite-plugin-html2pug.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Pinned to Vite 7.x (classic Rollup + esbuild). Vite 8's default bundler
// (Rolldown/oxc) has a materially different config surface and was ruled
// out during the Phase 2 spike — see docs/plan notes for details. Revisit
// in a follow-up "Phase 3" once the plugin ecosystem catches up.

export default defineConfig(({ mode }) => {
    // Vite's automatic .env loading only populates `import.meta.env` for
    // client code — it does NOT merge `.env` into this file's `process.env`
    // (that only happens for whatever's already in the real shell
    // environment, e.g. `cross-env ANALYZE=true` in package.json's
    // `analyze` script). `loadEnv('', ...)` is Vite's documented way to
    // read *all* `.env` keys (not just `envPrefix`-matching ones) for use
    // here in the config itself. Real shell/process env still wins over the
    // `.env` file (see loadEnv's implementation), so `cross-env ANALYZE=true`
    // continues to work exactly as before.
    const configEnv = loadEnv(mode, process.cwd(), '')
    const shouldAnalyze = configEnv.ANALYZE === 'true'
    const shouldSourceMap = configEnv.GENERATE_SOURCEMAP !== 'false'

    return {
        plugins: [
            react(),
            // Only emits index.pug for production builds (apply: 'build' inside the plugin).
            html2pug(),
            shouldAnalyze &&
                visualizer({
                    filename: 'reports/bundle-report.html',
                    // Keep outside build/atlas so the report is never deployed —
                    // same rationale as the old webpack-bundle-analyzer setup.
                    open: false,
                    gzipSize: true,
                    brotliSize: true,
                }),
        ].filter(Boolean),

        // Production is always built with an empty base ("/"). The actual
        // deployment sub-path (e.g. "/tools/atlas") is applied per-request at
        // runtime by the Express server (scripts/start-prod.js), which rewrites
        // asset URLs using window.APP_CONFIG.PUBLIC_URL. See AGENTS.md and
        // src/core/runtimeConfig.js. Do NOT read process.env.PUBLIC_URL here —
        // baking a sub-path into the build would break "build once, deploy
        // anywhere".
        base: '/',

        // Expose REACT_APP_* (legacy CRA convention, kept to avoid a repo-wide
        // env var rename) and VITE_* (Vite's own convention, for anything new)
        // via import.meta.env.
        // 'PUBLIC_URL' is an exact-match entry here (Vite treats envPrefix
        // entries as string prefixes, and a key trivially "starts with" itself)
        // — kept as the bare key (not REACT_APP_PUBLIC_URL) so the existing
        // .env `PUBLIC_URL` var (shared with scripts/start-prod.js) doesn't
        // need to be renamed.
        envPrefix: ['REACT_APP_', 'VITE_', 'PUBLIC_URL'],

        resolve: {
            alias: {
                'react-native': 'react-native-web',
                // Alias the vendored UMD/CJS bundles to fake bare specifiers so
                // Vite's dependency pre-bundler (optimizeDeps, below) treats
                // them like real node_modules packages. Vite's lightweight
                // on-demand dev transform for arbitrary *relative-imported*
                // source files doesn't reliably run these through esbuild's
                // real CJS-to-ESM conversion (cjs-module-lexer can't always
                // find exports buried inside a minified UMD wrapper) — routing
                // through optimizeDeps gives dev mode the same robust esbuild
                // interop that Rollup's commonjs plugin gives the prod build
                // (see build.commonjsOptions below).
                '@vendor/react-filter-box': path.resolve(
                    __dirname,
                    'src/pages/Search/Panels/FiltersPanel/subcomponents/AdvancedFilter/react-filter-box-customized/react-filter-box.js'
                ),
                '@vendor/streamsaver-ponyfill': path.resolve(
                    __dirname,
                    'src/external/streamsaver-helpers/ponyfill.min.js'
                ),
            },
        },

        // This codebase (CRA-era) has JSX inside .js files, not .jsx.
        // @vitejs/plugin-react's Babel transform handles that for the main
        // module graph, but Vite's own esbuild-based HTML-entry/minify passes
        // don't know about it unless told explicitly.
        esbuild: {
            loader: 'jsx',
            include: /src\/.*\.jsx?$/,
            exclude: [],
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: { '.js': 'jsx' },
            },
            // See the '@vendor/*' aliases above — this forces these vendored
            // UMD bundles through esbuild's dependency pre-bundler.
            include: ['@vendor/react-filter-box', '@vendor/streamsaver-ponyfill'],
        },

        build: {
            outDir: 'build/atlas',
            sourcemap: shouldSourceMap,
            chunkSizeWarningLimit: 1000,
            commonjsOptions: {
                // Rollup's commonjs plugin only scans node_modules by default.
                // These are vendored UMD/CJS bundles that live in src/ and need
                // to be explicitly included so `import`/`require` interop works:
                //   - react-filter-box-customized/react-filter-box.js (vendored,
                //     customized fork of the react-filter-box UMD build)
                //   - streamsaver-helpers/{ponyfill.min,Blob}.js
                include: [/node_modules/, /react-filter-box-customized/, /streamsaver-helpers/],
                transformMixedEsModules: true,
            },
            rollupOptions: {
                output: {
                    // Mirror the old webpack output layout (static/js, static/css,
                    // static/media) for consistency with docs/deploy expectations.
                    // Folder names don't matter to the html2pug plugin's regex
                    // (it's folder-agnostic), but keeping them matches AGENTS.md.
                    entryFileNames: 'static/js/[name].[hash].js',
                    chunkFileNames: 'static/js/[name].[hash].chunk.js',
                    assetFileNames: (assetInfo) => {
                        const name = assetInfo.names?.[0] || assetInfo.name || ''
                        if (name.endsWith('.css')) {
                            return 'static/css/[name].[hash][extname]'
                        }
                        return 'static/media/[name].[hash][extname]'
                    },
                    // Simple vendor/app split so we don't ship a single multi-MB
                    // chunk (Vite/Rollup doesn't auto-split like webpack's
                    // splitChunks did). Further tuning (e.g. splitting mui/leaflet
                    // into their own chunks) is left as future optimization.
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            return 'vendor'
                        }
                    },
                },
            },
        },

        server: {
            port: 8500,
        },

        preview: {
            port: 8500,
        },
    }
})
