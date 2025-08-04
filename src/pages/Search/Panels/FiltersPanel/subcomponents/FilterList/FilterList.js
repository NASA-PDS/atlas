import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import Url from 'url-parse'

import Filter from '../../../../../../components/Filter/Filter'
import { HASH_PATHS } from '../../../../../../core/constants'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    FilterList: {
        height: '100%',
        transition: 'width 0.4s ease-out',
    },
}))

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
                        if (f.state && f.state.range && Array.isArray(f.state.range) && 
                            (f.state.range[0] != null || f.state.range[1] != null)) {
                            const min = f.state.range[0] != null ? f.state.range[0] : ''
                            const max = f.state.range[1] != null ? f.state.range[1] : ''
                            values.push(`${encodeURI(min)}_to_${encodeURI(max)}`)
                        }
                        break
                    case 'date_range':
                        if (f.state && f.state.daterange && 
                            (f.state.daterange.start || f.state.daterange.end)) {
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
    const dispatch = useDispatch()
    const history = useHistory()

    const [expandedFilter, setExpandedFilter] = useState('_text')
    const activeFilters = useSelector((state) => {
        return state.getIn(['activeFilters']).toJS()
    })
    useEffect(() => {
        const currentURL = new Url(window.location)
        const desiredSearchUrl = getSearchURL(activeFilters)
        if (currentURL.pathname + currentURL.query !== desiredSearchUrl) {
            history.replace(desiredSearchUrl)
        }
    }, [activeFilters])

    const sortedActiveFilterKeys = Object.keys(activeFilters).sort((a, b) => {
        return activeFilters[a].order - activeFilters[b].order
    })
    return (
        <div className={c.FilterList}>
            {sortedActiveFilterKeys.map((filterKey, idx) => {
                return (
                    <Filter
                        key={idx}
                        filterKey={filterKey}
                        filter={activeFilters[filterKey]}
                        expanded={expandedFilter === filterKey}
                        onExpand={() => {
                            setExpandedFilter(expandedFilter === filterKey ? null : filterKey)
                        }}
                    />
                )
            })}
        </div>
    )
}

FilterList.propTypes = {}

export default FilterList
