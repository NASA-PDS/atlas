"use strict";

import fs from "node:fs";
import path from "node:path";
import { htmlToPug } from "../config/build-utils.js";

/**
 * Vite build plugin — ports the webpack-era HTML2PugPlugin.
 *
 * After `vite build` writes `index.html` to disk, converts it to
 * `index.pug` so the Express server (scripts/start-prod.js) can render it
 * per-request with:
 *   - `window.APP_CONFIG` injected as a runtime object (build once, deploy
 *     anywhere — see AGENTS.md / src/core/runtimeConfig.js)
 *   - CSP nonces on every <script>/<link> tag
 *   - absolute asset paths (`/static/...`) rewritten to `publicUrl + '/...'`
 *     so the app can be served from a sub-path at request time
 *
 * Only runs for production builds (`apply: 'build'`), matching the old
 * plugin's `isEnvProduction && new HTML2PugPlugin(...)` gating.
 */
export default function html2pugPlugin() {
    let outDir = "";

    return {
        name: "html2pug",
        apply: "build",
        configResolved(resolvedConfig) {
            outDir = path.isAbsolute(resolvedConfig.build.outDir)
                ? resolvedConfig.build.outDir
                : path.join(resolvedConfig.root, resolvedConfig.build.outDir);
        },
        closeBundle() {
            const htmlPath = path.join(outDir, "index.html");
            if (!fs.existsSync(htmlPath)) {
                return;
            }

            const htmlStr = fs.readFileSync(htmlPath, "utf8");
            let pugStr = htmlToPug(htmlStr);

            // Replace absolute paths with the publicUrl variable for runtime
            // configuration. The production build always runs with an empty
            // base ("/"), so paths are always root-absolute at this point —
            // see vite.config.js `base: '/'` and AGENTS.md's PUBLIC_URL notes.
            pugStr = pugStr.replace(/href=['"]\/([^'"]*)['"]/g, "href=publicUrl + '/$1'");
            pugStr = pugStr.replace(/src=['"]\/([^'"]*)['"]/g, "src=publicUrl + '/$1'");

            // Inject runtime config script at the end of <head>.
            // Find the title tag and insert the script after it.
            const titleMatch = pugStr.match(/(.*title .*\n)/);
            if (titleMatch) {
                const insertAfter = titleMatch[0];
                pugStr = pugStr.replace(
                    insertAfter,
                    insertAfter + `    script(nonce=nonce)\n      | window.APP_CONFIG = !{runtimeConfig};\n`
                );
            }

            const elementStringsToNonce = [...pugStr.matchAll(/(script|link)\((.*?)\)/g)];

            elementStringsToNonce.forEach((elmStr) => {
                const re = new RegExp(elmStr[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
                let newElmStr = elmStr[0];
                if (!newElmStr.includes("nonce=")) {
                    newElmStr = newElmStr.replace(/\)/, ", nonce=nonce)");
                }
                pugStr = pugStr.replace(re, newElmStr);
            });
            // Handle inline scripts without parentheses (e.g., "script (()=>...")
            pugStr = pugStr.replace(/\bscript (\()/g, "script(nonce=nonce) $1");

            fs.writeFileSync(path.join(outDir, "index.pug"), pugStr);
        },
    };
}
