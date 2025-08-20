import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { setFieldState } from '../../../../../../core/redux/actions/actions'

import { getIn, capitalize, prettify, isObject, objectToString } from '../../../../../../core/utils'

import { makeStyles } from '@mui/styles'
import Chip from '@mui/material/Chip'

const useStyles = makeStyles((theme) => ({
    ChippedFilters: {
        height: '24px',
        minHeight: '24px',
        padding: theme.spacing(1),
    },
    chip: {
        'margin': `0 ${theme.spacing(1)}`,
        'color': theme.palette.text.primary,
        'border': `1px solid rgba(0,0,0,0.23)`,
        '& svg': {
            'color': theme.palette.text.primary,
            'transition': 'color 0.2s ease-out',
            '&:hover': {
                color: `${theme.palette.swatches.red.red500} !important`,
            },
        },
    },
}))

const ChippedFilters = (props) => {
    const c = useStyles()
    const dispatch = useDispatch()

    const activeFilters = useSelector((state) => {
        return state.getIn(['activeFilters']).toJS()
    })

    return (
        <div className={c.ChippedFilters}>
            {Object.keys(activeFilters).map((filterKey, idx) => {
                let chips = []
                activeFilters[filterKey].facets.forEach((facet, facetId) => {
                    if (facet.state) {
                        Object.keys(facet.state).forEach((key) => {
                            let value = facet.state[key]
                            if (key === '__filter' && (value == '' || value == null)) return
                            if (value === false) return
                            if (value === true) value = key

                            if (typeof value !== 'string' && value.length === 2) {
                                if (value[0] == null && value[1] == null) return
                                value[0] = value[0].toFixed(2)
                                value[1] = value[1].toFixed(2)
                                value = value.join(' ➔ ')
                            } else if (isObject(value)) {
                                value = objectToString(value)
                            }

                            let subName = ''
                            if (activeFilters[filterKey].facets.length > 1)
                                subName = ` (${facet.display_name || prettify(facet.field_name)})`

                            chips.push(
                                <Chip
                                    className={c.chip}
                                    label={`${capitalize(
                                        activeFilters[filterKey].display_name || filterKey
                                    )}${subName}: ${key === '__filter' ? `*${value}*` : value}`}
                                    key={chips.length}
                                    onDelete={() => {
                                        dispatch(
                                            setFieldState(filterKey, facetId, {
                                                [key]: !getIn(facet, ['state', key], false),
                                            })
                                        )
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            )
                        })
                    }
                })
                return chips
            })}
        </div>
    )
}

ChippedFilters.propTypes = {}

export default ChippedFilters
