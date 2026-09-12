'use strict'

// NOTE: unlike the old CJS script, this assignment does NOT guarantee
// NODE_ENV/BABEL_ENV are set before `config/env.js` runs its "NODE_ENV is
// required" check. ESM `import` declarations (including the transitive one
// pulled in below via `config/webpack.config.js` -> `config/env.js`) are
// hoisted and evaluated before this file's own top-level statements, no
// matter where they're textually written. The actual guarantee comes from
// `cross-env NODE_ENV=production BABEL_ENV=production` in the `build` /
// `build:eslint` npm scripts in package.json. Keep these assignments too,
// for direct `node scripts/build.js` invocation and to preserve intent.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    throw err
})

// Ensure environment variables are read.
import '../config/env.js'

import path from 'node:path'
import chalk from 'chalk'
import fs from 'fs-extra'
import webpack from 'webpack'
import configFactory from '../config/webpack.config.js'
import paths from '../config/paths.js'
import {
    formatWebpackMessages,
    printBuildError,
    FileSizeReporter,
    checkBrowsers,
} from '../config/build-utils.js'

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild
const useYarn = fs.existsSync(paths.yarnLockFile)

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

const isInteractive = process.stdout.isTTY

// Warn and crash if required files are missing
if (!fs.existsSync(paths.appHtml) || !fs.existsSync(paths.appIndexJs)) {
    console.log(chalk.red('Could not find one of the required files:'))
    console.log(chalk.red('  ' + paths.appHtml))
    console.log(chalk.red('  ' + paths.appIndexJs))
    process.exit(1)
}

// Generate configuration
const config = configFactory('production')

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
checkBrowsers(paths.appPath, isInteractive)
    .then(() => {
        // First, read the current file sizes in build directory.
        // This lets us display how much they changed later.
        return measureFileSizesBeforeBuild(paths.appBuild)
    })
    .then((previousFileSizes) => {
        // Remove all content but keep the directory so that
        // if you're in it, you don't end up in Trash
        fs.emptyDirSync(paths.appBuild)
        // Merge with the public folder
        copyPublicFolder()
        // Start the webpack build
        return build(previousFileSizes)
    })
    .then(
        ({ stats, previousFileSizes, warnings }) => {
            if (warnings.length) {
                console.log(chalk.yellow('Compiled with warnings.\n'))
                console.log(warnings.join('\n\n'))
                console.log(
                    '\nSearch for the ' +
                        chalk.underline(chalk.yellow('keywords')) +
                        ' to learn more about each warning.'
                )
                console.log(
                    'To ignore, add ' +
                        chalk.cyan('// eslint-disable-next-line') +
                        ' to the line before.\n'
                )
            } else {
                console.log(chalk.green('Compiled successfully.\n'))
            }

            console.log('File sizes after gzip:\n')
            printFileSizesAfterBuild(
                stats,
                previousFileSizes,
                paths.appBuild,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            )
            console.log()

            const buildFolder = path.relative(process.cwd(), paths.appBuild)
            console.log(`The ${chalk.cyan(buildFolder)} folder is ready to be deployed.`)
        },
        (err) => {
            const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true'
            if (tscCompileOnError) {
                console.log(
                    chalk.yellow(
                        'Compiled with the following type errors (you may want to check these before deploying your app):\n'
                    )
                )
                printBuildError(err)
            } else {
                console.log(chalk.red('Failed to compile.\n'))
                printBuildError(err)
                process.exit(1)
            }
        }
    )
    .catch((err) => {
        if (err && err.message) {
            console.log(err.message)
        }
        process.exit(1)
    })

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
    // We used to support resolving modules according to `NODE_PATH`.
    // This now has been deprecated in favor of jsconfig/tsconfig.json
    // This lets you use absolute paths in imports inside large monorepos:
    if (process.env.NODE_PATH) {
        console.log(
            chalk.yellow(
                'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
            )
        )
        console.log()
    }

    console.log('Creating an optimized production build...')

    const compiler = webpack(config)
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages
            if (err) {
                if (!err.message) {
                    return reject(err)
                }

                let errMessage = err.message

                // Add additional information for postcss errors
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage +=
                        '\nCompileError: Begins at CSS selector ' + err['postcssNode'].selector
                }

                messages = formatWebpackMessages({
                    errors: [errMessage],
                    warnings: [],
                })
            } else {
                messages = formatWebpackMessages(
                    stats.toJson({ all: false, warnings: true, errors: true })
                )
            }
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1
                }
                return reject(new Error(messages.errors.join('\n\n')))
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nTreating warnings as errors because process.env.CI = true.\n' +
                            'Most CI servers set it automatically.\n'
                    )
                )
                return reject(new Error(messages.warnings.join('\n\n')))
            }

            // Pug render index.html

            return resolve({
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            })
        })
    })
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: (file) => file !== paths.appHtml,
    })
}
