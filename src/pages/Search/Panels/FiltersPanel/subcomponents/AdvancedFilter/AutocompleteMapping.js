import axios from 'axios'

import { domain, endpoints } from '../../../../../../core/constants'
import { getHeader, getIn } from '../../../../../../core/utils'

export const getAtlasMappingOptions = (schema) => {
    const options = []

    const depthTraverse = (props, path) => {
        if (path === 'gather.pds_archive.related') return

        Object.entries(props).forEach(([k, v]) => {
            const nextPath = path != null ? `${path}.${k}` : k
            if (v.properties) {
                depthTraverse(v.properties, nextPath)
            } else {
                options.push({ columnField: nextPath, type: v.type })
            }
        })
    }
    depthTraverse(schema.mappings.properties)

    return options
}

const autocompleteValuesCache = {}
export const getAutocompleteValues = async (category) => {
    return new Promise(async (resolve, reject) => {
        const dsl = {
            query: { match_all: {} },
            size: 0,
            aggs: {
                value: {
                    terms: {
                        field: category,
                        size: 1000,
                        order: { _key: 'asc' },
                    },
                },
            },
        }

        if (autocompleteValuesCache[category]) {
            resolve(autocompleteValuesCache[category])
            return
        }

        axios
            .post(`${domain}${endpoints.search}`, dsl, getHeader())
            .then((response) => {
                const buckets = getIn(response, 'data.aggregations.value.buckets')

                if (buckets == null) {
                    resolve([])
                    return
                }

                const values = []
                buckets.forEach((b) => {
                    values.push({
                        value: b.key,
                        type: 'value',
                        count: b.doc_count,
                    })
                })

                autocompleteValuesCache[category] = values
                resolve(values)
            })
            .catch((err) => {
                console.error('Advanced Search: Autocomplete Values - DSL Error')
                console.dir(err)
            })
        return
    })
}

export const basicToAdvancedFilters = (activeFilters) => {
    let adv = []

    for (let b in activeFilters) {
        let advFilter = []

        let filter = activeFilters[b]
        if (b == '_text') continue

        if (filter.facets?.length > 0) {
            filter.facets.forEach((facet) => {
                if (facet.state) {
                    for (let s in facet.state) {
                        const state = facet.state[s]
                        if (state) {
                            let value = s
                            if (value.includes(' ')) value = `"${value}"`
                            advFilter.push(`${facet.field}:${value}`)
                        }
                    }
                }
            })
        }
        if (advFilter.length > 0) {
            if (advFilter.length == 1) adv.push(`${advFilter.join(' OR ') || ''}`)
            else adv.push(`(${advFilter.join(' OR ') || ''})`)
        }
    }
    return adv.join(' AND ') || ''
}
