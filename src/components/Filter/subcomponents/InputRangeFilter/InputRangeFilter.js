import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@mui/styles'
import PropTypes from 'prop-types'

import Input from '@mui/material/Input'
import Button from '@mui/material/Button'

import { setFieldState } from '../../../../core/redux/actions/actions.js'
import { getIn } from '../../../../core/utils.js'

const useStyles = makeStyles((theme) => ({
    InputRangeFilter: {
        display: 'flex',
        flexFlow: 'column',
        padding: `0px ${theme.spacing(2)}px`,
    },
    input: {
        flex: 1,
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
    },
    bottom: {
        marginTop: theme.spacing(2),
    },
    clear: {
        'background': theme.palette.swatches.grey.grey500,
        '&:hover': {
            background: theme.palette.swatches.red.red500,
        },
    },
    submit: {
        width: '80px',
        float: 'right',
    },
    outOfOrder: {
        textAlign: 'center',
        margin: `${theme.spacing(2)}px 0px`,
        color: theme.palette.swatches.red.red500,
        fontWeight: 'bold',
    },
}))

const InputRangeFilter = (props) => {
    const { filterKey, facetId, type } = props
    const c = useStyles()

    const [filterInputStart, setFilterInputStart] = useState(null)
    const [filterInputEnd, setFilterInputEnd] = useState(null)

    const dispatch = useDispatch()
    const facet = useSelector((state) => {
        const sel = state.getIn(['activeFilters', filterKey, 'facets', facetId])
        return sel ? sel.toJS() : {}
    })

    useEffect(() => {
        setFilterInputStart(
            facet.state?.range ? (facet.state.range[0] != null ? facet.state.range[0] : null) : null
        )
        setFilterInputEnd(
            facet.state?.range ? (facet.state.range[1] != null ? facet.state.range[1] : null) : null
        )
    }, [JSON.stringify(facet.state)])

    //const facetName = facet.field_name || filterKey

    const min = getIn(facet, 'props.min', Number.MIN_SAFE_INTEGER)
    const max = getIn(facet, 'props.max', Number.MAX_SAFE_INTEGER)
    const step = getIn(facet, 'props.step', Math.min((max - min) / 100, 1))

    const handleClear = () => {
        const current = facet.state?.range
        if (current != null && current !== false)
            dispatch(
                setFieldState(filterKey, facetId, {
                    range: false,
                })
            )
        setFilterInputStart(null)
        setFilterInputEnd(null)
    }

    const handleSubmit = () => {
        const current = facet.state?.range
        const nextRange = [filterInputStart, filterInputEnd]
        if (JSON.stringify(current) !== JSON.stringify(nextRange))
            dispatch(
                setFieldState(filterKey, facetId, {
                    range: nextRange,
                })
            )
    }

    return (
        <div className={c.InputRangeFilter}>
            <Input
                className={c.input}
                placeholder="Start Value"
                value={filterInputStart || ''}
                inputProps={{ min: min, max: max, step: step }}
                type="number"
                onInput={(e) => {
                    setFilterInputStart(e.target.value == '' ? null : e.target.value)
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit()
                }}
            />
            <Input
                className={c.input}
                placeholder="End Value"
                value={filterInputEnd || ''}
                inputProps={{ min: min, max: max, step: step }}
                type="number"
                onInput={(e) => {
                    setFilterInputEnd(e.target.value == '' ? null : e.target.value)
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit()
                }}
            />

            {filterInputStart != null &&
                filterInputEnd != null &&
                parseFloat(filterInputStart) > parseFloat(filterInputEnd) && (
                    <div className={c.outOfOrder}>Start Value is greater than End Value!</div>
                )}
            <div className={c.bottom}>
                <Button
                    className={c.clear}
                    size="small"
                    variant="contained"
                    onClick={handleClear}
                    disabled={filterInputStart == null && filterInputEnd == null}
                >
                    Clear
                </Button>
                <Button
                    className={c.submit}
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={filterInputStart == null && filterInputEnd == null}
                >
                    Search
                </Button>
            </div>
        </div>
    )
}

InputRangeFilter.propTypes = {
    filterKey: PropTypes.string.isRequired,
    facetId: PropTypes.number.isRequired,
    type: PropTypes.string,
}

export default InputRangeFilter
