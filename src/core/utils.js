import axios from 'axios'

import { domain, endpoints, RELATED_MAPPINGS, AVAILABLE_URI_SIZES } from './constants'
/**
 * Creating simple json object as header
 *
 * @param {Object} options
 * @param {boolean} options.accept500
 * @param {Object} options.params - additional header parameters
 * @param {function(progress)} options.uploadProgress
 * @param {Object} options.cancelRef - will fill this object with a function to cancel the request
 * @return {{headers: {Authorization: string}}}
 */
export function getHeader(options) {
    options = options || {}

    const header = {
        headers: {
            Authorization: `Bearer ${window.token}`,
        },
        validateStatus: (status) => {
            //console.log(status)
            return true // default
        },
    }

    if (options.params) {
        header.params = options.params
    }
    if (options.contentJSON) {
        header.headers['Content-Type'] = 'application/json'
    }
    if (options.uploadProgress && typeof options.uploadProgress === 'function')
        header.onUploadProgress = (progressEvent) => {
            const progress = parseInt(
                Math.round((progressEvent.loaded * 100) / progressEvent.total),
                10
            )
            options.uploadProgress(progress)
        }
    if (options.cancelRef && typeof options.cancelRef === 'object')
        header.cancelToken = new axios.CancelToken(function executor(c) {
            // An executor function receives a cancel function as a parameter
            options.cancelRef.cancel = c
        })

    return header
}

export const getPDSUrl = (url, release_id, size) => {
    if (!url || url.indexOf('http') === 0) return url
    let possibleSize = ''
    if (size && Object.keys(AVAILABLE_URI_SIZES).includes(size)) possibleSize = `:${size}`
    return `${domain}${endpoints.data}/${url}${
        release_id != null ? `::${release_id}` : ''
    }${possibleSize}`
}
export const getRedirectedUrl = async (url) => {
    return new Promise(async (resolve, reject) => {
        fetch(`${url}?output=url`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })
            .then((res) => res.json())
            .then((json) => {
                resolve(json.url)
            })
            .catch((err) => {
                reject()
            })
    })
}

export const splitUri = (uri, get) => {
    if (uri == null) return get == null ? {} : ''

    const split = uri.split(':')

    const s = {
        domain: split[0],
        pds_format: split[1],
        mission: split[2],
        spacecraft: split[3],
        relativeUrl: split[4],
        bundle: split[4] && split[4].length > 0 ? split[4].split('/')[1] : null,
        size: split[5],
    }
    if (get) {
        if (get == 'spacecraft') return `${s.domain}:${s.pds_format}:${s.mission}:${s.spacecraft}:`
        if (get == 'spacecraft/')
            return `${s.domain}:${s.pds_format}:${s.mission}:${s.spacecraft}:/`
    }
    return s
}

export const getFilename = (url) => {
    if (!url || typeof url != 'string') return url
    return url.split('/').pop()
}

/**
 * Traverses an object with an array of keys
 * @param {*} obj
 * @param {*} keyArray
 */
export const getIn = (obj, keyArray, notSetValue) => {
    if (obj == null) return notSetValue != null ? notSetValue : null
    if (keyArray == null) return notSetValue != null ? notSetValue : null
    if (typeof keyArray === 'string') keyArray = keyArray.split('.')
    let object = Object.assign({}, obj)
    for (let i = 0; i < keyArray.length; i++) {
        if (object && object.hasOwnProperty(keyArray[i]))
            object = object[keyArray[i]] != null ? object[keyArray[i]] : notSetValue
        else return notSetValue != null ? notSetValue : null
    }
    return object
}

export const setIn = (obj, keyArray, value) => {
    if (keyArray == null || keyArray == []) return null
    let object = obj
    for (let i = 0; i < keyArray.length - 1; i++) {
        if (object.hasOwnProperty(keyArray[i])) object = object[keyArray[i]]
        else return null
    }
    object[keyArray[keyArray.length - 1]] = value
}

/**
 * Allows filter field states to update based on new ES responses
 */
export const mergeFields = (currentFields, returnedFields) => {
    let newFields = []

    if (currentFields == null) return returnedFields

    currentFields.forEach((field) => {
        const match = returnedFields.findIndex((elm) => elm.key === field.key)
        if (match >= 0) {
            newFields.push({ ...field, ...returnedFields[match] })
        } else {
            let newField = Object.assign({}, field)
            newField.doc_count = 0
            newFields.push(newField)
        }
    })
    // Now check to see if returnFields has fields that current/newFields
    // doesn't yet know about
    returnedFields.forEach((field) => {
        const match = newFields.findIndex((elm) => elm.key === field.key)
        if (match < 0) {
            let newField = Object.assign({}, field)
            newFields.push(newField)
        }
    })

    newFields.sort((a, b) => a.key.localeCompare(b.key))

    return newFields
}

/**
 * Checks if a variable is an object
 * @param {Object} obj - obj to check
 * @return {Boolean} - is an object or not
 */
export const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * Sorts an object
 * @param {Object} obj - object to sort
 * @return {Object} sortedObj - obj sorted
 */
export const sortObject = (obj) => {
    let sortedObj = {}
    Object.keys(obj)
        .sort()
        .forEach(function (key) {
            sortedObj[key] = obj[key]
        })
    return sortedObj
}

/**
 * Turns an object into a comma-separated string of its first-level key: string values
 * @param {Object} obj - object to string
 * @return {string} string - the resulting string
 */
export const objectToString = (obj) => {
    let string = ''
    for (let k in obj) {
        if (typeof obj[k] === 'string') {
            if (string.length != 0) string += ', '
            string += `${capitalize(k)}: ${obj[k]}`
        }
    }
    return string
}

/**
 * Get index of array of objects with key value pair (-1 if not found)
 * @param {Array} objectArray - array of objects to look over
 * @param {any} key - key
 * @param {any} value - value
 * @return {number} index - index of match
 */
export const objectArrayIndexOfKeyWithValue = (objectArray, key, value) => {
    var index = -1
    for (let i in objectArray) {
        if (objectArray[i]) {
            if (objectArray[i].hasOwnProperty(key) && objectArray[i][key] === value) {
                index = i
                break
            }
        }
    }
    return index
}

/**
 * Abbreviates a number to 1.1K, 1.1M, 1.1B, ... format
 * from https://stackoverflow.com/a/40724354
 * @param {number} number - object to sort
 * @return {string}
 */
export const abbreviateNumber = (number, preferredDecimalPlaces) => {
    const SI_SYMBOL = ['', 'K', 'M', 'B', 'T']

    // what tier? (determines SI symbol)
    const tier = (Math.log10(number) / 3) | 0

    // if zero, we don't need a suffix
    if (tier == 0) {
        if (preferredDecimalPlaces != null) return numberDecString(number, preferredDecimalPlaces)
        return number
    }

    // get suffix and determine scale
    const suffix = SI_SYMBOL[tier]
    const scale = Math.pow(10, tier * 3)

    // scale the number
    const scaled = number / scale

    // format number and add suffix
    return scaled.toFixed(1) + suffix
}

/**
 * Rounds a number to be human friendly
 * numberDecString(1.44583812, 2) == 1.44
 * numberDecString(1, 2) == 1
 * @param {number} number
 * @param {number} decimalPlaces
 * @return {string}
 */
export const numberDecString = (number, decimalPlaces) => {
    return parseFloat(number)
        .toFixed(decimalPlaces)
        .replace('.'.padEnd(decimalPlaces + 1, '0'), '')
}

/**
 * Hashes a string into an rgb() value
 * from https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
 * @param {string} str - string to hash
 * @return {string} - rgb(r, g, b)
 */
export const stringToRGB = function (str) {
    let hash = 0
    if (str == null || str.length === 0) return 'rgb(0, 0, 0)'
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
        hash = hash & hash
    }
    let rgb = [0, 0, 0]
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 255
        rgb[i] = value
    }
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

/**
 * Copies input to user's clipboard
 * @param {string} text - text to copy to clipboard
 * @credit https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
 */
export const copyToClipboard = function (text) {
    const el = document.createElement('textarea') // Create a <textarea> element
    el.value = text // Set its value to the string that you want copied
    el.setAttribute('readonly', '') // Make it readonly to be tamper-proof
    el.style.position = 'absolute'
    el.style.left = '-9999px' // Move outside the screen to make it invisible
    document.body.appendChild(el) // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0 // Check if there is any content selected previously
            ? document.getSelection().getRangeAt(0) // Store selection if found
            : false // Mark as false to know no selection existed before
    el.select() // Select the <textarea> content
    document.execCommand('copy') // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el) // Remove the <textarea> element
    if (selected) {
        // If a selection existed before copying
        document.getSelection().removeAllRanges() // Unselect everything on the HTML document
        document.getSelection().addRange(selected) // Restore the original selection
    }
}

// Capitalizes first char in a string
export const capitalize = (str, eachWord) => {
    if (typeof str === 'string') {
        if (eachWord) {
            const words = str.split(' ')

            for (let i = 0; i < words.length; i++)
                words[i] = words[i][0].toUpperCase() + words[i].substr(1)

            return words.join(' ')
        } else return str.replace(/^\w/, (c) => c.toUpperCase())
    } else {
        return ''
    }
}

export const sortRelatedKeys = (keyArray) => {
    const preferredSorting = Object.keys(RELATED_MAPPINGS)

    const sortedRelatedKeys = []
    preferredSorting.forEach((p) => {
        if (keyArray.includes(p)) sortedRelatedKeys.push(p)
    })
    keyArray.forEach((k) => {
        if (!sortedRelatedKeys.includes(k)) sortedRelatedKeys.push(k)
    })

    return sortedRelatedKeys
}

// Makes a name prettify by capitalizing and removing underscores...
export const prettify = (str) => {
    let pretty = str.toLowerCase()
    pretty = pretty.replace(/_/g, ' ')
    pretty = pretty.split(' ')
    pretty = pretty.map((word) => capitalize(word))
    pretty = pretty.join(' ')
    pretty = pretty.replaceAll(/pds/gi, 'PDS')
    pretty = pretty.replaceAll(/msl/gi, 'MSL')
    pretty = pretty.replaceAll(/mro/gi, 'MRO')
    return pretty
}

// Gets a file string's extension
export const getExtension = (string, toLowerCase) => {
    // :: represents the version number and versions can include .'s (i.e. 8.1)
    // Get rid of that portion first
    if (string) string = string.split('::')[0]
    let ex = /(?:\.([^.]+))?$/.exec(string)[1]
    if (ex) ex = ex.split(':')[0]

    return ex ? (toLowerCase ? ex.toLowerCase() : ex) : ''
}

/**
 * From https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 */
export const humanFileSize = (bytes, si) => {
    if (bytes == null) return null
    var thresh = si ? 1000 : 1024
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B'
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    var u = -1
    do {
        bytes /= thresh
        ++u
    } while (Math.abs(bytes) >= thresh && u < units.length - 1)
    return bytes.toFixed(1) + ' ' + units[u]
}

export const linearScale = (domain, range, value) => {
    return ((range[1] - range[0]) * (value - domain[0])) / (domain[1] - domain[0]) + range[0]
}

// From https://stackoverflow.com/a/59094308
export const removeComments = (string) => {
    if (string == null) return ''
    //Takes a string of code, not an actual function.
    return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*|\#.*/g, '').trim() //Strip comments
}
