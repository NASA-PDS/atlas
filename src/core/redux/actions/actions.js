import axios from 'axios'

import Url from 'url-parse'
import geohash from 'ngeohash'

import { domain, endpoints, resultsStatuses, ES_PATHS } from '../../constants'
import {
    getHeader,
    getIn,
    getPDSUrl,
    splitUri,
    mergeFields,
    removeComments,
    copyToClipboard,
} from '../../utils'

import { formatMappings, getInitialActiveFilters } from '../../../facets/FacetBuilder'

// Just a quick way to remember
let lastDSL = {}

// Let's result views share which image index the user is scrolled to
// without being an expensive subscription
let resultViewIndex = 20
export const getResultViewIndex = () => {
    return resultViewIndex
}
export const setResultViewIndex = (newResultViewIndex) => {
    resultViewIndex = newResultViewIndex
}

// This builds actions into ACTION:'ACTION' because it's annoying to write both
let flatActions = [
    // ==================== SEARCH RELATED ====================
    // Workspace
    'SET_WORKSPACE',
    // Mappings (elasticsearch)
    'SET_MAPPINGS',
    // Modal
    'SET_MODAL',
    // Filters
    'SET_FILTER_TYPE',
    'SET_INITIAL_ACTIVE_FILTERS',
    'ADD_ACTIVE_FILTERS',
    'UPDATE_ACTIVE_FILTERS',
    'REMOVE_ACTIVE_FILTERS',
    'CLEAR_ACTIVE_FILTERS',
    'UPDATE_ACTIVE_MISSIONS',
    'UPDATE_GEO_GRID',
    'SET_FIELD_STATE',
    'SET_ADVANCED_FILTERS',
    'SET_ADVANCED_FILTERS_EXPRESSION',
    'CLEAR_ADVANCED_FILTERS',
    // Results
    'ADD_RESULTS',
    'CLEAR_RESULTS',
    'SET_RESULTS_STATUS',
    'SET_RESULTS_PAGE',
    'SET_RESULT_SORTING',
    'SET_RESULTS_TABLE_COLUMNS',
    'SET_LAST_QUERY',
    'CHECK_ITEM_IN_RESULTS',
    'SET_GRID_SIZE',

    // ==================== RECORD RELATED ====================
    'SET_RECORD_DATA',
    'SET_LABEL_DATA',
    'SET_RECORD_VIEW_TAB',

    // ================= FILE-EXPLORER RELATED =================
    'ADD_FILEX_COLUMN',
    'REMOVE_FILEX_COLUMN',
    'UPDATE_FILEX_COLUMN',
    'SET_FILEX_COLUMN_RESULTS',
    'SET_LAST_FILEX_FILTER_DOC',
    'SET_FILEX_PREVIEW',
    'SET_LAST_REGEX_QUERY',

    // ================= CART RELATED =================
    'ADD_TO_CART',
    'CHECK_ITEM_IN_CART',
    'REMOVE_FROM_CART',
    'QUERY_CART_AGGS',

    // GENERAL
    'SET_SNACKBAR_TEXT',

    // ================= MAP RELATED =================
    'SET_MAP_TARGET',
    'SET_DATA',
]

// ==================== SEARCH RELATED ====================

/**
 * Action types supported by the client UI.
 * @type {{string}}
 */
export const ACTIONS = flatActions.reduce((acc, cur) => {
    acc[cur] = cur
    return acc
}, {})

/**
 * sets which workspace panels are on
 *
 * @param {Object} workspace object
 * @param {string} which 'main' (default) || 'mobile'
 * @return {Object} redux action
 */
export const setWorkspace = (workspace, which) => {
    return {
        type: ACTIONS.SET_WORKSPACE,
        payload: {
            which,
            workspace,
        },
    }
}

/**
 * Loads elasticsearch index mappings in order to dynamically create filters
 *
 * @param {string} indexName 'atlas' or
 */
export const loadMappings = (indexName) => {
    return (dispatch, getState) => {
        const state = getState()
        const mapping = state.getIn(['mappings', indexName])

        if (mapping == null) {
            // Bad indexName
            return
        }
        if (mapping != false) {
            // Then we already loaded this mapping
            return
        }

        axios
            .get(`${domain}/search/${indexName}/_mapping`, getHeader())
            .then((response) => {
                dispatch(setMappings(indexName, getIn(response, `data.${indexName}`, null)))
            })
            .catch((err) => {
                console.log(err)
                // Still set it to null so that we don't requery
                dispatch(setMappings(indexName, null))
            })
    }
}

let hasSetInitialActiveFilters = false
/**
 * Sets which modals are on
 *
 * @param {string} indexName name of index to query
 * @param {object} mapping
 * @return {Object} redux action
 */
export const setMappings = (indexName, mapping) => {
    return (dispatch, getState) => {
        const copyMapping = JSON.parse(JSON.stringify(mapping))
        const formattedMapping = formatMappings(copyMapping)
        const initialActiveFilters = getInitialActiveFilters(formattedMapping)

        if (!hasSetInitialActiveFilters && indexName === 'atlas') {
            dispatch(setInitialActiveFilters(initialActiveFilters))
            dispatch(addActiveFilters(initialActiveFilters))
            hasSetInitialActiveFilters = true
        }
        dispatch({
            type: ACTIONS.SET_MAPPINGS,
            payload: {
                indexName,
                mapping: formattedMapping,
                all: mapping,
            },
        })
    }
}

/**
 * Sets which modals are on
 *
 * @param {string} modal name, if false or null, turns all modals off
 * @param {object} modal content (opt)
 * @return {Object} redux action
 */
export const setModal = (modal, content) => {
    return {
        type: ACTIONS.SET_MODAL,
        payload: {
            modal,
            content,
        },
    }
}

/**
 * Sets filter type (basic or advanced)
 *
 * @param {string} type 'basic' or 'advanced'
 * @return {Object} redux action
 */
export const setFilterType = (type, dontSearch) => {
    return (dispatch, getState) => {
        dispatch({
            type: ACTIONS.SET_FILTER_TYPE,
            payload: {
                type,
            },
        })

        if (dontSearch == null) {
            dispatch(clearResults())

            if (type === 'basic') dispatch(search(0, true, true))
            else dispatch(setResultsStatus(resultsStatuses.WAITING))
        }
    }
}

/**
 * Sets initial active filters
 *
 * @param {string} id - filter id
 * @param {Object} filters - filter objs
 * @return {Object} redux action
 */
export const setInitialActiveFilters = (filters) => {
    return {
        type: ACTIONS.SET_INITIAL_ACTIVE_FILTERS,
        payload: {
            filters,
        },
    }
}
/**
 * Adds active filters
 *
 * @param {string} id - filter id
 * @param {Object} filters - filter objs
 * @return {Object} redux action
 */
export const addActiveFilters = (filters) => {
    return {
        type: ACTIONS.ADD_ACTIVE_FILTERS,
        payload: {
            filters,
        },
    }
}
/**
 * updates active filters
 *
 * @param {Object} filters - filters obj
 * @return {Object} redux action
 */
export const updateActiveFilters = (filters) => {
    return {
        type: ACTIONS.UPDATE_ACTIVE_FILTERS,
        payload: {
            filters,
        },
    }
}
/**
 * removes active filters
 *
 * @param {array} ids - string array of filter ids
 * @return {Object} redux action
 */
export const removeActiveFilters = (ids) => {
    return {
        type: ACTIONS.REMOVE_ACTIVE_FILTERS,
        payload: {
            ids,
        },
    }
}
/**
 * clear all active filters
 *
 * @return {Object} redux action
 */
export const clearActiveFilters = () => {
    return {
        type: ACTIONS.CLEAR_ACTIVE_FILTERS,
        payload: {},
    }
}

export const resetFilters = () => {
    return (dispatch, getState) => {
        dispatch(clearActiveFilters())
        dispatch(setAdvancedFilters(null, true))
        dispatch(clearResults())
        dispatch(search(0, true))
    }
}

/**
 * Updates active missions
 * A list of missions that have results based on the current filters
 *
 * @param {string[]} missions - new array of active missions
 * @return {Object} redux action
 */
export const updateActiveMissions = (missions) => {
    return {
        type: ACTIONS.UPDATE_ACTIVE_MISSIONS,
        payload: {
            missions,
        },
    }
}

/**
 * Updates the map's geo grid
 *
 * @param {Object[]} buckets - agg buckets defining the map's geo grid
 * @return {Object} redux action
 */
export const updateGeoGrid = (buckets) => {
    return {
        type: ACTIONS.UPDATE_GEO_GRID,
        payload: {
            buckets,
        },
    }
}

/**
 * Performs a search based on activeFilters
 *
 * @param {number} page (opt) - page to query from
 * @param {boolean} filtersNeedUpdate (opt) - true if they do
 * @param {boolean} pageNeedsUpdate (opt) - true if it does
 */
export const search = (page, filtersNeedUpdate, pageNeedsUpdate, url, forceActiveFilters) => {
    return (dispatch, getState) => {
        const state = getState()
        const activeFilters = forceActiveFilters || state.get('activeFilters').toJS()
        const resultsPerPage = state.getIn(['resultsPaging', 'resultsPerPage'])
        const resultSorting = state.getIn(['resultSorting']).toJS()
        const filterType = state.getIn(['filterType'])
        const atlasMapping = state.getIn(['mappings', 'atlas'])

        if (page > 0) dispatch(setResultsStatus(resultsStatuses.LOADING))
        else dispatch(setResultsStatus(resultsStatuses.SEARCHING))

        page = page || 0
        let from = page
        from *= resultsPerPage

        let hasGeoBoundingBox = true //false

        // Make aggs from filter.field and filter.props.fields
        let aggs = {}

        // Make query
        let query = {}
        if (filterType === 'advanced') {
            const advancedFilters = state.getIn(['advancedFilters'])

            if (advancedFilters) {
                const trimmedQuery = removeComments(advancedFilters)
                query.query_string = {
                    query: `_exists_:gather.uri AND (${trimmedQuery})`,
                }
            }
        } else {
            Object.keys(activeFilters).forEach((filter) => {
                let geo_bounding_boxContinuity = -1

                activeFilters[filter].facets.forEach((facet, idx) => {
                    let field = facet.field

                    if (filter[0] !== '_' && facet.type != 'geo_bounding_box') {
                        switch (facet.type) {
                            case 'input_range':
                                if (facet.nestedPath) {
                                    aggs[filter] = {
                                        nested: {
                                            path: facet.nestedPath,
                                        },
                                        aggs: {
                                            nested: {
                                                variable_width_histogram: {
                                                    field: field,
                                                    buckets: 64,
                                                },
                                                aggs: {
                                                    reverse_nested: {
                                                        reverse_nested: {},
                                                    },
                                                },
                                            },
                                        },
                                    }
                                } else {
                                    aggs[filter] = {
                                        variable_width_histogram: {
                                            field: field,
                                            buckets: 64,
                                        },
                                    }
                                }
                                break
                            case 'date_range':
                                aggs[filter] = {
                                    date_histogram: {
                                        field: field,
                                        fixed_interval: '30d',
                                        order: { _key: 'asc' },
                                    },
                                }
                                break
                            case 'geo_bounding_box':
                                break
                            default:
                                if (facet.nestedPath) {
                                    aggs[filter] = {
                                        nested: {
                                            path: facet.nestedPath,
                                        },
                                        aggs: {
                                            nested: {
                                                terms: {
                                                    field: field,
                                                    size: 500,
                                                    order: { _key: 'asc' },
                                                },
                                                aggs: {
                                                    reverse_nested: {
                                                        reverse_nested: {},
                                                    },
                                                },
                                            },
                                        },
                                    }
                                } else {
                                    aggs[filter] = {
                                        terms: {
                                            field: field,
                                            size: 500,
                                            order: { _key: 'asc' },
                                        },
                                    }
                                }
                                break
                        }
                    }

                    if (facet.state) {
                        switch (facet.type) {
                            case 'query_string':
                                if (facet.state.input != null && facet.state.input.length > 0) {
                                    query.bool = query.bool || {
                                        must: [],
                                    }
                                    query.bool.must.push({
                                        simple_query_string: {
                                            query: facet.state.input,
                                        },
                                    })
                                }
                                break
                            case 'text':
                            case 'number':
                                if (facet.state.input != null) {
                                    query.bool = query.bool || {
                                        must: [],
                                    }
                                    query.bool.must.push({
                                        match: {
                                            [field]: facet.state.input,
                                        },
                                    })
                                }
                            case 'input_range':
                            case 'slider_range':
                                if (
                                    facet.state.range != null &&
                                    facet.state.range.length == 2 &&
                                    facet.state.range[0] != null &&
                                    facet.state.range[1] != null
                                ) {
                                    query.bool = query.bool || {
                                        must: [],
                                    }

                                    if (facet.nestedPath) {
                                        query.bool.must.push({
                                            nested: {
                                                path: facet.nestedPath,
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                range: {
                                                                    [field]: {
                                                                        gte: facet.state.range[0],
                                                                        lte: facet.state.range[1],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        })
                                    } else {
                                        query.bool.must.push({
                                            range: {
                                                [field]: {
                                                    gte: facet.state.range[0],
                                                    lte: facet.state.range[1],
                                                },
                                            },
                                        })
                                    }
                                }
                                break
                            case 'date_range':
                                if (
                                    facet.state.daterange != null &&
                                    (facet.state.daterange.start != null ||
                                        facet.state.daterange.end != null)
                                ) {
                                    query.bool = query.bool || {
                                        must: [],
                                    }
                                    query.bool.must.push({
                                        range: {
                                            [field]: {
                                                gte:
                                                    facet.state.daterange.start ||
                                                    '0001-01-01T00:00:00.000Z',
                                                lte:
                                                    facet.state.daterange.end ||
                                                    '9999-01-01T00:00:00.000Z',
                                            },
                                        },
                                    })
                                }
                                break
                            case 'geo_bounding_box':
                                if (facet.state.range != null && facet.state.range.length > 0) {
                                    hasGeoBoundingBox = true
                                    query.bool = query.bool || {
                                        must: [],
                                    }
                                    // Combines separate facets into one
                                    if (geo_bounding_boxContinuity >= 0) {
                                        if (
                                            query.bool.must.length > 0 &&
                                            query.bool.must[query.bool.must.length - 1]
                                                .geo_bounding_box != null
                                        ) {
                                            geo_bounding_boxContinuity = null
                                            switch (facet.term) {
                                                case 'lon':
                                                    query.bool.must[
                                                        query.bool.must.length - 1
                                                    ].geo_bounding_box[field].top_left.lon =
                                                        facet.state.range[0]
                                                    query.bool.must[
                                                        query.bool.must.length - 1
                                                    ].geo_bounding_box[field].bottom_right.lon =
                                                        facet.state.range[1]
                                                    break
                                                case 'lat':
                                                    query.bool.must[
                                                        query.bool.must.length - 1
                                                    ].geo_bounding_box[field].top_left.lat =
                                                        facet.state.range[1]
                                                    query.bool.must[
                                                        query.bool.must.length - 1
                                                    ].geo_bounding_box[field].bottom_right.lat =
                                                        facet.state.range[0]
                                                    break
                                                default:
                                            }
                                        }
                                    } else {
                                        query.bool.must.push({
                                            geo_bounding_box: {
                                                [field]: {
                                                    top_left: {
                                                        lat:
                                                            facet.term === 'lat'
                                                                ? facet.state.range[1]
                                                                : 90,
                                                        lon:
                                                            facet.term === 'lon'
                                                                ? facet.state.range[0]
                                                                : -180,
                                                    },
                                                    bottom_right: {
                                                        lat:
                                                            facet.term === 'lat'
                                                                ? facet.state.range[0]
                                                                : -90,
                                                        lon:
                                                            facet.term === 'lon'
                                                                ? facet.state.range[1]
                                                                : 180,
                                                    },
                                                },
                                            },
                                        })
                                        geo_bounding_boxContinuity = idx
                                    }
                                }
                                break
                            default:
                                Object.keys(facet.state).forEach((value) => {
                                    if (facet.state[value]) {
                                        query.bool = query.bool || {
                                            must: [],
                                        }
                                        if (facet.nestedPath) {
                                            query.bool.must.push({
                                                nested: {
                                                    path: facet.nestedPath,
                                                    query: {
                                                        bool: {
                                                            must: [
                                                                {
                                                                    match: {
                                                                        [field]: value,
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                            })
                                        } else {
                                            query.bool.must.push({
                                                match: {
                                                    [field]: value,
                                                },
                                            })
                                        }
                                    }
                                })
                        }
                    }
                })
            })
        }

        // Default to searching everything with a gather
        if (query.query_string == null) {
            query.bool = query.bool || {}
            query.bool.must = query.bool.must || []
            query.bool.must.push({ exists: { field: 'gather.uri' } })
        }

        // === Secondary aggs
        // Always include a mission agg so that other components can know
        // what the active missions are
        aggs._activeMissions = {
            terms: { field: ES_PATHS.mission.join('.'), size: 500, order: { _key: 'asc' } },
        }
        if (hasGeoBoundingBox)
            aggs._geoGrid = {
                geohash_grid: {
                    field: ES_PATHS.geo_location.join('.'),
                    precision: 2,
                },
            }

        const dsl = {
            query,
            from,
            size: resultsPerPage,
            sort: [{ [resultSorting.field]: resultSorting.direction, ['release_id']: 'desc' }],
            aggs,
            collapse: {
                field: 'uri',
            },
            track_total_hits: true,
            _source: ['uri', 'gather', 'release_id'],
        }

        lastDSL = dsl

        axios
            .post(`${domain}${endpoints.search}`, dsl, getHeader())
            .then((response) => {
                const aggs = response.data.aggregations || {}
                const urlHasQuery = url != null ? Object.keys(url.query).length > 0 : false
                if (!urlHasQuery) {
                    let cartImages = []
                    for (let i = 0; i < 4 && i < response.data.hits.hits.length; i++)
                        cartImages.push(getIn(response.data.hits.hits[i]._source, ES_PATHS.thumb))

                    const resultsTotal = getIn(response, 'data.hits.total.value')
                    dispatch({
                        type: ACTIONS.SET_LAST_QUERY,
                        payload: {
                            total: resultsTotal,
                            images: cartImages.reverse(),
                            query: dsl.query,
                        },
                    })

                    // Update Results
                    dispatch({
                        type: ACTIONS.ADD_RESULTS,
                        payload: {
                            results: response.data.hits.hits,
                            total: resultsTotal,
                            page: page,
                        },
                    })

                    if (resultsTotal === 0) dispatch(setResultsStatus(resultsStatuses.NONE))
                    else dispatch(setResultsStatus(resultsStatuses.SUCCESSFUL))
                }
                // Set Active Missions list
                if (aggs._activeMissions?.buckets) {
                    const nextActiveMissions = []
                    aggs._activeMissions.buckets.forEach((b) => {
                        if (b.doc_count > 0) {
                            nextActiveMissions.push(b.key)
                        }
                    })
                    dispatch(updateActiveMissions(nextActiveMissions))
                }

                // Geogrid
                const geoLngLatBuckets = {
                    lat: {},
                    lng: {},
                }
                if (aggs._geoGrid?.buckets) {
                    const geoGrid = []
                    aggs._geoGrid.buckets.forEach((g) => {
                        // bbox is [minlat, minlon, maxlat, maxlon]
                        const bbox = geohash.decode_bbox(g.key)
                        geoGrid.push({
                            bbox: bbox,
                            doc_count: g.doc_count,
                            key: g.key,
                        })
                        const latId = bbox[0] + ',' + bbox[2]
                        const lngId = bbox[1] + ',' + bbox[3]
                        if (geoLngLatBuckets.lat[latId] != null) {
                            geoLngLatBuckets.lat[latId].doc_count += g.doc_count
                        } else {
                            geoLngLatBuckets.lat[bbox[0] + ',' + bbox[2]] = {
                                min: bbox[0],
                                max: bbox[2],
                                doc_count: g.doc_count,
                            }
                        }
                        if (geoLngLatBuckets.lng[lngId] != null) {
                            geoLngLatBuckets.lng[lngId].doc_count += g.doc_count
                        } else {
                            geoLngLatBuckets.lng[bbox[1] + ',' + bbox[3]] = {
                                min: bbox[1],
                                max: bbox[3],
                                doc_count: g.doc_count,
                            }
                        }
                    })
                    geoLngLatBuckets.lat = Object.keys(geoLngLatBuckets.lat)
                        .map((b) => geoLngLatBuckets.lat[b])
                        .sort((a, b) => parseFloat(a.min) - parseFloat(b.max))
                    geoLngLatBuckets.lng = Object.keys(geoLngLatBuckets.lng)
                        .map((b) => geoLngLatBuckets.lng[b])
                        .sort((a, b) => parseFloat(a.min) - parseFloat(b.max))
                    aggs['bounding_box'] = geoLngLatBuckets
                    dispatch(updateGeoGrid(geoGrid))
                } else {
                    dispatch(updateGeoGrid([]))
                }

                // Update Filters
                let nextActiveFilters = activeFilters
                if (filtersNeedUpdate) {
                    Object.keys(nextActiveFilters).forEach((filter) => {
                        if (filter[0] !== '_' && aggs[filter])
                            nextActiveFilters[filter].facets.forEach((facet, i) => {
                                if (facet.type == 'keyword') {
                                    let buckets = aggs[filter].buckets

                                    // Account for nested buckets
                                    if (aggs[filter].nested) {
                                        buckets = []
                                        aggs[filter].nested.buckets.forEach((b) => {
                                            const newBucket = {
                                                key: b.key,
                                                doc_count: b.reverse_nested
                                                    ? b.reverse_nested.doc_count
                                                    : b.doc_count,
                                            }
                                            buckets.push(newBucket)
                                        })
                                    }
                                    // We merge on keywords so that users can always see the full list
                                    nextActiveFilters[filter].facets[i].fields = mergeFields(
                                        nextActiveFilters[filter].facets[i].fields,
                                        buckets
                                    )
                                } else if (facet.type == 'geo_bounding_box') {
                                    if (geoLngLatBuckets != null)
                                        if (facet.term == 'lat') {
                                            nextActiveFilters[filter].facets[i].fields =
                                                geoLngLatBuckets.lat
                                        }
                                    if (facet.term == 'lon') {
                                        nextActiveFilters[filter].facets[i].fields =
                                            geoLngLatBuckets.lng
                                    }
                                } else {
                                    let buckets = aggs[filter].buckets

                                    // Account for nested buckets
                                    if (aggs[filter].nested) {
                                        buckets = []
                                        aggs[filter].nested.buckets.forEach((b) => {
                                            const newBucket = {
                                                key: b.key,
                                                doc_count: b.reverse_nested
                                                    ? b.reverse_nested.doc_count
                                                    : b.doc_count,
                                            }
                                            if (b.min != null) newBucket.min = b.min
                                            if (b.max != null) newBucket.max = b.max
                                            buckets.push(newBucket)
                                        })
                                    }

                                    nextActiveFilters[filter].facets[i].fields = buckets
                                }
                            })
                    })
                    dispatch(updateActiveFilters(nextActiveFilters))
                    dispatch(checkItemInResults('clear'))
                }

                if (pageNeedsUpdate) {
                    dispatch({
                        type: ACTIONS.SET_RESULTS_PAGE,
                        payload: { page },
                    })
                }

                // If this search is capturing state from the url...
                // We need to do this after the main first query to retain all the match_all aggs
                if (urlHasQuery) {
                    let isAdvancedFilter = false
                    Object.keys(url.query).forEach((q) => {
                        // In case coming from record page
                        if (q === 'id') return
                        // skip the rest if the url is advanced
                        if (isAdvancedFilter) return
                        if (q === '_adv') {
                            isAdvancedFilter = true
                            dispatch(setAdvancedFilters(decodeURI(url.query[q]), true))
                            dispatch(setFilterType('advanced'))
                        } else {
                            let qSplit = q.split('.')
                            const q2 = qSplit[qSplit.length - 1].split('-')
                            const qMain = q
                            const qIdx = parseInt(q2[1] || '0')
                            qSplit = qSplit.join('..groups..').split('..')
                            if (qSplit.length === 2) qSplit.unshift('default')
                            const addFilter = getIn(atlasMapping.groups, qSplit) || {}

                            let filterState = {}
                            if (q[0] === '_') {
                                filterState.text = url.query[q]
                            } else {
                                url.query[q].split(',').forEach((v) => {
                                    filterState[v] = true
                                })
                            }
                            if (
                                nextActiveFilters[qMain] == null &&
                                addFilter?.facets?.[qIdx] != null
                            ) {
                                addFilter.facets[qIdx].state = filterState
                                nextActiveFilters[qMain] = addFilter
                            } else if (nextActiveFilters?.[qMain]?.facets?.[qIdx] != null) {
                                nextActiveFilters[qMain].facets[qIdx].state = filterState
                            }
                        }
                    })
                    dispatch(search(null, true, null, null, nextActiveFilters))
                }
                // console.log(state.toJS())
            })
            .catch((err) => {
                dispatch(
                    setResultsStatus(resultsStatuses.ERROR, { error: err == null ? '' : err + '' })
                )
            })
    }
}

/**
 * Searches for a single uri and updates the active recordData
 *
 * @param {string} uri
 */
export const searchRecordByURI = (uri) => {
    return (dispatch, getState) => {
        if (uri == null) {
            const urlParams = new URLSearchParams(window.location.search)
            uri = urlParams.get('uri')
        }
        // Make query
        const query = {
            bool: {
                must: [
                    {
                        match: { uri: uri },
                    },
                ],
            },
        }

        const dsl = {
            query,
            sort: [{ ['release_id']: 'desc' }],
            collapse: {
                field: 'uri',
            },
            from: 0,
            size: 1,
        }

        axios
            .post(`${domain}${endpoints.search}`, dsl, getHeader())
            .then((response) => {
                const newRecordData = getIn(response, ['data', 'hits', 'hits', 0, '_source'], {})

                dispatch(setRecordData(newRecordData))
            })
            .catch((err) => {
                console.error('searchRecordByURI - DSL Error')
                console.dir(err)
            })
    }
}

/**
 * Searches for a single uri and updates the active recordData
 *
 * @param {string} uri
 */
export const getDataByURI = (name, uri, release_id, skipGetPDS) => {
    return (dispatch, getState) => {
        if (uri == null) return
        axios
            .get(skipGetPDS === true ? uri : getPDSUrl(uri, release_id))
            .then((response) => {
                dispatch(setData(name, response.data || {}))
            })
            .catch((err) => {
                console.error('getDataByURI - Error')
                console.dir(err)
            })
    }
}

/**
 * Used for user selection of facet fields
 *
 * @param {string} filterKey - name of filter
 * @param {number} fieldId - index of field under filter
 * @param {any} state - field state
 */
export const setFieldState = (filterKey, fieldId, state, dontSearch) => {
    return (dispatch, getState) => {
        dispatch({
            type: ACTIONS.SET_FIELD_STATE,
            payload: {
                filterKey,
                fieldId,
                state,
            },
        })

        dispatch(clearResults())

        if (dontSearch == null) dispatch(search(0, true, true))
    }
}

/**
 * Sets the advancedFilters query
 *
 * @param {string} advancedFilters - full code editor string
 */
export const setAdvancedFilters = (advancedFilters, dontSearch) => {
    return (dispatch, getState) => {
        dispatch({
            type: ACTIONS.SET_ADVANCED_FILTERS,
            payload: {
                advancedFilters,
            },
        })

        dispatch(clearResults())

        if (dontSearch == null) dispatch(search(0, true, true))
    }
}
/**
 * Clears the advancedFilters query
 *
 * @param {boolean} dontSearch - dont search after
 */
export const clearAdvancedFilters = (dontSearch) => {
    return (dispatch, getState) => {
        dispatch({
            type: ACTIONS.CLEAR_ADVANCED_FILTERS,
            payload: {
                advancedFilters: null,
            },
        })

        dispatch(clearResults())

        if (dontSearch == null) dispatch(search(0, true, true))
    }
}
/**
 * Sets the advancedFilters expression (is invalid if isError: true)
 *
 * @param {object} expression - react-filter-box expression
 */
export const setAdvancedFiltersExpression = (expression) => {
    return {
        type: ACTIONS.SET_ADVANCED_FILTERS_EXPRESSION,
        payload: {
            expression,
        },
    }
}

export const setMapSearchBoundary = (geometry) => {
    return (dispatch, getState) => {
        const filterKey = 'bounding_box'
        if (geometry == null) {
            dispatch(removeActiveFilters(filterKey))
            dispatch(clearResults())
            dispatch(search(0, true))
            return
        }

        let minLng = -180
        let maxLng = 180
        let minLat = -90
        let maxLat = 90

        switch (geometry.type) {
            case 'Polygon':
                minLng = geometry.coordinates[0][0][0]
                maxLng = geometry.coordinates[0][2][0]
                minLat = geometry.coordinates[0][0][1]
                maxLat = geometry.coordinates[0][2][1]
                break
            case 'Point':
                console.warn(`Warning - Point geometry type not fully implemented`)
                break
            default:
                console.warn(`Warning - Unknown map boundary geometry type: ${geometry.type}`)
                return
        }

        const state = getState()
        const activeFilters = state.get('activeFilters').toJS()

        const mappings = state.getIn(['mappings', 'atlas'])

        const boundaryLongitudeFilterState = {
            range: [Math.max(minLng, -179.99999999), Math.min(maxLng, 179.99999999)],
        }
        const boundaryLatitudeFilterState = {
            range: [Math.max(minLat, -89.99999999), Math.min(maxLat, 89.99999999)],
        }
        // Add the bounding box filter if not already set
        if (activeFilters.bounding_box == null) {
            const boundaryFilter = {
                display_name: 'Bounding Box',
                facets: [
                    {
                        field_name: 'longitude',
                        field: 'gather.common.geo_location',
                        term: 'lon',
                        type: 'geo_bounding_box',
                        units: 'degrees',
                        component: 'slider_range',
                        props: {
                            min: -180,
                            max: 180,
                            step: 0.1,
                        },
                    },
                    {
                        field_name: 'latitude',
                        field: 'gather.common.geo_location',
                        term: 'lat',
                        type: 'geo_bounding_box',
                        units: 'degrees',
                        component: 'slider_range',
                        props: {
                            min: -90,
                            max: 90,
                            step: 0.1,
                        },
                    },
                ],
            }
            boundaryFilter.facets[0].state = boundaryLongitudeFilterState
            boundaryFilter.facets[1].state = boundaryLatitudeFilterState
            dispatch(
                addActiveFilters({
                    [filterKey]: boundaryFilter,
                })
            )

            dispatch(clearResults())
            dispatch(search(0, true, true))
        }
        // Just update state
        else {
            // True to disable search so that we don't search twice
            dispatch(setFieldState(filterKey, 0, boundaryLongitudeFilterState, true))
            dispatch(setFieldState(filterKey, 1, boundaryLatitudeFilterState))
        }
    }
}

/**
 * Adds search results to the client model
 *
 * @param {array} results - results to add
 * @param {number} from - search index results starts from
 * @return {Object} redux action
 */
export const addResults = (results, page) => {
    return {
        type: ACTIONS.ADD_RESULTS,
        payload: {
            results,
            page,
        },
    }
}

/**
 * Clears all sort results
 *
 * @return {Object} redux action
 */
export const clearResults = () => {
    return {
        type: ACTIONS.CLEAR_RESULTS,
        payload: {},
    }
}

/**
 * Sets the status of results
 *
 * @return {Object} redux action
 */
export const setResultsStatus = (status, message) => {
    return {
        type: ACTIONS.SET_RESULTS_STATUS,
        payload: { status, message },
    }
}

/**
 * Sets the current page
 *
 * @return {Object} redux action
 */
export const setResultsPage = (page) => {
    return (dispatch, getState) => {
        const state = getState()
        const existingPaging = state.getIn(['resultsPaging']).toJS()
        const activePages = existingPaging.activePages

        // If we already have the page, just switch it.
        if (activePages.includes(page))
            dispatch({
                type: ACTIONS.SET_RESULTS_PAGE,
                payload: { page },
            })
        // Otherwise we have to search
        else dispatch(search(page, false, true))
    }
}

/**
 * Changes the results' sorting method
 *
 * @param {string} field - field to sort on
 * @param {string} direction - 'ASC' | 'DESC'
 * @return {Object} redux action
 */
export const setResultSorting = (field, direction) => {
    return (dispatch, getState) => {
        const state = getState()
        const currentSorting = state.getIn(['resultSorting']).toJS()
        const newSorting = {
            field: field || currentSorting.field,
            direction: direction || currentSorting.direction,
            defaultField: currentSorting.defaultField,
        }
        if (
            currentSorting.field != newSorting.field ||
            currentSorting.direction != newSorting.direction
        ) {
            dispatch({
                type: ACTIONS.SET_RESULT_SORTING,
                payload: newSorting,
            })
            dispatch(clearResults())
            dispatch(search())
        }
    }
}

/**
 * Changes the result table view's ordered columns
 *
 * @param {array[string]} columns - field to sort on
 * @return {Object} redux action
 */
export const setResultsTableColumns = (columns) => {
    return {
        type: ACTIONS.SET_RESULTS_TABLE_COLUMNS,
        payload: {
            columns,
        },
    }
}

/**
 * Check item in results
 *
 * @param {key} - result item key
 * @param {on} - default toggles | true | false
 * @return {Object} redux action
 */
export const checkItemInResults = (key, on) => {
    return (dispatch, getState) => {
        let payload = {
            key,
            on,
        }
        dispatch({
            type: ACTIONS.CHECK_ITEM_IN_RESULTS,
            payload: payload,
        })
    }
}

/**
 * Sets the grid item size for the results gridView
 *
 * @param {number} gridSize - Desired size of grid item in px
 * @return {Object} redux action
 */
export const setGridSize = (gridSize) => {
    return {
        type: ACTIONS.SET_GRID_SIZE,
        payload: {
            gridSize,
        },
    }
}

// ==================== RECORD RELATED ====================

/**
 * sets the record for the record page
 *
 * @param {Object} recordData - es hit _source
 * @return {Object} redux action
 */
export const setRecordData = (recordData) => {
    return {
        type: ACTIONS.SET_RECORD_DATA,
        payload: {
            recordData,
        },
    }
}

/**
 * sets the label for the record page
 *
 * @param {Object} labelData - es hit _source
 * @return {Object} redux action
 */
export const setLabelData = (labelData) => {
    return {
        type: ACTIONS.SET_LABEL_DATA,
        payload: {
            labelData,
        },
    }
}

/**
 * sets the record page tab
 *
 * @param {string} newRecordViewTab
 * @return {Object} redux action
 */
export const setRecordViewTab = (newRecordViewTab) => {
    return {
        type: ACTIONS.SET_RECORD_VIEW_TAB,
        payload: {
            newRecordViewTab,
        },
    }
}

// ================= FILE-EXPLORER RELATED =================
const FILEX_PAGE_SIZE = 1500
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
 * @return {Object} redux action
 */
export const addFilexColumn = (type, sort, fields, value, active, isLast, cb) => {
    return (dispatch, getState) => {
        let payload = {
            type: type || 'directory',
            sort: sort || 'az',
            pageSize: FILEX_PAGE_SIZE,
            results: null,
            active: active || null,
        }
        if (payload.type === 'filter') {
            payload.fields = fields || [{ display_name: 'Unset', value: 'none' }]
            payload.value = value || payload.fields[0].value
            payload.display_name = payload.fields[0].display_name || value
        }
        dispatch({
            type: ACTIONS.ADD_FILEX_COLUMN,
            payload: payload,
        })
        dispatch(queryFilexColumn(null, isLast, cb))
    }
}
/**
    EX store columns obj:
    [
            {
                type: 'filter', // || 'volume' || 'directory' 
                fields: [
                    { display_name: 'Missions', value: 'mission' },
                    { display_name: 'Spacecraft', value: 'spacecraft' },
                    { display_name: 'Targets', value: 'target' },
                    { display_name: 'Instruments', value: 'instrument' },
                ],
                value: 'mission',
                sort: 'az', // || 'za' || 'size-asc' || 'size-desc' || 'date-asc' || 'date-desc'
                results: [],
                active: null,
            },
            {
                type: 'directory', // || 'filter'
                sort: 'az', // || 'za' || 'size-asc' || 'size-desc' || 'date-asc' || 'date-desc'
                results: [],
                active: null,
            },
    ]
 */

/**
 * Removes a column(s) from the file explorer
 *
 * @param {number} columnId - columnId to remove along with all columns after it
 * @return {Object} redux action
 */
export const removeFilexColumn = (columnId) => {
    return {
        type: ACTIONS.REMOVE_FILEX_COLUMN,
        payload: {
            columnId: columnId,
        },
    }
}

/**
 * Updates a column in the file explorer
 *
 * @param {number} columnId - columnId to update
 * @param {Object} options - object of keys with values to update to
 * @return {Object} redux action
 */
let usedURLState = false
export const updateFilexColumn = (columnId, options, stopPropagate, forcePropagate, forceUrl) => {
    return (dispatch, getState) => {
        const state = getState()

        if (options.removePreview) {
            columnId = state.get('columns').length - 1
            options.active = null
            dispatch(setFilexPreview({}))
        }

        const oldColumn = state.getIn(['columns', columnId])

        let isFinalFilter = false
        if (oldColumn.type === 'filter') {
            isFinalFilter = true
            const nextColumn = state.getIn(['columns', columnId + 1])
            if (nextColumn && nextColumn.type != 'filter') isFinalFilter = true
        }

        dispatch({
            type: ACTIONS.UPDATE_FILEX_COLUMN,
            payload: {
                columnId: columnId,
                options: options,
            },
        })

        // Updated dropdown value
        if (
            oldColumn.type === 'filter' &&
            options.value != null &&
            oldColumn.value != options.value
        ) {
            dispatch(queryFilexColumn(columnId))
        }

        if (options.search) {
            if (options.search.withChildren) {
            } else {
                dispatch(queryFilexColumn(columnId))
            }
        }

        // Updated active
        if (
            (options.active &&
                ((options.active && typeof oldColumn.active === 'string') ||
                    oldColumn.active == null ||
                    oldColumn.active.key != options.active.key)) ||
            forcePropagate
        ) {
            // Clear all following columns
            if (stopPropagate !== true) dispatch(removeFilexColumn(columnId + 1))
            if (options.active.fs_type === 'file') {
                // We're selecting a file
                dispatch(setFilexPreview(options.active))
            } else {
                // We're navigating!
                // Then add a next one
                if (stopPropagate !== true || forcePropagate) {
                    const url = forceUrl || new Url(window.location, true)
                    const mission = url.query.mission || splitUri(url.query.uri).mission
                    const instrument = url.query.instrument
                    const uriPrefix = splitUri(url.query.uri, 'spacecraft')
                    let volume = url.query.bundle || splitUri(url.query.uri).bundle

                    if (columnId === 0) {
                        dispatch(
                            addFilexColumn(
                                'filter',
                                'az',
                                [
                                    {
                                        display_name: 'Instruments',
                                        value: ES_PATHS.archive.instrument.join('.'),
                                    },
                                ],
                                ES_PATHS.archive.instrument.join('.')
                            )
                        )

                        // Set the value if one came from the url
                        if (!usedURLState) {
                            const nextInstActive =
                                instrument != null ? { active: { key: instrument } } : null
                            if (nextInstActive) dispatch(updateFilexColumn(1, nextInstActive, true))
                        }
                    }
                    dispatch(addFilexColumn(isFinalFilter ? 'volume' : null))

                    // URL state stuff
                    if (!usedURLState && isFinalFilter) {
                        usedURLState = true
                        // Set the value if one came from the url
                        const nextVolActive = volume != null ? { active: { key: volume } } : null
                        if (nextVolActive) dispatch(updateFilexColumn(2, nextVolActive))

                        let rawPath = url.query.uri || ''
                        const splittedUri = splitUri(rawPath)
                        if (
                            splittedUri &&
                            splittedUri.relativeUrl &&
                            splittedUri.relativeUrl.length > 0
                        )
                            rawPath = splittedUri.relativeUrl

                        let path = rawPath
                        if (volume && volume.length > 0 && path.length > 0) {
                            if (path[0] === '/') path = path.substring(1)
                            const splitPath = path.split('/')
                            const rawPathSplit = path.split('/')
                            const rawPathFinal = rawPathSplit[rawPathSplit - 1]
                            splitPath.shift()
                            // Previous columns needs to query before adding new ones
                            function add(pathId) {
                                const key = splitPath[pathId]
                                const uri =
                                    uriPrefix +
                                    rawPath.substring(0, rawPath.lastIndexOf(key) + key.length)
                                const isFinalFile = key.includes('.') && key[key.length - 1] === '-'
                                // || rawPathFinal === key

                                dispatch(
                                    updateFilexColumn(
                                        pathId + 3,
                                        {
                                            active: {
                                                key: isFinalFile ? key.slice(0, -1) : key,
                                                uri: isFinalFile ? uri.slice(0, -1) : uri,
                                                _needsData: isFinalFile,
                                            },
                                        },
                                        isFinalFile
                                    )
                                )
                                if (pathId + 1 < splitPath.length) add(pathId + 1)
                            }
                            add(0)
                        }
                    }
                }
                dispatch(setFilexPreview(options.active))
            }
        }
    }
}

/**
 * Queries a column for results in the file explorer
 *
 * @param {number} [columnId=last] - columnId to query
 * @param {function} [cb] - callback
 * @return {Object} redux action
 */
export const queryFilexColumn = (columnId, isLast, cb) => {
    return (dispatch, getState) => {
        const state = getState()

        const columns = state.getIn(['columns'])

        if (columns.length == 0) return

        if (columnId == null) columnId = columns.length - 1

        const column = columns[columnId]

        const pageSize = column.pageSize || FILEX_PAGE_SIZE

        let from = 0
        if (column.results) {
            from = column.results.length
        }

        // Make query
        const query = {
            bool: {
                must: [],
            },
        }

        let uriPrefix = ''
        const lastFilexFilterDoc = state.getIn(['lastFilexFilterDoc'])
        const url = new Url(window.location, true)
        if (lastFilexFilterDoc?.uri || url.query.uri)
            uriPrefix = splitUri(lastFilexFilterDoc?.uri || url.query.uri, 'spacecraft')

        // Previous columns only
        for (let i = 0; i < columnId; i++) {
            const col = columns[i]
            if (col.active) {
                switch (col.type) {
                    case 'filter':
                        query.bool.must.push({
                            match: {
                                [col.value]: col.active.key,
                            },
                        })
                        break
                    case 'volume':
                        if (i == columnId - 1)
                            query.bool.must.push({
                                query_string: {
                                    query: `*\\:\\/${col.active.key}`,
                                    default_field: ES_PATHS.archive.parent_uri.join('.'),
                                },
                            })
                        /*
                            query.bool.must.push({
                                match: {
                                    [ES_PATHS.archive.parent_uri.join(
                                        '.'
                                    )]: `${uriPrefix}/${col.active.key}`,
                                },
                            })
                            */
                        break
                    case 'directory':
                        if (i == columnId - 1) {
                            query.bool.must.push({
                                query_string: {
                                    query: `*\\:${splitUri(col.active.uri).relativeUrl.replace(
                                        /\//g,
                                        '\\/'
                                    )}`,
                                    default_field: ES_PATHS.archive.parent_uri.join('.'),
                                },
                            })
                            /*                            
                                query.bool.must.push({
                                    regexp: {
                                        uri: `*\\:${splitUri(col.active.uri).relativeUrl.replace(
                                            /\//g,
                                            '\\/'
                                        )}`,
                                    },
                                })
                                */
                        }
                        break
                    default:
                        break
                }
            }
        }

        if (column.type === 'volume')
            query.bool.must.push({
                match: {
                    'archive.fs_type': 'directory',
                },
            })

        // Make aggs

        const aggs = {}

        // Previous columns including self (directories don't agg)
        if (column.type != 'directory')
            for (let i = 0; i <= columnId; i++) {
                const col = columns[i]
                switch (col.type) {
                    case 'filter':
                        aggs[i] = {
                            terms: {
                                field: col.value,
                                size: 1000,
                            },
                        }
                        break
                    case 'volume':
                        aggs[i] = {
                            terms: {
                                field: ES_PATHS.archive.volume_id.join('.'),
                                size: 1000,
                            },
                        }
                        aggs[`${i}_a`] = {
                            terms: {
                                field: ES_PATHS.archive.bundle_id.join('.'),
                                size: 1000,
                            },
                        }
                        break
                    case 'directory':
                        break
                    default:
                        break
                }
            }

        const dsl = {
            query,
            from: from,
            size: column.type === 'directory' ? pageSize : 1,
            sort: [{ [ES_PATHS.archive.name.join('.')]: 'asc', ['release_id']: 'desc' }],
            collapse: {
                field: 'uri',
            },
            track_total_hits: true,
            aggs,
        }

        const filter_path = `filter_path=${[
            'hits.hits._source.archive',
            'hits.hits._source.uri',
            'hits.hits._source.pds4_label.pds:Identification_Area/pds:version_id',
            'hits.hits._source.pds4_label.lidvid',
            'hits.total,aggregations',
        ].join(',')}`

        axios
            .post(`${domain}${endpoints.archive}?${filter_path}`, dsl, getHeader())
            .then((response) => {
                let results = []
                if (column.type === 'directory')
                    results = getIn(response, ['data', 'hits', 'hits'], [])
                else {
                    results = getIn(response, ['data', 'aggregations', columnId], [])
                    const secondAgg = getIn(
                        response,
                        ['data', 'aggregations', `${columnId}_a`],
                        false
                    )
                    results.sampleEntry = getIn(response, ['data', 'hits', 'hits', '0'], {})
                    if (secondAgg != false) {
                        results.buckets = results.buckets.concat(secondAgg.buckets)
                    }
                    results.buckets = results.buckets.sort((a, b) => a.key.localeCompare(b.key))
                }
                if (column.type === 'filter') {
                    let lastDoc = getIn(response, ['data', 'hits', 'hits', 0, '_source'], null)
                    if (lastDoc != null)
                        dispatch({
                            type: ACTIONS.SET_LAST_FILEX_FILTER_DOC,
                            payload: lastDoc,
                        })
                }

                // If active is preset, reset it with it's true value
                if (
                    column.type === 'directory' &&
                    typeof column.active === 'string' &&
                    from === 0
                ) {
                    let foundActive = false
                    for (let i = 0; i < results.length; i++) {
                        const r = results[i]
                        if (getIn(r, '_source.archive.name') === column.active) {
                            const newActive = {
                                ...r._source,
                                key: column.active,
                            }
                            dispatch(
                                updateFilexColumn(
                                    columnId,
                                    {
                                        active: newActive,
                                    },
                                    !isLast
                                )
                            )
                            foundActive = true
                            if (typeof cb === 'function') cb()
                            break
                        }
                    }
                    if (!foundActive)
                        dispatch(updateFilexColumn(columnId, { active: null }, !isLast))
                }

                if (from === 0) {
                    dispatch({
                        type: ACTIONS.SET_FILEX_COLUMN_RESULTS,
                        payload: {
                            columnId: columnId,
                            results: results || [],
                            total: getIn(response, ['data', 'hits', 'total', 'value'], 0),
                        },
                    })
                } else {
                    // if we're page scrolling for more results
                    dispatch({
                        type: ACTIONS.SET_FILEX_COLUMN_RESULTS,
                        payload: {
                            columnId: columnId,
                            results: column.results.concat(results),
                            total: column.total,
                        },
                    })
                }

                if (columnId === 0) {
                    //Select first mission
                    const url = new Url(window.location, true)
                    const mission = url.query.mission || splitUri(url.query.uri).mission
                    const nextMissionActive = mission != null ? { active: { key: mission } } : null
                    if (nextMissionActive)
                        dispatch(updateFilexColumn(0, nextMissionActive, null, null, url))
                }
            })
            .catch((err) => {
                console.error('DSL Error')
                console.dir(err)
            })
    }
}

/**
 * Go to any uri in FileX without reloading the page
 * Must be same mission and volume/bundle
 *
 * @param {*} uri
 * @returns
 */
export const goToFilexURI = (uri) => {
    return (dispatch, getState) => {
        const state = getState()

        const columns = state.getIn(['columns'])

        // If it's a file, add a -
        if (uri.split('/').pop().indexOf('.') > -1) uri += '-'

        // Find how accurate the existing columns are
        let deleteColsAfter = false
        let goodUri = null
        columns.forEach((col, idx) => {
            if (deleteColsAfter) {
                dispatch(removeFilexColumn(idx))
                return
            }
            if (col.type === 'directory') {
                if (col.active == null || (col.active.uri && uri.indexOf(col.active.uri) === 0)) {
                    //then it's good
                    goodUri = col.active.uri
                } else {
                    // Remove it and all folowing cols
                    deleteColsAfter = true
                }
            }
        })

        let rawGoodPath = goodUri || ''
        const splittedGoodUri = splitUri(rawGoodPath || '')
        if (
            splittedGoodUri &&
            splittedGoodUri.relativeUrl &&
            splittedGoodUri.relativeUrl.length > 0
        )
            rawGoodPath = splittedGoodUri.relativeUrl
        const splitGoodPath = rawGoodPath.split('/')
        splitGoodPath.shift()
        splitGoodPath.shift()

        let rawPath = uri || ''
        const splittedUri = splitUri(rawPath)
        if (splittedUri && splittedUri.relativeUrl && splittedUri.relativeUrl.length > 0)
            rawPath = splittedUri.relativeUrl
        let path = rawPath
        const uriPrefix = splitUri(uri, 'spacecraft')
        const splitPath = path.split('/')
        splitPath.shift()
        splitPath.shift()

        // Previous columns needs to query before adding new ones
        function add(pathId) {
            const key = splitPath[pathId]
            const uri = uriPrefix + rawPath.substring(0, rawPath.lastIndexOf(key) + key.length)
            const isFinalFile = key.includes('.') && key[key.length - 1] === '-'
            // || rawPathFinal === key

            dispatch(
                updateFilexColumn(
                    pathId + 3,
                    {
                        active: {
                            key: isFinalFile ? key.slice(0, -1) : key,
                            uri: isFinalFile ? uri.slice(0, -1) : uri,
                            fs_type: isFinalFile ? 'file' : null,
                            _needsData: isFinalFile,
                        },
                    },
                    isFinalFile
                )
            )
            if (pathId + 1 < splitPath.length) add(pathId + 1)
        }
        add(splitGoodPath.length - 1)
    }
}

/**
 * Searches the archive explorer uris by regex
 *
 * @param {string} uri
 * @param {string} regex
 */
export const queryFilexRegex = (regex, page, options, cb) => {
    return (dispatch, getState) => {
        options = options || {}
        // Make query
        const query = {
            bool: {
                must: [
                    {
                        regexp: {
                            uri: {
                                value: regex,
                                case_insensitive: !options.caseSensitive,
                            },
                        },
                    },
                ],
            },
        }

        // If not including directories, only show files
        if (options.includeDirectories !== true)
            query.bool.must.push({
                match: {
                    'archive.fs_type': 'file',
                },
            })

        const pageSize = options.pageSize || 200
        const dsl = {
            query,
            from: (page || 0) * pageSize,
            size: pageSize,
            sort: [{ ['uri']: 'asc', ['release_id']: 'desc' }],
            collapse: {
                field: 'uri',
            },
            track_total_hits: true,
        }

        const filter_path = `filter_path=${[
            'hits.hits._source.archive',
            'hits.hits._source.uri',
            'hits.hits._source.pds4_label.pds:Identification_Area/pds:version_id',
            'hits.hits._source.pds4_label.lidvid',
            'hits.total',
            'aggregations',
        ].join(',')}`

        axios
            .post(`${domain}${endpoints.search}?${filter_path}`, dsl, getHeader())
            .then((response) => {
                const resultsTotal = getIn(response, 'data.hits.total.value')
                dispatch({
                    type: ACTIONS.SET_LAST_REGEX_QUERY,
                    payload: {
                        total: resultsTotal,
                        query: dsl.query,
                    },
                })

                cb(response)
            })
            .catch((err) => {
                console.error('queryFilexRegex - DSL Error')
                console.dir(err)
            })
    }
}

/**
 * Sets the preview item for the file explorer
 *
 * @param {Object} previewItem - Same as columns[i].active
 * @return {Object} redux action
 */
export const setFilexPreview = (previewItem) => {
    return {
        type: ACTIONS.SET_FILEX_PREVIEW,
        payload: {
            previewItem,
        },
    }
}

// ================= CART RELATED =================
/**
 * Adds to the cart
 *
 * @param {type} - 'image' | 'query'
 * @param {item} - image uuid | a query's dsl
 * @return {Object} redux action
 */
export const addToCart = (type, item) => {
    return (dispatch, getState) => {
        if (type === 'query' && item === 'lastQuery') {
            const state = getState()
            const lastQuery = state.getIn(['lastQuery'])
            if (lastQuery) {
                const query = lastQuery.toJS().query
                const atlasMapping = state.getIn(['mappings', 'atlas'])
                const related = getIn(atlasMapping, ES_PATHS.groups_related)
                const aggs = {}
                const ALLOWED_RELATED = ['browse', 'label', 'src']
                Object.keys(related).forEach((r) => {
                    if (!ALLOWED_RELATED.includes(r)) return
                    aggs[r] = { sum: { field: `${ES_PATHS.related.join('.')}.${r}.size` } }

                    aggs[`${r}_count`] = {
                        filter: {
                            exists: {
                                field: `${ES_PATHS.related.join('.')}.${r}.uri`,
                            },
                        },
                    }
                })

                const dsl = {
                    query,
                    from: 0,
                    size: 0,
                    aggs,
                    track_total_hits: true,
                }

                axios
                    .post(`${domain}${endpoints.search}`, dsl, getHeader())
                    .then((response) => {
                        const total = response.data.hits.total.value
                        const aggs = response.data.aggregations
                        const mergedAggs = {}
                        // Populate
                        Object.keys(aggs).forEach((a) => {
                            if (a.endsWith('_count')) {
                            } else {
                                mergedAggs[a] = aggs[a]
                            }
                        })
                        // Then merge
                        Object.keys(aggs).forEach((a) => {
                            if (a.endsWith('_count')) {
                                const mainA = a.replace('_count', '')
                                mergedAggs[mainA].count = aggs[a].doc_count
                            }
                        })

                        // If src unset or 0 total, force to query total
                        if (mergedAggs.src == null) {
                            mergedAggs.src = { value: 0, count: total }
                        }
                        if (mergedAggs.src.count == 0) mergedAggs.src.count = total

                        dispatch({
                            type: ACTIONS.ADD_TO_CART,
                            payload: {
                                type: type,
                                item: item,
                                aggs: mergedAggs,
                                total: total,
                            },
                        })
                    })
                    .catch((err) => {
                        console.error('addToCart - DSL Error while getting query size metrics.')
                        console.dir(err)
                        dispatch({
                            type: ACTIONS.ADD_TO_CART,
                            payload: {
                                type: type,
                                item: item,
                            },
                        })
                    })
            }
        } else if (type === 'directory') {
            const dsl = {
                query: {
                    bool: {
                        must: [
                            {
                                query_string: {
                                    query: `${item.uri
                                        .replace(/:/g, '\\:')
                                        .replace(/\//g, '\\/')}*`,
                                    default_field: 'uri',
                                },
                            },
                            {
                                match: {
                                    'archive.fs_type': 'file',
                                },
                            },
                        ],
                    },
                },
                from: 0,
                size: 0,
                aggs: { count: { sum: { field: 'archive.size' } } },
                sort: [{ ['release_id']: 'desc' }],
                collapse: {
                    field: 'uri',
                },
                track_total_hits: true,
            }

            item.query = dsl.query
            item.related = { src: { uri: item.uri } }

            axios
                .post(`${domain}${endpoints.search}`, dsl, getHeader())
                .then((response) => {
                    item.total = response.data.hits.total.value
                    const aggs = response.data.aggregations
                    item.related.src.value = aggs.count?.value
                    item.related.src.count = item.total
                    dispatch({
                        type: ACTIONS.ADD_TO_CART,
                        payload: {
                            type,
                            item,
                            aggs,
                        },
                    })
                })
                .catch((err) => {
                    console.error('addToCart - DSL Error while getting directory size metrics.')
                    console.dir(err)
                    dispatch({
                        type: ACTIONS.ADD_TO_CART,
                        payload: {
                            type: type,
                            item: item,
                        },
                    })
                })
        } else if (type === 'regex') {
            const state = getState()
            const lastQuery = state.getIn(['lastRegexQuery'])
            if (lastQuery) {
                const query = lastQuery.toJS().query
                const atlasMapping = state.getIn(['mappings', 'atlas'])
                const related = getIn(atlasMapping, ES_PATHS.groups_related)
                const aggs = {}
                const ALLOWED_RELATED = ['browse', 'label', 'src']
                Object.keys(related).forEach((r) => {
                    if (!ALLOWED_RELATED.includes(r)) return
                    aggs[r] = { sum: { field: `${ES_PATHS.related.join('.')}.${r}.size` } }

                    aggs[`${r}_count`] = {
                        filter: {
                            exists: {
                                field: `${ES_PATHS.related.join('.')}.${r}.uri`,
                            },
                        },
                    }
                })

                const dsl = {
                    query,
                    from: 0,
                    size: 0,
                    aggs,
                    track_total_hits: true,
                }

                axios
                    .post(`${domain}${endpoints.search}`, dsl, getHeader())
                    .then((response) => {
                        const total = response.data.hits.total.value
                        const aggs = response.data.aggregations
                        const mergedAggs = {}
                        // Populate
                        Object.keys(aggs).forEach((a) => {
                            if (a.endsWith('_count')) {
                            } else {
                                mergedAggs[a] = aggs[a]
                            }
                        })
                        // Then merge
                        Object.keys(aggs).forEach((a) => {
                            if (a.endsWith('_count')) {
                                const mainA = a.replace('_count', '')
                                mergedAggs[mainA].count = aggs[a].doc_count
                            }
                        })

                        // If src unset or 0 total, force to query total
                        if (mergedAggs.src == null) {
                            mergedAggs.src = { value: 0, count: total }
                        }
                        if (mergedAggs.src.count == 0) mergedAggs.src.count = total

                        dispatch({
                            type: ACTIONS.ADD_TO_CART,
                            payload: {
                                type: type,
                                item: item,
                                aggs: mergedAggs,
                                total: total,
                            },
                        })
                    })
                    .catch((err) => {
                        console.error('addToCart - DSL Error while getting query size metrics.')
                        console.dir(err)
                        dispatch({
                            type: ACTIONS.ADD_TO_CART,
                            payload: {
                                type: type,
                                item: item,
                            },
                        })
                    })
            }
        } else {
            // image | file
            // If, for whatever reason, there's no related source defined, use existing one
            if (type === 'image' && item.uri && item.related && item.related.src == null) {
                item.related.src = { uri: item.uri }
            }
            if (type === 'file' && item.uri && item.related == null) {
                item.related = { src: { uri: item.uri, value: item.size } }
            }

            dispatch({
                type: ACTIONS.ADD_TO_CART,
                payload: {
                    type: type,
                    item: item,
                },
            })
        }
    }
}

/**
 * Check item in cart
 *
 * @param {index} - cart item index
 * @param {on} - default toggles | true | false
 * @return {Object} redux action
 */
export const checkItemInCart = (index, on) => {
    return (dispatch, getState) => {
        let payload = {
            index: index,
            on,
        }
        dispatch({
            type: ACTIONS.CHECK_ITEM_IN_CART,
            payload: payload,
        })
    }
}

/**
 * Remove from the cart
 *
 * @param {index} - i | 'all'
 * @return {Object} redux action
 */
export const removeFromCart = (index) => {
    return (dispatch, getState) => {
        let payload = {
            index: index,
        }
        dispatch({
            type: ACTIONS.REMOVE_FROM_CART,
            payload: payload,
        })
    }
}

// GENERIC ====

/**
 * Sets the informational snackbar's text
 *
 * @param {text} - string | false
 * @return {Object} redux action
 */
export const setSnackBarText = (text, severity) => {
    return (dispatch, getState) => {
        let payload = {
            text,
            severity,
        }
        dispatch({
            type: ACTIONS.SET_SNACKBAR_TEXT,
            payload: payload,
        })
    }
}

/**
 * Sets generic data holding
 *
 * @param {string} name - name/tag for the data
 * @param {Object} data - anything
 * @return {Object} redux action
 */
export const setData = (name, data) => {
    return {
        type: ACTIONS.SET_DATA,
        payload: {
            name,
            data,
        },
    }
}

/**
 * A wrapper for utils.js' copyToClipboard
 * Pulls data from various parts of store
 * And triggers the snackbar
 *
 * @param {type} - 'DSL' | 'CURL'
 * @return {null}
 */
export const copyToClipboardAction = (type) => {
    return (dispatch, getState) => {
        const formattedLastDSL = JSON.parse(JSON.stringify(lastDSL))
        if (formattedLastDSL.aggs) delete formattedLastDSL.aggs
        if (formattedLastDSL.track_total_hits != null) delete formattedLastDSL.track_total_hits

        switch (type.toLowerCase()) {
            case 'python':
                copyToClipboard(
                    [
                        `import requests`,
                        `r = requests.post("${domain}${endpoints.search}", json=${JSON.stringify(
                            formattedLastDSL,
                            null,
                            2
                        )})`,
                        `print(r.text)`,
                    ].join('\n')
                )
                dispatch(setSnackBarText('Copied Python Command to Clipboard!', 'success'))
                break
            case 'dsl':
                copyToClipboard(JSON.stringify(formattedLastDSL, null, 2))
                dispatch(setSnackBarText('Copied Query to Clipboard!', 'success'))
                break
            case 'curl':
                copyToClipboard(
                    `curl -XPOST "${domain}${endpoints.search}" -d '${JSON.stringify(
                        formattedLastDSL
                    )}'`
                )
                dispatch(setSnackBarText('Copied CURL Command to Clipboard!', 'success'))
                break
            case 'fetch':
                copyToClipboard(
                    [
                        `fetch('${domain}${endpoints.search}', {`,
                        `method: "POST",`,
                        `body: JSON.stringify(${JSON.stringify(formattedLastDSL, null, 2)})`,
                        `})`,
                        `.then((res) => res.json())`,
                        `.then((json) => console.log(json))`,
                        `.catch((err) => console.log(err))`,
                    ].join('\n')
                )
                dispatch(setSnackBarText('Copied Fetch Command to Clipboard!', 'success'))
                break
            default:
                break
        }
    }
}
