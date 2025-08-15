import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import SplitButton from '../SplitButton/SplitButton'

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

import { setResultSorting } from '../../core/redux/actions/actions.js'

import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material';

const useStyles = makeStyles((theme) => ({
    ResultsSorter: {
        height: '26px',
        marginLeft: '4px',
        margin: '7px 5px',
    },
    label: {
        lineHeight: '26px',
        paddingRight: '4px',
        fontSize: '10px',
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    flex: {
        'display': 'flex',
        '& > svg': {
            paddingTop: '2px',
        },
    },
}))

// items is [{ name: 'My Items' }, { ... }]

export default function ResultsSorter(props) {
    const {} = props

    const c = useStyles()
    const dispatch = useDispatch()

    const activeFilters = useSelector((state) => {
        return state.getIn(['activeFilters']).toJS()
    })

    const resultsTable = useSelector((state) => {
        return state.getIn(['resultsTable']).toJS()
    })

    const resultSorting = useSelector((state) => {
        return state.getIn(['resultSorting']).toJS()
    })

    const flatFields = [resultSorting.defaultField]

    const items = [{ name: resultSorting.defaultField }]
    let selectedIndex = null

    //Add all active filters as potential sorts
    Object.keys(activeFilters).forEach((filter) => {
        activeFilters[filter].facets.forEach((f) => {
            if (f.type != 'text' && f.field !== '*') {
                if (resultSorting.field === f.field) selectedIndex = items.length
                items.push({ name: f.field })
                flatFields.push(f.field)
            }
        })
    })

    //Add all table columns as potential sorts
    resultsTable.columns.forEach((field) => {
        if (!flatFields.includes(field)) {
            items.push({ name: field })
            flatFields.push(field)
        }
    })

    if (
        selectedIndex == null &&
        resultSorting.field != null &&
        resultSorting.field != resultSorting.defaultField
    ) {
        items.push({ name: resultSorting.field })
        selectedIndex = items.length - 1
    }

    return (
        <SplitButton
            className={c.ResultsSorter}
            startIcon={
                resultSorting.direction === 'desc' ? (
                    <div className={c.flex}>
                        <Typography className={c.label}>Sort</Typography>
                        <ArrowDownwardIcon />
                    </div>
                ) : (
                    <div className={c.flex}>
                        <Typography className={c.label}>Sort</Typography>
                        <ArrowUpwardIcon />
                    </div>
                )
            }
            truncateDelimiter="."
            items={items}
            variant="outlined"
            forceIndex={selectedIndex}
            onChange={(item, index) => {
                dispatch(setResultSorting(item.name))
            }}
            onClick={() => {
                dispatch(
                    setResultSorting(null, resultSorting.direction === 'desc' ? 'asc' : 'desc')
                )
            }}
        />
    )
}
