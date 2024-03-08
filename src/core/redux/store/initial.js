import { fromJS } from 'immutable'
import { localStorageCart } from '../../constants'

/* Globals */
/* These are general variables that DO NOT trigger component updates
    but help in their own ways. Often workarounds for performance.
 */
window.atlasGlobal = {
    imageRotation: 0,
}

let storageCart = []
if (window.localStorage) storageCart = window.localStorage.getItem(localStorageCart) || []
if (typeof storageCart === 'string')
    try {
        storageCart = JSON.parse(storageCart)
    } catch (err) {
        storageCart = []
    }
if (!Array.isArray(storageCart)) storageCart = []

// The saved cart checks tremendously annoy me so off they go...
storageCart.forEach((item) => {
    if (item.checked === true) item.checked = false
})

export const INITIAL = (() => {
    return fromJS({
        // ==================== SEARCH RELATED ====================
        // Which workspace panels are active
        workspace: {
            main: {
                filters: true,
                filtersSize: '360px',
                advancedFiltersSize: '520px',
                secondary: false,
                secondarySize: '50%',
                results: true,
                resultsSize: 'fill',
            },
            mobile: 'results',
        },
        // Which modal are on
        modals: {
            addFilter: false,
            filterHelp: false,
            information: false,
            feedback: false,
            removeFromCart: false,
            editColumns: false,
            advancedFilter: false,
            advancedFilterReturn: false,
            regex: false,
        },
        mappings: {
            atlas: false,
            all: false,
        },
        // Will switch search()'s query construction
        filterType: 'basic', // or 'advanced'
        // Which filters are initially active
        // will be an object when set
        initialActiveFilters: false,
        // Which filters are active
        activeFilters: {},
        // Which missions are active
        // empty == all
        activeMissions: [],
        // agg buckets for a geo grid heatmap on the map
        geoGrid: [],
        // Full string in the Advanced Filters editor.
        advancedFilters: null,
        // Parsed advancedFilters query (or error if invalid)
        advancedFiltersExpression: {},
        // Currently loaded results
        // The ordering matches activeResultPages
        // This WILL NOT BE IMMUTABLE.JSed to avoid the hit of parsing it as it gets large
        results: [],
        resultKeysChecked: [],
        //
        resultsStatus: {
            status: 'searching', // successful none loading searching warning error
            message: {},
        },
        resultsPaging: {
            // Current result page user is looking at
            page: 0,
            // activePages:
            /*  Start -> Page [0]
                Scroll to bottom -> Page [0, 1]
                Set page to 10 -> Page [10]
                Scroll to top -> Page [9, 10]
                Scroll to bottom -> Page [9, 10, 11]
                Set page to 50 -> Page [50]
            */
            activePages: [],
            resultsPerPage: 100,
            total: null,
        },
        resultSorting: {
            field: 'gather.time.start_time',
            direction: 'desc',
            defaultField: 'gather.time.start_time',
        },
        resultsTable: {
            columns: [
                'gather.pds_archive.file_name',
                'gather.time.start_time',
                'gather.common.mission',
                'gather.common.spacecraft',
                'gather.common.target',
                'gather.common.instrument',
                'gather.common.product_type',
            ],
            defaultColumns: [
                'gather.pds_archive.file_name',
                'gather.time.start_time',
                'gather.common.mission',
                'gather.common.spacecraft',
                'gather.common.target',
                'gather.common.instrument',
                'gather.common.product_type',
            ],
        },
        gridSize: 192,
        lastQuery: null,

        // ==================== RECORD RELATED ====================
        recordData: {},
        labelData: {},
        // Which record view tab are we on
        recordViewTab: 'overview',

        // ================= FILE-EXPLORER RELATED =================
        columns: [],
        filexPreview: {},
        lastFilexFilterDoc: null,
        lastRegexQuery: null,

        // ================= CART RELATED =================
        cart: storageCart,

        // ================= GENERAL =================
        // if text false, snackbar is hidden
        snackBarText: {
            text: false,
            severity: null,
        },
        data: {
            mlClassification: {},
        },
    })
})()
