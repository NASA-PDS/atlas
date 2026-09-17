import {
    getPublicUrl,
    getDomain,
    getApiUrl,
    getEsUrl,
    getFootprintUrl,
    getImageryUrl,
    getRegistryUrl,
    getDoiUrl,
} from './runtimeConfig'
import { getAppConfig } from './appConfig'

export const MAX_BULK_DOWNLOAD_COUNT = process.env.MAX_BULK_DOWNLOAD_COUNT || 25000

export const EMAIL_CONTACT = process.env.EMAIL_CONTACT || 'pds-img-jpl@jpl.nasa.gov'

// Call getPublicUrl() to get the value - the function checks for window.APP_CONFIG
// If window doesn't exist or APP_CONFIG isn't set, it falls back to process.env
export const publicUrl = getPublicUrl()
export const domain = getDomain()

const appConfig = getAppConfig()
export const endpoints = {
    data: appConfig.dataEndpoint,
    search: appConfig.searchEndpoint,
    pit: appConfig.pitEndpoint,
    scroll: appConfig.scrollEndpoint,
    archive: appConfig.archiveEndpoint,
    mitm: `${publicUrl}/streamsaver/mitm.html`,
    pdsFieldSearch:
        'https://pds.nasa.gov/services/search/search?fq=product-class%3AProduct_Attribute_Definition&fq=attribute_name%3A{field}&wt=json',
}

// HASH_PATHS now use simple relative paths
// BrowserRouter's basename prop handles the PUBLIC_URL prefix automatically
export const HASH_PATHS = {
    root: '/',
    search: '/search',
    record: '/record',
    cart: '/cart',
    fileExplorer: '/archive-explorer',
    apiDocumentation: '/documentation/',
}

export const localStorageCart = 'ATLAS_CART'

export const ES_PATHS = {
    source: ['uri'],
    uri: ['uri'],
    release_id: ['release_id_num'],
    gather: ['gather'],
    gather_uri: ['gather', 'uri'],
    related: ['gather', 'pds_archive', 'related'],
    ml: ['gather', 'machine_learning'],
    ml_classification_related: ['gather', 'machine_learning', 'classification', 'related'],
    ml_classifications: ['gather', 'machine_learning', 'classification', 'classifications'],
    ml_class: ['gather', 'machine_learning', 'classification', 'classifications', 'class'],
    ml_novelty_score: ['gather', 'machine_learning', 'novelty', 'score'],
    ml_confidence: [
        'gather',
        'machine_learning',
        'classification',
        'classifications',
        'confidence',
    ],
    supplemental: ['gather', 'pds_archive', 'related', 'supplemental'],
    groups_related: ['groups', 'gather', 'groups', 'pds_archive', 'groups', 'related', 'groups'],
    browse: ['gather', 'pds_archive', 'related', 'browse', 'uri'],
    thumb: ['gather', 'pds_archive', 'related', 'browse', 'uri'],
    label: ['gather', 'pds_archive', 'related', 'label', 'uri'],
    mission: ['gather', 'common', 'mission'],
    spacecraft: ['gather', 'common', 'spacecraft'],
    product_type: ['gather', 'common', 'product_type'],
    geo_location: ['gather', 'common', 'geo_location'],
    start_time: ['gather', 'time', 'start_time'],
    target: ['gather', 'common', 'target'],
    instrument: ['gather', 'common', 'instrument'],
    file_name: ['gather', 'pds_archive', 'file_name'],
    pds_standard: ['gather', 'pds_archive', 'pds_standard'],
    product_id: ['gather', 'pds_archive', 'product_id'],
    pds_archive: {
        _self: ['gather', 'pds_archive'],
        pds_standard: ['gather', 'pds_archive', 'pds_standard'],
        product_id: ['gather', 'pds_archive', 'product_id'],
        bundle_id: ['gather', 'pds_archive', 'bundle_id'],
        volume_id: ['gather', 'pds_archive', 'volume_id'],
        collection_id: ['gather', 'pds_archive', 'collection_id'],
        data_set_id: ['gather', 'pds_archive', 'data_set_id'],
    },
    pds3_label: ['pds3_label'],
    archive: {
        name: ['archive', 'name'],
        mission: ['archive', 'mission'],
        spacecraft: ['archive', 'spacecraft'],
        instrument: ['archive', 'instrument'],
        parent_uri: ['archive', 'parent_uri'],
        size: ['archive', 'size'],
        fs_type: ['archive', 'fs_type'],
        bundle_id: ['archive', 'bundle_id'],
        volume_id: ['archive', 'volume_id'],
        pds_standard: ['archive', 'pds_standard'],
        release_id: ['archive', 'release_id_num'],
    },
    pds4_label: {
        _self: ['pds4_label'],
        lidvid: ['pds4_label', 'lidvid'],
    },
}

export const RELATED_MAPPINGS = {
    src: 'Primary Product',
    label: 'PDS Label',
    browse: 'Browse Image',
    full: 'Full-sized Image',
    lg: 'Large Image',
    md: 'Medium Image',
    sm: 'Small Image',
    xs: 'Tiny Image',
    tile: 'DZI Tileset',
    ml_classifier_features: 'ML Classifier Features',
    ml_classifier_label: 'ML Classifier Label',
}

export const resultsStatuses = {
    WAITING: 'waiting',
    SEARCHING: 'searching',
    LOADING: 'loading',
    NONE: 'none',
    SUCCESSFUL: 'successful',
    ERROR: 'error',
}

export const AVAILABLE_URI_SIZES = { xs: 'xs', sm: 'sm', md: 'md', lg: 'lg' }

export const IMAGE_EXTENSIONS = [
    'img',
    'png',
    'jpg',
    'jpeg',
    'vic',
    'gif',
    'webp',
    'tif',
    'tiff',
    'bmp',
    'heif',
    'heic',
    'svg',
]
export const MODEL_EXTENSIONS = ['obj', 'dae']

export const MISSIONS_TO_BODIES = {
    cassini: {
        main: 'Saturn',
        planets: ['saturn'],
        moons: [
            'aegaeon',
            'aegir',
            'albiorix',
            'anthe',
            'atlas',
            'bebhionn',
            'bergelmir',
            'bestla',
            'calypso',
            'daphnis',
            'dione',
            'enceladus',
            'epimetheus',
            'erriapus',
            'farbauti',
            'fenrir',
            'fornjot',
            'greip',
            'hati',
            'helene',
            'hyperion',
            'hyrrokkin',
            'iapetus',
            'ijiraq',
            'janus',
            'jarnsaxa',
            'kari',
            'kiviuq',
            'loge',
            'methone',
            'mimas',
            'mundilfari',
            'narvi',
            'paaliaq',
            'pallene',
            'pan',
            'pandora',
            'phoebe',
            'polydeuces',
            'prometheus',
            'rhea',
            'siarnaq',
            'skathi',
            'skoll',
            'surtur',
            'suttungr',
            'tarqeq',
            'tarvos',
            'telesto',
            'tethys',
            'thrymr',
            'titan',
            'ymir',
        ],
    },
    mars_2020: {
        main: 'Mars',
        planets: ['mars'],
        moons: ['deimos', 'phobos'],
    },
    mro: {
        main: 'Mars',
        planets: ['mars'],
        moons: ['deimos', 'phobos'],
    },
}

export const DISPLAY_NAME_MAPPINGS = {
    'ap': 'Apollo',
    'apollo': 'Apollo',
    'cas': 'Cassini',
    'cassini': 'Cassini',
    'cassini_orbiter': 'Cassini Orbiter',
    'ch1': 'Chandrayaan 1',
    'chandrayaan_1': 'Chandrayaan 1',
    'clem': 'Clementine',
    'clementine': 'Clementine',
    'go': 'Galileo',
    'galileo_orbiter': 'Galileo Orbiter',
    'juno': 'Juno',
    'kplo': { short: 'KPLO', long: 'KPLO - Korea Pathfinder Lunar Orbiter' },
    'lcro': 'LCROSS',
    'lcross': 'LCROSS',
    'lo': 'Lunar Orbiter',
    'lunar_orbiters': 'Lunar Orbiters',
    'lro': 'LRO - Lunar Reconnaissance Orbiter',
    'lunar_reconnaissance_orbiter': 'LRO - Lunar Reconnaissance Orbiter',
    'mgn': 'Magellan',
    'magellan': 'Magellan',
    'mars_2020': 'Mars 2020',
    'm20': 'Mars 2020',
    'perseverance': 'Mars 2020 - Perseverance',
    'mer': 'MER - Mars Exploration Rover',
    'opportunity': 'MER - Opportunity',
    'spirit': 'MER - Spirit',
    'mess': 'Messenger',
    'messenger': 'Messenger',
    'mgs': 'Mars Global Surveyor',
    'mars_global_surveyor': 'Mars Global Surveyor',
    'mpf': 'Mars Pathfinder',
    'csms': 'MPF - Carl Sagan Memorial Station',
    'sojourner': 'MPF - Sojourner',
    'mro': 'MRO - Mars Reconnaissance Orbiter',
    'mars_reconnaissance_orbiter': 'MRO - Mars Reconnaissance Orbiter',
    'msl': 'MSL - Mars Science Laboratory',
    'curiosity': 'MSL - Curiosity',
    'm09': 'Mariner 9',
    'm10': 'Mariner 10',
    'm69': 'Mariner 69',
    'nsyt': 'InSight',
    'insight': 'InSight',
    'insight_lander': 'InSight Lander',
    'nh': 'New Horizons',
    'new_horizons': 'New Horizons',
    'ody': '2001 Mars Odyssey',
    '2001_mars_odyssey': '2001 Mars Odyssey',
    'phx': 'Phoenix',
    'phoenix_lander': 'Phoenix Lander',
    'scalpss': {
        short: 'SCALPSS',
        long: 'SCALPSS - Stereo Cameras for Lunar Plume-Surface Studies',
    },
    'firefly-bg1': { short: 'Blue Ghost M1', long: 'Firefly Blue Ghost Mission 1' },
    'scalpss_to_19d': 'SCALPSS 1.1 (CLPS TO-19D)',
    'SFL0': 'SFL0 - Short Focal Length Camera 0',
    'SFL1': 'SFL1 - Short Focal Length Camera 1',
    'SFL2': 'SFL2 - Short Focal Length Camera 2',
    'SFL3': 'SFL3 - Short Focal Length Camera 3',
    'LFL0': 'LFL0 - Long Focal Length Camera 0',
    'LFL1': 'LFL1 - Long Focal Length Camera 1',
    'vik': 'Viking',
    'viking_orbiter_1': 'Viking Orbiter 1',
    'viking_orbiter_2': 'Viking Orbiter 2',
    'viking_orbiters': 'Viking Orbiters',
    'viking_lander_1': 'Viking Lander 1',
    'viking_lander_2': 'Viking Lander 2',
    'vgr': 'Voyager',
    'voyager_1': 'Voyager 1',
    'voyager_2': 'Voyager 2',
    'voyager': 'Voyager',
}

// A mapping value is either a string (`Short - Long gloss`) or `{ short, long }`.
export const getDisplayNames = (key) => {
    const mapped = DISPLAY_NAME_MAPPINGS[key]
    if (mapped == null) return { short: key, long: key }
    if (typeof mapped === 'string') return { short: mapped.split(' - ')[0], long: mapped }
    return { short: mapped.short, long: mapped.long }
}
export const getDisplayName = (key) => getDisplayNames(key).long
export const getShortDisplayName = (key) => getDisplayNames(key).short
