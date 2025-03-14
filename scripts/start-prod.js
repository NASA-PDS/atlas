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

const app = express()
// const app = express.default();
app.disable('x-powered-by')

// Use Nginx or Apache to serve static assets in production or remove the if() around the following
// lines to use the express.static middleware to serve assets for production (not recommended!)
//if (process.env.NODE_ENV === 'development')
app.use(paths.appPublic, express.static(path.join(paths.appBuild, paths.appPublic)))

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

app.get('/atlas/streamsaver/mitm.html', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    fs.readFile(
        path.join(paths.appBuild, '/atlas/streamsaver/mitm.html'),
        'utf8',
        function (err, html) {
            console.log(err, html)
            let newHTML = html
                .replace(/<script/g, '<script nonce="' + res.locals.nonce + '"')
                .replace(/<style/g, '<style nonce="' + res.locals.nonce + '"')
            res.send(newHTML)
        }
    )
})
app.get('/atlas/streamsaver/ping.html', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    fs.readFile(
        path.join(paths.appBuild, '/atlas/streamsaver/ping.html'),
        'utf8',
        function (err, html) {
            console.log(err, html)
            let newHTML = html
                .replace(/<script/g, '<script nonce="' + res.locals.nonce + '"')
                .replace(/<style/g, '<style nonce="' + res.locals.nonce + '"')
            res.send(newHTML)
        }
    )
})

// Pug is used to render atlas pages.
app.set('view engine', 'pug')

app.get(['/', '/search', '/record', '/cart', '/archive-explorer*'], (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.render(path.join(paths.appBuild, 'index.pug'), {
        nonce: res.locals.nonce,
    })
})

// Normalize favicon and manifest
app.use('/favicon.png', express.static(path.join(paths.appBuild, 'favicon.png')))
app.use('/manifest.json', express.static(path.join(paths.appBuild, 'manifest.json')))

// Serve Atlas
app.use(express.static(paths.appBuild))
app.use(
    ['/search', '/record', '/cart', '/archive-explorer'],
    express.static(path.join(paths.appBuild, 'atlas'))
)
app.use(['/documentation'], express.static(paths.docBuild))

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
