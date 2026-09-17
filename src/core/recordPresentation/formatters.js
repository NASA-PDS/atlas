import moment from 'moment'

import { prettify } from '../utils'
import { DISPLAY_NAME_MAPPINGS, getShortDisplayName } from '../constants'

const asNumber = (value) => (typeof value === 'number' ? value : Number(String(value).trim()))

// Missions use Atlas display names, without the trailing gloss.
const displayName = (value, field) => {
    return field.vocabulary === 'mission' &&
        DISPLAY_NAME_MAPPINGS[String(value).toLowerCase()] != null
        ? getShortDisplayName(String(value).toLowerCase())
        : prettify(String(value))
}

const formatters = {
    text: (value) => String(value),
    boolean: (value) => (value === true || value === 'true' ? 'Yes' : 'No'),
    uppercase: (value) => String(value).toUpperCase(),
    titlecase: (value) => prettify(String(value)),
    vocabulary: (value, field) => displayName(value, field),
    integer: (value) => {
        const n = asNumber(value)
        return Number.isNaN(n) ? String(value) : String(Math.round(n))
    },
    number: (value, field) => {
        const n = asNumber(value)
        if (Number.isNaN(n)) return String(value)
        const precision = field.precision != null ? field.precision : 2
        return n.toFixed(precision)
    },
    datetime: (value) => {
        const m = moment.utc(String(value))
        return m.isValid() ? m.format('YYYY-MM-DD HH:mm:ss[Z]') : String(value)
    },
    // Drops seconds so a timestamp fits a tile on one line.
    datetime_short: (value) => {
        const m = moment.utc(String(value))
        return m.isValid() ? m.format('YYYY-MM-DD HH:mm[Z]') : String(value)
    },
    clock: (value) => {
        const str = String(value)
        const match = str.match(/(\d{1,2}:\d{2}(:\d{2})?)/)
        return match ? match[1] : str
    },
    bytes: (value) => {
        const n = asNumber(value)
        if (Number.isNaN(n)) return String(value)
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        let size = n
        let unit = 0
        while (size >= 1024 && unit < units.length - 1) {
            size /= 1024
            unit++
        }
        return `${unit === 0 ? size : size.toFixed(1)} ${units[unit]}`
    },
    // Elasticsearch geo_point, either as [lon, lat] or as { lat, lon }.
    geo: (value) => {
        if (Array.isArray(value) && value.length === 2) {
            const lon = asNumber(value[0])
            const lat = asNumber(value[1])
            if (Number.isNaN(lon) || Number.isNaN(lat)) return null
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
        }
        if (value && value.lat != null && value.lon != null)
            return `${asNumber(value.lat).toFixed(2)}, ${asNumber(value.lon).toFixed(2)}`
        if (typeof value === 'string') return value
        return null
    },
}

export const FORMATTER_NAMES = Object.keys(formatters)

/** Milliseconds for a timestamp value, or null when it isn't a date. */
export const parseTime = (value) => {
    const m = moment.utc(String(value))
    return m.isValid() ? m.valueOf() : null
}

/** The span between two timestamps as a short human gap, e.g. `6h 50m`. */
export const formatElapsed = (ms) => {
    const d = moment.duration(Math.abs(ms))
    if (d.asMinutes() < 1) return `${Math.round(d.asSeconds())}s`
    if (d.asHours() < 1) return `${Math.round(d.asMinutes())}m`
    if (d.asDays() < 1) {
        const h = Math.floor(d.asHours())
        const m = d.minutes()
        return m ? `${h}h ${m}m` : `${h}h`
    }
    if (d.asDays() < 31) return `${Math.round(d.asDays())}d`
    if (d.asDays() < 365) return `${Math.round(d.asMonths())}mo`
    return `${d.asYears().toFixed(1)}y`
}

/** Formats one valid value for display, appending the field's unit if any. */
export const formatValue = (value, field) => {
    const formatter = formatters[field.format] || formatters.text
    // A geo point is one value spread over two array elements.
    const list = Array.isArray(value) && field.format !== 'geo' ? value : [value]
    const formatted = list
        .map((v) => formatter(v, field))
        .filter((v) => v != null && v !== '')
        .join(', ')
    if (formatted === '') return null
    return field.unit ? `${formatted}${field.unit === '\u00b0' ? '' : ' '}${field.unit}` : formatted
}
