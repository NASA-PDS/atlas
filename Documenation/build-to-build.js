const fs = require('fs-extra')
fs.move(`./build`, `../build/documentation`, { overwrite: true })
