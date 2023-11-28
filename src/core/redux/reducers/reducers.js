import { INITIAL } from '../store/initial'
import { fromJS } from 'immutable'
import { getIn } from '../../utils'
import { localStorageCart, ES_PATHS } from '../../constants'

const reducerFuncs = {
    // ==================== SEARCH RELATED ====================
    // Workspace
    SET_WORKSPACE: setWorkspace,
    // Mappings (elasticsearch)
    SET_MAPPINGS: setMappings,
    // Modal
    SET_MODAL: setModal,
    // Filters
    SET_FILTER_TYPE: setFilterType,
    SET_INITIAL_ACTIVE_FILTERS: setInitialActiveFilters,
    ADD_ACTIVE_FILTERS: addActiveFilters,
    UPDATE_ACTIVE_FILTERS: updateActiveFilters,
    REMOVE_ACTIVE_FILTERS: removeActiveFilters,
    CLEAR_ACTIVE_FILTERS: clearActiveFilters,
    UPDATE_ACTIVE_MISSIONS: updateActiveMissions,
    UPDATE_GEO_GRID: updateGeoGrid,
    SET_FIELD_STATE: setFieldState,
    SET_ADVANCED_FILTERS: setAdvancedFilters,
    SET_ADVANCED_FILTERS_EXPRESSION: setAdvancedFiltersExpression,
    CLEAR_ADVANCED_FILTERS: clearAdvancedFilters,
    // Results
    ADD_RESULTS: addResults,
    CLEAR_RESULTS: clearResults,
    SET_RESULTS_STATUS: setResultsStatus,
    SET_RESULTS_PAGE: setResultsPage,
    SET_RESULT_SORTING: setResultSorting,
    SET_RESULTS_TABLE_COLUMNS: setResultsTableColumns,
    SET_LAST_QUERY: setLastQuery,
    CHECK_ITEM_IN_RESULTS: checkItemInResults,
    SET_GRID_SIZE: setGridSize,

    // ==================== RECORD RELATED ====================
    SET_RECORD_DATA: setRecordData,
    SET_LABEL_DATA: setLabelData,
    SET_RECORD_VIEW_TAB: setRecordViewTab,

    // ================= FILE-EXPLORER RELATED =================
    ADD_FILEX_COLUMN: addFilexColumn,
    REMOVE_FILEX_COLUMN: removeFilexColumn,
    UPDATE_FILEX_COLUMN: updateFilexColumn,
    SET_FILEX_COLUMN_RESULTS: setFilexColumnResults,
    SET_FILEX_PREVIEW: setFilexPreview,
    SET_LAST_FILEX_FILTER_DOC: setLastFilexFilterDoc,
    SET_LAST_REGEX_QUERY: setLastRegexQuery,

    // ================= CART RELATED =================
    ADD_TO_CART: addToCart,
    CHECK_ITEM_IN_CART: checkItemInCart,
    REMOVE_FROM_CART: removeFromCart,

    // GENERAL
    SET_SNACKBAR_TEXT: setSnackBarText,
    SET_DATA: setData,
}

export default function reducers(state = INITIAL, action) {
    if (reducerFuncs[action.type] == null) return state
    return reducerFuncs[action.type](state, action.payload)
}

// ==================== SEARCH RELATED ====================

/**
 * Sets workspace panel visibilities
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.workspace - workspace object
 * @return {Object} new state
 */
function setWorkspace(state, payload) {
    return state.setIn(['workspace', payload.which || 'main'], fromJS(payload.workspace))
}

/**
 * Sets an underlying index mapping for dynamically created filters
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.indexName - mapping index to set
 * @param {Object} payload.mapping - elasticsearch index mappings
 * @return {Object} new state
 */
function setMappings(state, payload) {
    return state.setIn(['mappings'], { [payload.indexName]: payload.mapping, all: payload.all })
}

/**
 * Sets modals on and off
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.modal - modal name to show
 * @param {Object} payload.content - object to pass to content
 * @return {Object} new state
 */
function setModal(state, payload) {
    let nextModals = state.get('modals').toJS()
    for (let key in nextModals)
        nextModals[key] = key === payload.modal ? payload.content || true : false
    return state.setIn(['modals'], fromJS(nextModals))
}

/**
 * Sets filter type (basic or advanced)
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.type -
 * @return {Object} new state
 */
function setFilterType(state, payload) {
    let type = payload.type
    if (!['basic', 'advanced'].includes(type)) type = 'basic'
    return state.setIn(['filterType'], type)
}

/**
 * Sets the initially active filters
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.filters - filters obj { "id1": { filter }, "id2": { filter } }
 * @return {Object} new state
 */
function setInitialActiveFilters(state, payload) {
    return state.setIn(['initialActiveFilters'], fromJS(payload.filters))
}
/**
 * Adds an active filter
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.filters - filters obj { "id1": { filter }, "id2": { filter } }
 * @return {Object} new state
 */
function addActiveFilters(state, payload) {
    let nextActiveFilters = state.get('activeFilters').toJS()

    Object.keys(payload.filters).forEach((key) => {
        if (nextActiveFilters[key] == null) nextActiveFilters[key] = payload.filters[key]
    })
    return state.setIn(['activeFilters'], fromJS(nextActiveFilters))
}

/**
 * Updates active filters
 * (replaces only filters listed in payload.filters --
 *  doesn't remove activeFilters that aren't in payload.filters)
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.filters - updated filter obj
 * @return {Object} new state
 */
function updateActiveFilters(state, payload) {
    let nextActiveFilters = state.get('activeFilters').toJS()
    nextActiveFilters = { ...nextActiveFilters, ...payload.filters }
    return state.setIn(['activeFilters'], fromJS(nextActiveFilters))
}

/**
 * Deletes an active filter
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array | string} payload.ids - filter identifiers
 * @return {Object} new state
 */
function removeActiveFilters(state, payload) {
    let nextActiveFilters = state.get('activeFilters').toJS()
    const ids = typeof payload.ids === 'string' ? [payload.ids] : payload.ids
    ids.forEach((id) => {
        if (nextActiveFilters[id] != null) delete nextActiveFilters[id]
        else console.warn(`Tried to delete an active filter that does not exist: ${id}`)
    })
    return state.setIn(['activeFilters'], fromJS(nextActiveFilters))
}

/**
 * Clears all active filters
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @return {Object} new state
 */
function clearActiveFilters(state, payload) {
    const initialActiveFilters = state.get('initialActiveFilters')
    return state.setIn(['activeFilters'], initialActiveFilters)
}

/**
 * Updates active missions
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string[]} payload.missions - full list of new active missions
 * @return {Object} new state
 */
function updateActiveMissions(state, payload) {
    return state.setIn(['activeMissions'], fromJS(payload.missions || []))
}

/**
 * Updates geo grid
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object[]} payload.buckets - full list of new geo grid buckets
 * @return {Object} new state
 */
function updateGeoGrid(state, payload) {
    return state.setIn(['geoGrid'], fromJS(payload.buckets || []))
}

/**
 * Used for user selection of facet fields
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.filterKey - name of filter
 * @param {number} payload.fieldId - index of field under filter
 * @param {any} payload.state - field state
 * @return {Object} new state
 */
function setFieldState(state, payload) {
    const currentFieldState = state.getIn([
        'activeFilters',
        payload.filterKey,
        'facets',
        payload.fieldId,
        'state',
    ])
    return state.setIn(
        ['activeFilters', payload.filterKey, 'facets', payload.fieldId, 'state'],
        fromJS({
            ...(currentFieldState ? currentFieldState.toJS() : {}),
            ...payload.state,
        })
    )
}

/**
 * Sets advancedFilters
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.advancedFilters
 * @return {Object} new state
 */
function setAdvancedFilters(state, payload) {
    return state.setIn(['advancedFilters'], payload.advancedFilters)
}

/**
 * Sets advancedFiltersExpression
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {Object} payload.expression
 * @return {Object} new state
 */
function setAdvancedFiltersExpression(state, payload) {
    return state.setIn(['advancedFiltersExpression'], fromJS(payload.expression))
}

/**
 * Clears advancedFilters
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @return {Object} new state
 */
function clearAdvancedFilters(state, payload) {
    return state.setIn(['advancedFilters'], null)
}

// Results

/**
 * Adds search results to the client model
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.results - results to add
 * @param {number} payload.page - page to add results from
 * @param {number} payload.total - total results in query
 * @return {Object} new state
 */
function addResults(state, payload) {
    let currentResults = state.getIn(['results'])
    if (!currentResults.length > 0) currentResults = []
    const existingPaging = state.getIn(['resultsPaging']).toJS()
    const page = payload.page
    const resultsPerPage = existingPaging.resultsPerPage

    const from = page * resultsPerPage

    payload.results.forEach((result, i) => {
        result.result_key = i + from
    })

    let results
    // activePages example:
    /*  Start -> Page [0]
        Scroll to bottom -> Page [0, 1]
        Set page to 10 -> Page [10]
        Scroll to top -> Page [9, 10]
        Scroll to bottom -> Page [9, 10, 11]
        Set page to 50 -> Page [50]
    */
    let activePages = existingPaging.activePages

    if (!activePages.includes(page)) {
        if (activePages.includes(page - 1)) {
            activePages.push(page)
            results = currentResults.concat(payload.results)
        } else if (activePages.includes(page + 1)) {
            activePages.unshift(page)
            results = payload.results.concat(currentResults)
        } else {
            activePages = [page]
            results = payload.results
        }
    } else {
        // We already had the page, we shouldn't have required
        // and something probably went wrong somewhere else
        return state
    }

    return (
        state
            .setIn(['results'], results)
            // Don't set the page here because we preload the results
            // and this will messing up paging a bit
            //.setIn(['resultsPaging', 'page'], page)
            .setIn(['resultsPaging', 'activePages'], fromJS(activePages))
            .setIn(['resultsPaging', 'total'], payload.total)
    )
}

/**
 * Clears all sort results
 *
 * @param {Object} state - Redux state
 * @return {Object} new state
 */
function clearResults(state, payload) {
    return state.setIn(['results'], []).setIn(
        ['resultsPaging'],
        fromJS({
            page: 0,
            activePages: [],
            resultsPerPage: 100,
            total: null,
        })
    )
}

/**
 * Sets the results' status
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.status - new status
 * @param {object} payload.message - new message
 *
 * @return {Object} new state
 */
function setResultsStatus(state, payload) {
    return state.setIn(
        ['resultsStatus'],
        fromJS({ status: payload.status || 'good', message: payload.message || {} })
    )
}

/**
 * Sets the page
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.page - new current page
 * @return {Object} new state
 */
function setResultsPage(state, payload) {
    return state.setIn(['resultsPaging', 'page'], payload.page)
}

/**
 * Sets the result sorting method
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.field - top thumbnail result images
 * @param {array} payload.direction - query total object
 * @return {Object} new state
 */
function setResultSorting(state, payload) {
    return state.setIn(['resultSorting'], fromJS(payload))
}

/**
 * Sets the result table view's columns
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.columns - new columns
 * @return {Object} new state
 */
function setResultsTableColumns(state, payload) {
    return state.setIn(['resultsTable', 'columns'], fromJS(payload.columns))
}

/**
 * Sets the last query dsl
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.images - top thumbnail result images
 * @param {array} payload.total - query total object
 * @param {Object} payload.query - last dsl query
 * @return {Object} new state
 */
function setLastQuery(state, payload) {
    return state.setIn(
        ['lastQuery'],
        fromJS({ images: payload.images, total: payload.total, query: payload.query })
    )
}

/**
 * Sets the last regex query dsl
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.total - query total object
 * @param {Object} payload.query - last dsl query
 * @return {Object} new state
 */
function setLastRegexQuery(state, payload) {
    return state.setIn(['lastRegexQuery'], fromJS({ total: payload.total, query: payload.query }))
}

/**
 * Checks (or unchecks) an item in the results
 *
 * @return {Object} new state
 */
function checkItemInResults(state, payload) {
    let currentKeysChecked = []
    if (payload.key != 'clear') {
        currentKeysChecked = state.getIn(['resultKeysChecked']).toJS()
        const check = payload.on == null ? !currentKeysChecked.includes(payload.key) : payload.on
        if (check) {
            if (!currentKeysChecked.includes(payload.key)) currentKeysChecked.push(payload.key)
        } else {
            const idx = currentKeysChecked.indexOf(payload.key)
            if (idx >= 0) currentKeysChecked.splice(idx, 1)
        }
    }
    return state.setIn(['resultKeysChecked'], fromJS(currentKeysChecked))
}

/**
 * Sets the grid item size
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {array} payload.gridSize - grid item size in px
 * @return {Object} new state
 */
function setGridSize(state, payload) {
    return state.setIn(['gridSize'], payload.gridSize || 170)
}

// ==================== RECORD RELATED ====================
/**
 * Sets the record for the record page
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.recordData - es hit _source
 * @return {Object} new state
 */
function setRecordData(state, payload) {
    return state.setIn(['recordData'], fromJS(payload.recordData))
}

/**
 * Sets the label for the record page
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.labelData - es hit _source
 * @return {Object} new state
 */
function setLabelData(state, payload) {
    return state.setIn(['labelData'], fromJS(payload.labelData))
}

/**
 * Sets which record view tab is active
 *
 * @param {Object} state - Redux state
 * @param {Object} payload - action payload
 * @param {string} payload.newRecordViewTab
 * @return {Object} new state
 */
function setRecordViewTab(state, payload) {
    return state.setIn(['recordViewTab'], fromJS(payload.newRecordViewTab))
}

// ================= FILE-EXPLORER RELATED =================
/**
 * Adds a column to the file explorer
 *
 * @param {string} [type=directory] - 'directory' | 'filter'
 * @param {string} [sort=az] - 'az' | 'za' | 'date-asc' | 'date-desc' | 'size-asc' | 'size-desc'
 * @param {Object} fields - For 'filter' type only.
        ex.[
            { display_name: 'Missions', value: 'mission' },
            { display_name: 'Spacecraft', value: 'spacecraft' }
        ]
 * @param {string} [value=first_fields_item_value] - For 'filter' type only. Active dropdown filter value
 * @return {Object} new state
 */
function addFilexColumn(state, payload) {
    let currentColumns = state.getIn(['columns'])
    if (!currentColumns.length > 0) currentColumns = []
    if (payload.type === 'filter') {
        let finalFilterIndex = -1
        for (let i = 0; i < currentColumns.length; i++) {
            if (
                i > 0 &&
                currentColumns[i].type != 'filter' &&
                currentColumns[i - 1].type === 'filter'
            ) {
                finalFilterIndex = i - 1
                break
            }
        }
        if (finalFilterIndex != -1) {
            currentColumns.splice(finalFilterIndex + 1, 0, payload)
        } else currentColumns.push(payload)
    } else currentColumns.push(payload)
    return state.setIn(['columns'], currentColumns)
}

/**
 * Removes a column(s) from the file explorer
 *
 * @param {number} columnId - columnId to remove along with all columns after it
 * @return {Object} new state
 */
function removeFilexColumn(state, payload) {
    const currentColumns = state.getIn(['columns'])
    return state.setIn(['columns'], currentColumns.slice(0, payload.columnId))
}

/**
 * Updates a column in the file explorer
 *
 * @param {number} columnId - columnId to update
 * @param {Object} options - object of keys with values to update to
 * @return {Object} new state
 */
function updateFilexColumn(state, payload) {
    for (let key in payload.options) {
        state = state.setIn(['columns', payload.columnId, key], payload.options[key])
    }
    return state
}

/**
 * Sets a column's results
 *
 * @param {number} columnId - columnId to set results in
 * @param {Object[]} results - results to set
 * @return {Object} new state
 */
function setFilexColumnResults(state, payload) {
    return state
        .setIn(['columns', payload.columnId, 'results'], payload.results)
        .setIn(['columns', payload.columnId, 'total'], payload.total)
}

/**
 * Sets the preview item for the file explorer
 *
 * @param {Object} previewItem - Same as columns[i].active
 * @return {Object} new state
 */
function setFilexPreview(state, payload) {
    return state.setIn(['filexPreview'], payload.previewItem)
}

/**
 * Sets the last filter doc item for the file explorer
 * useful for knowing the base uri and pds format
 *
 * @param {Object} payload - doc
 * @return {Object} new state
 */
function setLastFilexFilterDoc(state, payload) {
    return state.setIn(['lastFilexFilterDoc'], payload)
}

// ================= CART RELATED =================
/**
 * Add an item to the cart
 *
 * @return {Object} new state
 */
function addToCart(state, payload) {
    let currentCart = state.getIn(['cart']).toJS()

    const time = new Date().getTime()

    if (payload.item === 'lastQuery') {
        const lastQuery = state.getIn(['lastQuery'])
        if (lastQuery)
            currentCart.push({
                type: payload.type,
                time: time,
                item: { ...lastQuery.toJS(), ...{ related: payload.aggs } },
            })
    } else if (payload.item === 'lastRegexQuery') {
        const lastQuery = state.getIn(['lastRegexQuery'])
        if (lastQuery)
            currentCart.push({
                type: payload.type,
                time: time,
                item: { ...lastQuery.toJS(), ...{ related: payload.aggs } },
            })
    } else if (payload.item === 'checkedResults') {
        const resultKeysChecked = state.getIn(['resultKeysChecked']).toJS()
        const results = state.getIn(['results'])
        results.forEach((r) => {
            if (resultKeysChecked.includes(r.result_key))
                currentCart.push({
                    type: 'image',
                    time: time,
                    item: {
                        uri: getIn(r._source, ES_PATHS.source),
                        related: getIn(r._source, ES_PATHS.related),
                    },
                })
        })
    } else currentCart.push({ type: payload.type, time: time, item: payload.item })

    if (window.localStorage)
        window.localStorage.setItem(localStorageCart, JSON.stringify(currentCart))

    return state.setIn(['cart'], fromJS(currentCart))
}

/**
 * Checks (or unchecks) an item in the cart
 *
 * @return {Object} new state
 */
function checkItemInCart(state, payload) {
    let currentCart = state.getIn(['cart']).toJS()

    currentCart[payload.index].checked =
        payload.on == null ? !currentCart[payload.index].checked : payload.on

    return state.setIn(['cart'], fromJS(currentCart))
}

/**
 * Remove an item from the cart
 *
 * @return {Object} new state
 */
function removeFromCart(state, payload) {
    let currentCart = state.getIn(['cart']).toJS()

    if (payload.index === 'all') currentCart = []
    else if (payload.index === 'checked')
        currentCart = currentCart.filter((item) => item.checked != true)
    else currentCart = currentCart.filter((item, i) => i != payload.index)

    if (window.localStorage)
        window.localStorage.setItem(localStorageCart, JSON.stringify(currentCart))

    return state.setIn(['cart'], fromJS(currentCart))
}

// GENERAL

/**
 * Sets the informational snackbar's text
 *
 * @param {text} - string | false
 * @return {Object} redux action
 */
function setSnackBarText(state, payload) {
    return state.setIn(['snackBarText'], fromJS({ text: payload.text, severity: payload.severity }))
}

/**
 * Sets generic data holding
 *
 * @param {Object} state - Redux state
 * @param {string} payload.name - name/tag for the data
 * @param {Object} payload.data - anything
 * @return {Object} new state
 */
function setData(state, payload) {
    return state.setIn(['data', payload.name], fromJS(payload.data))
}
