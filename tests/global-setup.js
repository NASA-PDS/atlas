/**
 * Playwright global setup — runs once before all test suites.
 *
 * Atlas has no database, so this file only ensures the production build
 * exists. The actual server start is handled by `webServer` in
 * playwright.config.js.
 *
 * Unlike the old webpack build, Vite's `base` is hardcoded to `/` in
 * `vite.config.js` — it does not read `PUBLIC_URL` at build time, so
 * there's no `publicPath`-baking / `dotenv-expand` hazard to work around
 * here. `PUBLIC_URL` is applied purely at runtime, by the Express server
 * in `scripts/start-prod.js` injecting `window.APP_CONFIG` into
 * `index.pug` (see `plugins/vite-plugin-html2pug.js`). A plain
 * `npm run build` is all that's needed.
 */

import { existsSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

export default async function globalSetup() {
    const cwd = process.cwd()
    const buildDir = resolve(cwd, 'build/atlas')

    if (!existsSync(buildDir)) {
        console.log('[global-setup] Build not found, running npm run build...')
        execSync('npm run build', { stdio: 'inherit', cwd })
    }
    console.log('[global-setup] Build ready.')
}
