const path = require('path')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const axios = require('axios')
const helmet = require('helmet')
const uuidv4 = require('uuid').v4
const bodyParser = require('body-parser')
const compression = require('compression')
const paths = require('../config/paths')

const atlasPackageJSON = require('../package.json')

process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

require('dotenv').config()

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

// Runtime configuration - read from environment variables at server startup
const runtimeConfig = {
    PUBLIC_URL: process.env.PUBLIC_URL || '',
    DOMAIN: process.env.REACT_APP_DOMAIN || '',
    API_URL: process.env.REACT_APP_API_URL || '',
    ES_URL: process.env.REACT_APP_ES_URL || '',
    FOOTPRINT_URL: process.env.REACT_APP_FOOTPRINT_URL || '',
    IMAGERY_URL: process.env.REACT_APP_IMAGERY_URL || '',
    REGISTRY_URL: process.env.REACT_APP_REGISTRY_URL || '',
    DOI_URL: process.env.REACT_APP_DOI_URL || '',
}

const app = express()
// const app = express.default();
app.disable('x-powered-by')

// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
// Note: Static assets are served later in the middleware chain

const corsOptions = {}
if (process.env.ACCESS_CONTROL_ALLOW_ORIGIN)
    corsOptions.origin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN

app.use(cors(corsOptions))

// gzip!!
if (process.env.NODE_ENV === 'production') app.use(compression({ filter: shouldCompress }))

function shouldCompress(req, res) {
    // Disable compression of images since they're already compressed
    if (req.headers['content-type'] && req.headers['content-type'].includes('image')) return false
    // fallback to standard filter function
    return compression.filter(req, res)
}

// Sets "Strict-Transport-Security: max-age=123456; includeSubDomains"
app.use(
    helmet.hsts({
        maxAge: 15552000, //180days
    })
)

app.use((req, res, next) => {
    res.locals.nonce = uuidv4()
    next()
})
const csp = {
    directives: {
        defaultSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        imgSrc: ['*', 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        styleSrcElem: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'data:'],
        mediaSrc: [
            "'self'",
            '*.jpl.nasa.gov',
            '*.amazonaws.com',
            '*.cloudfront.net',
            '*.arizona.edu',
            'data:',
            'blob:',
        ],
        connectSrc: ['*.jpl.nasa.gov', '*.amazonaws.com', '*.cloudfront.net', '*.arizona.edu'],
        frameAncestors: "'self'",
    },
}
if (process.env.NODE_ENV === 'development' || process.env.DISABLE_CSP === 'true')
    csp.directives = {}
else app.use(helmet.contentSecurityPolicy(csp))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/_health', (req, res) => {
    res.status(200).send({
        status: 'healthy',
        message: 'Alive and well!',
        venue: process.env.NODE_ENV,
        version: {
            atlas: atlasPackageJSON.version,
        },
    })
})

app.post('/verify', (req, res) => {
    const VERIFY_URL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${req.body['g-recaptcha-response']}`
    return axios
        .post(VERIFY_URL)
        .then((res) => res.json())
        .then((json) => res.send(json))
        .catch((err) => res.send('error'))
})

app.get('/robots.txt', (req, res) => {
    res.type('text/plain')
    res.send('User-agent: *\nAllow: /')
})

const mitmPath = runtimeConfig.PUBLIC_URL
    ? `${runtimeConfig.PUBLIC_URL}/streamsaver/mitm.html`
    : '/streamsaver/mitm.html'
const pingPath = runtimeConfig.PUBLIC_URL
    ? `${runtimeConfig.PUBLIC_URL}/streamsaver/ping.html`
    : '/streamsaver/ping.html'

app.get(['/streamsaver/mitm.html', mitmPath], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    fs.readFile(path.join(paths.appBuild, '/streamsaver/mitm.html'), 'utf8', function (err, html) {
        let newHTML =
            typeof html === 'string'
                ? html
                      .replace(/<script/g, '<script nonce="' + res.locals.nonce + '"')
                      .replace(/<style/g, '<style nonce="' + res.locals.nonce + '"')
                : 'Not Found'
        res.send(newHTML)
    })
})
app.get(['/streamsaver/ping.html', pingPath], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    fs.readFile(path.join(paths.appBuild, '/streamsaver/ping.html'), 'utf8', function (err, html) {
        let newHTML =
            typeof html === 'string'
                ? html
                      .replace(/<script/g, '<script nonce="' + res.locals.nonce + '"')
                      .replace(/<style/g, '<style nonce="' + res.locals.nonce + '"')
                : 'Not Found'
        res.send(newHTML)
    })
})

// Pug is used to render atlas pages.
app.set('view engine', 'pug')

// Redirect root to /search
const rootPath = runtimeConfig.PUBLIC_URL || '/'
app.get(rootPath, (req, res) => {
    const searchRedirectPath = runtimeConfig.PUBLIC_URL
        ? `${runtimeConfig.PUBLIC_URL}/search`
        : '/search'
    res.redirect(307, searchRedirectPath)
})

// Build route array with PUBLIC_URL prefix (excluding root)
const baseRoutes = ['/search', '/record', '/cart', '/archive-explorer*']
const appRoutes = runtimeConfig.PUBLIC_URL
    ? [...baseRoutes, ...baseRoutes.map((route) => `${runtimeConfig.PUBLIC_URL}${route}`)]
    : baseRoutes

app.get(appRoutes, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.render(path.join(paths.appBuild, 'index.pug'), {
        nonce: res.locals.nonce,
        runtimeConfig: JSON.stringify(runtimeConfig),
        publicUrl: runtimeConfig.PUBLIC_URL,
    })
})

// Normalize favicon and manifest with PUBLIC_URL prefix
const faviconPath = runtimeConfig.PUBLIC_URL
    ? `${runtimeConfig.PUBLIC_URL}/favicon.png`
    : '/favicon.png'
const manifestPath = runtimeConfig.PUBLIC_URL
    ? `${runtimeConfig.PUBLIC_URL}/manifest.json`
    : '/manifest.json'
app.use(faviconPath, express.static(path.join(paths.appBuild, 'favicon.png')))
app.use(manifestPath, express.static(path.join(paths.appBuild, 'manifest.json')))

// Serve Atlas with PUBLIC_URL prefix
// Serve all static assets (CSS, JS, images, etc.) at the PUBLIC_URL prefix
if (runtimeConfig.PUBLIC_URL) {
    app.use(runtimeConfig.PUBLIC_URL, express.static(paths.appBuild))
} else {
    app.use(express.static(paths.appBuild))
}

// Serve route-specific static files (if needed)
const searchPath = runtimeConfig.PUBLIC_URL ? `${runtimeConfig.PUBLIC_URL}/search` : '/search'
const recordPath = runtimeConfig.PUBLIC_URL ? `${runtimeConfig.PUBLIC_URL}/record` : '/record'
const cartPath = runtimeConfig.PUBLIC_URL ? `${runtimeConfig.PUBLIC_URL}/cart` : '/cart'
const archiveExplorerPath = runtimeConfig.PUBLIC_URL
    ? `${runtimeConfig.PUBLIC_URL}/archive-explorer`
    : '/archive-explorer'
app.use(
    [searchPath, recordPath, cartPath, archiveExplorerPath],
    express.static(path.join(paths.appBuild, 'atlas'))
)

// Serve Documentation with PUBLIC_URL prefix
const docBasePath = runtimeConfig.PUBLIC_URL
    ? `${runtimeConfig.PUBLIC_URL}/documentation`
    : '/documentation'

// Middleware to rewrite documentation HTML files to inject correct base path
if (runtimeConfig.PUBLIC_URL) {
    app.use(docBasePath, (req, res, next) => {
        // Only process HTML files
        if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
            const fs = require('fs')
            let filePath = path.join(paths.docBuild, req.path)

            // If path doesn't end with .html and is not /, append index.html
            if (!req.path.endsWith('.html') && !req.path.includes('.')) {
                filePath = path.join(filePath, 'index.html')
            }

            if (fs.existsSync(filePath)) {
                fs.readFile(filePath, 'utf8', (err, html) => {
                    if (err) {
                        return next()
                    }

                    // Replace /documentation/ with /beta/documentation/ in HTML
                    const modifiedHtml = html
                        .replace(
                            /href="\/documentation\//g,
                            `href="${runtimeConfig.PUBLIC_URL}/documentation/`
                        )
                        .replace(
                            /src="\/documentation\//g,
                            `src="${runtimeConfig.PUBLIC_URL}/documentation/`
                        )
                        .replace(
                            /"\/documentation\//g,
                            `"${runtimeConfig.PUBLIC_URL}/documentation/`
                        )

                    res.setHeader('Content-Type', 'text/html; charset=utf-8')
                    res.send(modifiedHtml)
                })
                return
            }
        }
        next()
    })
}

app.use([docBasePath], express.static(paths.docBuild))

app.use((err, _req, res, _next) =>
    res.status(404).json({
        status: 'error',
        message: err.message,
    })
)

app.listen(process.env.PORT || 8500, () => {
    console.log(
        `[${new Date().toISOString()}]`,
        `App is running: http://localhost:${process.env.PORT || 8500}`
    )
})
