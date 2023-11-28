/**
 * Some actions can be slow... so here's an old school way
 */

const subscriptions = {}
const store = {}

export const sAKeys = {
    HOVERED_RESULT: 'HOVERED_RESULT',
    MAP_TARGET: 'MAP_TARGET',
}

export const sASubscribe = (key, tag, func) => {
    if (sAKeys[key] == null) {
        console.warn(`Subscribable Actions - Unknown key: ${key}`)
        return
    }
    subscriptions[tag] = {
        key,
        func,
    }
}
export const sAUnsubscribe = (tag) => {
    delete subscriptions[tag]
}

const call = (key, body) => {
    Object.keys(subscriptions).forEach((s) => {
        if (subscriptions[s].key === key) subscriptions[s].func(body)
    })
}

export const sAGet = (key) => {
    if (sAKeys[key] == null) {
        console.warn(`Subscribable Actions - Unknown key: ${key}`)
        return
    }

    return store[key]
}

export const sASet = (key, value) => {
    if (sAKeys[key] == null) {
        console.warn(`Subscribable Actions - Unknown key: ${key}`)
        return
    }

    if (store[key] != value) {
        store[key] = value
        call(key, value)
    }
}

// ============================================= //
