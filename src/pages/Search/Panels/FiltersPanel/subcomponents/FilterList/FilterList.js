import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import Url from 'url-parse'

import Filter from '../../../../../../components/Filter/Filter'
import { HASH_PATHS } from '../../../../../../core/constants'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    FilterList: {
        height: '100%',
        transition: 'width 0.4s ease-out',
    },
    groupHeader: {
        padding: '5px 16px 5px',
        fontSize: '11px',
        fontWeight: 700,
        lineHeight: '13px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey300}`,
        color: theme.palette.swatches.blue.blue900,
        background: theme.palette.swatches.grey.grey150,
    },
}))

const getGroupKey = (key) => {
    if (key === '_text') return null
    const parts = key.split('.')
    if (parts[0] === 'gather' && parts.length > 1) return parts[1]
    return parts[0]
}

const GROUP_DISPLAY_NAMES = {
    common: 'Common',
    archive: 'Archive',
    machine_learning: 'Machine Learning',
    ancillary: 'Ancillary',
    time: 'Time',
    pds_archive: 'PDS Archive',
    pds4_label: 'PDS4 Label',
    pds3_label: 'PDS3 Label',
}

const GROUP_ORDER = [
    'common',
    'archive',
    'machine_learning',
    'ancillary',
    'time',
    'pds_archive',
    'pds4_label',
    'pds3_label',
]

const getSearchURL = (activeFilters) => {
    let params = []
    Object.keys(activeFilters).forEach((filter) => {
        let values = []
        if (activeFilters[filter].facets) {
            activeFilters[filter].facets.forEach((f, idx) => {
                switch (f.type) {
                    case 'query_string':
                        if (f.state && f.state.input) values.push(`${encodeURI(f.state.input)}`)
                        break
                    case 'text':
                        if (f.state && f.state.text) values.push(`${encodeURI(f.state.text)}`)
                        break
                    case 'keyword':
                        if (f.state)
                            Object.keys(f.state).forEach((s) => {
                                if (f.state[s] === true) values.push(`${encodeURI(s)}`)
                            })
                        break
                    case 'input_range':
                    case 'slider_range':
                        if (
                            f.state &&
                            f.state.range &&
                            Array.isArray(f.state.range) &&
                            (f.state.range[0] != null || f.state.range[1] != null)
                        ) {
                            const min = f.state.range[0] != null ? f.state.range[0] : ''
                            const max = f.state.range[1] != null ? f.state.range[1] : ''
                            values.push(`${encodeURI(min)}_to_${encodeURI(max)}`)
                        }
                        break
                    case 'date_range':
                        if (
                            f.state &&
                            f.state.daterange &&
                            (f.state.daterange.start || f.state.daterange.end)
                        ) {
                            const start = f.state.daterange.start || ''
                            const end = f.state.daterange.end || ''
                            values.push(`${encodeURI(start)}_to_${encodeURI(end)}`)
                        }
                        break
                    default:
                        break
                }
            })
        }
        if (values.length > 0) params.push(`${filter}=${values.join(',')}`)
    })
    let paramString = ''
    if (params.length > 0) {
        paramString = `?${params.join('&')}`
    }
    return HASH_PATHS.search + paramString
}

const FilterList = (props) => {
    const c = useStyles()

    const navigate = useNavigate()

    const [expandedFilter, setExpandedFilter] = useState('_text')
    const activeFilters = useSelector((state) => {
        return state.getIn(['activeFilters'])
    }).toJS()
    useEffect(() => {
        const currentURL = new Url(window.location)
        const desiredSearchUrl = getSearchURL(activeFilters)
        if (currentURL.pathname + currentURL.query !== desiredSearchUrl) {
            navigate(desiredSearchUrl, { replace: true })
        }
    }, [JSON.stringify(activeFilters)])

    const sortedActiveFilterKeys = Object.keys(activeFilters).sort((a, b) => {
        return activeFilters[a].order - activeFilters[b].order
    })

    // Separate '_text' from the rest, then bucket by group
    const textKey = sortedActiveFilterKeys.includes('_text') ? '_text' : null
    const groupedKeys = {}
    sortedActiveFilterKeys.forEach((key) => {
        if (key === '_text') return
        const group = getGroupKey(key)
        if (!groupedKeys[group]) groupedKeys[group] = []
        groupedKeys[group].push(key)
    })

    const sortedGroups = Object.keys(groupedKeys).sort((a, b) => {
        const ai = GROUP_ORDER.indexOf(a)
        const bi = GROUP_ORDER.indexOf(b)
        if (ai >= 0 && bi >= 0) return ai - bi
        if (ai >= 0) return -1
        if (bi >= 0) return 1
        return a.localeCompare(b)
    })

    const renderFilter = (filterKey, idx) => (
        <Filter
            key={filterKey}
            filterKey={filterKey}
            filter={activeFilters[filterKey]}
            expanded={expandedFilter === filterKey}
            onExpand={() => {
                setExpandedFilter(expandedFilter === filterKey ? null : filterKey)
            }}
        />
    )

    return (
        <div className={c.FilterList}>
            {textKey && renderFilter(textKey)}
            {sortedGroups.map((group) => (
                <div key={group}>
                    <div className={c.groupHeader}>
                        {GROUP_DISPLAY_NAMES[group] ?? group.replace(/_/g, ' ')}
                    </div>
                    {groupedKeys[group].map(renderFilter)}
                </div>
            ))}
        </div>
    )
}

FilterList.propTypes = {}

export default FilterList
