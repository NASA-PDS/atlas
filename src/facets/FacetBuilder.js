import { prettify, setIn, getIn } from '../core/utils'

export const formatMappings = (schema) => {
    const facets = {
        groups: {},
    }
    if (schema?.mappings?.properties == null) return facets

    // Organize pds4_label into folders split on the field's first :
    // disp:Color_Display_Settings/disp:blue_channel_band => disp: { disp:Color_Display_Settings/disp:blue_channel_band: {}, ... }
    const organizedProps_pds4_label = {}
    Object.keys(schema.mappings.properties.pds4_label.properties).forEach((p) => {
        if (p.indexOf(':') > -1) {
            const dir = p.split(':')[0]
            organizedProps_pds4_label[dir] = organizedProps_pds4_label[dir] || { properties: {} }
            organizedProps_pds4_label[dir].properties[p] =
                schema.mappings.properties.pds4_label.properties[p]
        } else {
            organizedProps_pds4_label.common = organizedProps_pds4_label.common || {
                properties: {},
            }
            organizedProps_pds4_label.common.properties[p] =
                schema.mappings.properties.pds4_label.properties[p]
        }
    })
    schema.mappings.properties.pds4_label.properties = organizedProps_pds4_label

    const mappingDepthTraversal = (properties, depth, path, pathRaw, nestedPath) => {
        Object.keys(properties).forEach((propName) => {
            const nextPath = path === '' ? propName : `${path}.${propName}`
            const nextPathSplit = nextPath.split('.')
            const nextPathRaw = pathRaw === '' ? propName : `${pathRaw}.${propName}`
            const nextPathRawSplit = nextPathRaw.split('.')

            const prop = properties[propName]
            if (prop.properties) {
                setIn(facets, nextPathSplit, { display_name: prettify(propName), groups: {} })
                mappingDepthTraversal(
                    prop.properties,
                    depth + 1,
                    `${nextPath}.groups`,
                    nextPathRaw,
                    prop.type === 'nested' ? nextPathRaw : nestedPath
                )
            } else if (depth != 0) {
                let field = nextPathRaw
                field = field.replace(/pds4_label.\w*./, 'pds4_label.')

                switch (prop.type) {
                    case 'keyword':
                        setIn(facets, nextPathSplit, {
                            display_name: propName,
                            description: '',
                            tags: [],
                            facets: [
                                {
                                    field_name: propName,
                                    field: field,
                                    type: 'keyword',
                                    units: '',
                                    component: 'list',
                                    nestedPath: nestedPath || false,
                                },
                            ],
                        })
                        break
                    case 'text':
                        let hasKeywordField =
                            getIn(prop, 'fields.keyword.type', false) === 'keyword'
                        setIn(facets, nextPathSplit, {
                            display_name: propName,
                            description: '',
                            tags: [],
                            facets: [
                                {
                                    field_name: propName,
                                    field: `${field}${hasKeywordField ? '.keyword' : ''}`,
                                    type: hasKeywordField ? 'keyword' : 'text',
                                    units: '',
                                    type: hasKeywordField ? 'keyword' : 'query_string',
                                    component: hasKeywordField ? 'list' : 'text',
                                    nestedPath: nestedPath || false,
                                },
                            ],
                        })
                        break
                    case 'integer':
                    case 'float':
                    case 'long':
                        setIn(facets, nextPathSplit, {
                            display_name: propName,
                            description: '',
                            tags: [],
                            facets: [
                                {
                                    field_name: propName,
                                    field: field,
                                    type: 'input_range',
                                    units: '',
                                    component: 'slider_range',
                                    props: {
                                        //min, max, step
                                    },
                                    nestedPath: nestedPath || false,
                                },
                            ],
                        })
                        break
                    case 'date':
                        setIn(facets, nextPathSplit, {
                            display_name: propName,
                            description: '',
                            tags: [],
                            facets: [
                                {
                                    field_name: propName,
                                    field: field,
                                    type: 'date_range',
                                    field_format: 'ISO',
                                    component: 'date_range',
                                    nestedPath: nestedPath || false,
                                },
                            ],
                        })
                        break
                    default:
                        // geo_point
                        // Undo add
                        break
                }
            }
        })
    }
    mappingDepthTraversal(schema.mappings.properties, 0, 'groups', '')

    return augmentFacets(facets)
}

const augmentFacets = (facets) => {
    // Hide some things
    if (facets.groups.gather.groups.cassini_content)
        delete facets.groups.gather.groups.cassini_content
    if (facets.groups.gather.groups.galileo_content)
        delete facets.groups.gather.groups.galileo_content
    if (facets.groups.gather.groups.mro_landmarks) delete facets.groups.gather.groups.mro_landmarks
    if (facets.groups.gather.groups.msl_content) delete facets.groups.gather.groups.sml_content

    // Add some standard descriptions
    if (facets.groups.gather.groups.common.groups.instrument)
        facets.groups.gather.groups.common.groups.instrument.description =
            '(Atlas Internal) - A standardized instrument field.'
    if (facets.groups.gather.groups.common.groups.kind)
        facets.groups.gather.groups.common.groups.kind.description =
            '(Atlas Internal) - Distinguishes the general sort of product and can select on regular products, thumbnails, models, etc.'
    if (facets.groups.gather.groups.common.groups.mission)
        facets.groups.gather.groups.common.groups.mission.description =
            '(Atlas Internal) - A standardized mission field.'
    if (facets.groups.gather.groups.common.groups.spacecraft)
        facets.groups.gather.groups.common.groups.spacecraft.description =
            '(Atlas Internal) - A standardized spacecraft field.'
    if (facets.groups.gather.groups.common.groups.target)
        facets.groups.gather.groups.common.groups.target.description =
            '(Atlas Internal) - A standardized target field that indicates what object/s the product is of or is looking at.'

    const uriDescription = `(Atlas Internal) - A uniform resource identifier string of the form:
    "atlas:{pds_version}:{mission}:{spacecraft}:/{relative_path}"\n
    ■ {} are replacement variables
    ■ All files (labels, image products, ancillary files) and directories will have such uri
    ■ The relative_path always begins with a / and starts at the bundle/volume level.
    ■ Examples:
        "atlas:pds3:cassini:cassini_orbiter:/COISS_0001/README.txt"
        "atlas:pds4:mars_2020:perseverance:/mars2020_navcam_ops/bundle.xml"
        "atlas:pds4:mars_2020:perseverance:/mars2020_navcam_ops_calibrated/data/sol/00065/ids/rdr/ncam/NLF_0065_0672707826_737CWG_N0032046NCAM00410_0A00LLJ02.IMG"`
    if (facets.groups.gather.groups.uri)
        facets.groups.gather.groups.uri.description = uriDescription
    if (facets.groups.archive.groups.uri)
        facets.groups.archive.groups.uri.description = uriDescription

    return facets
}

export const getInitialActiveFilters = (mapping) => {
    return {
        '_text': {
            display_name: 'Text Search',
            description: 'A generic catch-all textual search.',
            facets: [
                {
                    field_name: 'Search Terms',
                    field: '*',
                    component: 'text',
                    type: 'query_string',
                },
            ],
        },
        'gather.common.mission': mapping.groups.gather.groups.common.groups.mission,
        'gather.common.spacecraft': mapping.groups.gather.groups.common.groups.spacecraft,
        'gather.common.instrument': mapping.groups.gather.groups.common.groups.instrument,
        'gather.common.target': mapping.groups.gather.groups.common.groups.target,
        'gather.common.kind': mapping.groups.gather.groups.common.groups.kind,
        'archive.bundle_id': mapping.groups.archive.groups.bundle_id,
    }
}
