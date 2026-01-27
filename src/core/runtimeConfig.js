/**
 * Runtime Configuration Module
 *
 * Provides a single source of truth for all application configuration.
 * In production, reads from window.APP_CONFIG (server-injected at runtime).
 * In development, falls back to process.env (webpack-injected at build time).
 *
 * This allows building once and deploying to any path without rebuilding.
 */

/**
 * Get the public URL from runtime config or fallback to build-time env
 * @returns {string} The public URL (e.g., '', '/atlas', '/beta')
 */
export const getPublicUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.PUBLIC_URL ?? ''
    }
    return process.env.PUBLIC_URL ?? ''
}

/**
 * Get the domain from runtime config or fallback to build-time env
 * @returns {string} The domain
 */
export const getDomain = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.DOMAIN ?? ''
    }
    return process.env.REACT_APP_DOMAIN ?? ''
}

/**
 * Get the API URL from runtime config or fallback to build-time env
 * @returns {string} The API URL
 */
export const getApiUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.API_URL ?? ''
    }
    return process.env.REACT_APP_API_URL ?? ''
}

/**
 * Get the Elasticsearch URL from runtime config or fallback to build-time env
 * @returns {string} The Elasticsearch URL
 */
export const getEsUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.ES_URL ?? ''
    }
    return process.env.REACT_APP_ES_URL ?? ''
}

/**
 * Get the Geospatial Footprint Service URL from runtime config or fallback to build-time env
 * @returns {string} The footprint service URL
 */
export const getFootprintUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.FOOTPRINT_URL ?? ''
    }
    return process.env.REACT_APP_FOOTPRINT_URL ?? ''
}

/**
 * Get the Imagery Viewer URL from runtime config or fallback to build-time env
 * @returns {string} The imagery viewer URL
 */
export const getImageryUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.IMAGERY_URL ?? ''
    }
    return process.env.REACT_APP_IMAGERY_URL ?? ''
}

/**
 * Get the Registry URL from runtime config or fallback to build-time env
 * @returns {string} The registry URL
 */
export const getRegistryUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.REGISTRY_URL ?? ''
    }
    return process.env.REACT_APP_REGISTRY_URL ?? ''
}

/**
 * Get the DOI Service URL from runtime config or fallback to build-time env
 * @returns {string} The DOI service URL
 */
export const getDoiUrl = () => {
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        return window.APP_CONFIG.DOI_URL ?? ''
    }
    return process.env.REACT_APP_DOI_URL ?? ''
}

/**
 * Get all runtime configuration as an object
 * @returns {Object} All configuration values
 */
export const getRuntimeConfig = () => {
    return {
        PUBLIC_URL: getPublicUrl(),
        DOMAIN: getDomain(),
        API_URL: getApiUrl(),
        ES_URL: getEsUrl(),
        FOOTPRINT_URL: getFootprintUrl(),
        IMAGERY_URL: getImageryUrl(),
        REGISTRY_URL: getRegistryUrl(),
        DOI_URL: getDoiUrl(),
    }
}
