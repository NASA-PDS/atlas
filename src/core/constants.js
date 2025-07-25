export const domain = process.env.REACT_APP_DOMAIN

export const publicUrl = process.env.REACT_APP_PUBLIC_URL || ''

export const endpoints = {
    data: process.env.REACT_APP_DATA_ENDPOINT,
    search: process.env.REACT_APP_SEARCH_ENDPOINT,
    pit: process.env.REACT_APP_PIT_ENDPOINT,
    scroll: process.env.REACT_APP_SCROLL_ENDPOINT,
    archive: process.env.REACT_APP_ARCHIVE_ENDPOINT,
    mitm: '/streamsaver/mitm.html',
    pdsFieldSearch:
        'https://pds.nasa.gov/services/search/search?fq=product-class%3AProduct_Attribute_Definition&fq=attribute_name%3A{field}&wt=json',
}

export const HASH_PATHS = {
    root: publicUrl + '/',
    search: publicUrl + '/search',
    record: publicUrl + '/record',
    cart: publicUrl + '/cart',
    fileExplorer: publicUrl + '/archive-explorer',
    apiDocumentation: publicUrl + '/documentation/',
}

export const localStorageCart = 'ATLAS_CART'

export const ES_PATHS = {
    source: ['uri'],
    uri: ['uri'],
    release_id: ['release_id_num'],
    gather: ['gather'],
    gather_uri: ['gather', 'uri'],
    related: ['gather', 'pds_archive', 'related'],
    pds_archive: ['gather', 'pds_archive'],
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
    'kplo': 'Korea Pathfinder Lunar Orbiter',
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
