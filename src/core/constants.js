export const domain = process.env.REACT_APP_DOMAIN

export const publicUrl = process.env.REACT_APP_PUBLIC_URL || ''

export const endpoints = {
    data: process.env.REACT_APP_DATA_ENDPOINT,
    search: process.env.REACT_APP_SEARCH_ENDPOINT,
    pit: process.env.REACT_APP_PIT_ENDPOINT,
    scroll: process.env.REACT_APP_SCROLL_ENDPOINT,
    archive: process.env.REACT_APP_ARCHIVE_ENDPOINT,
    mitm: `${publicUrl}${
        process.env.NODE_ENV === `production` ? `/atlas` : ``
    }/streamsaver/mitm.html`,
    pdsFieldSearch:
        'https://pds.nasa.gov/services/search/search?fq=product-class%3AProduct_Attribute_Definition&fq=attribute_name%3A{field}&wt=json',
}

export const HASH_PATHS = {
    search: publicUrl + '/search',
    record: publicUrl + '/record',
    cart: publicUrl + '/cart',
    fileExplorer: publicUrl + '/archive-explorer',
    apiDocumentation: '/beta/atlas/documentation/',
}

export const localStorageCart = 'ATLAS_CART'

export const ES_PATHS = {
    source: ['uri'],
    release_id: ['release_id_num'],
    related: ['gather', 'pds_archive', 'related'],
    ml: ['gather', 'machine_learning'],
    ml_classification_related: ['gather', 'machine_learning', 'classification', 'related'],
    supplemental: ['gather', 'pds_archive', 'related', 'supplemental'],
    groups_related: ['groups', 'gather', 'groups', 'pds_archive', 'groups', 'related', 'groups'],
    browse: ['gather', 'pds_archive', 'related', 'browse', 'uri'],
    thumb: ['gather', 'pds_archive', 'related', 'browse', 'uri'],
    label: ['gather', 'pds_archive', 'related', 'label', 'uri'],
    mission: ['gather', 'common', 'mission'],
    spacecraft: ['gather', 'common', 'spacecraft'],
    geo_location: ['gather', 'common', 'geo_location'],
    start_time: ['gather', 'time', 'start_time'],
    target: ['gather', 'common', 'target'],
    instrument: ['gather', 'common', 'instrument'],
    file_name: ['gather', 'pds_archive', 'file_name'],
    pds_standard: ['gather', 'pds_archive', 'pds_standard'],
    product_id: ['gather', 'pds_archive', 'product_id'],
    pds3_label: ['pds3_label'],
    pds4_label: ['pds4_label'],
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
    'vic',
    'gif',
    'png',
    'webp',
    'tif',
    'tiff',
    'bmp',
    'heif',
    'heic',
    'svg',
]
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
