import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@mui/material/styles'
import PropTypes from 'prop-types'

import Input from '@mui/material/Input'
import Button from '@mui/material/Button'

import { setFieldState } from '../../../../core/redux/actions/actions.js'
import { getIn } from '../../../../core/utils.js'

const useStyles = makeStyles((theme) => ({
    InputFilter: {
        display: 'flex',
        flexFlow: 'column',
        padding: `0px ${theme.spacing(2)}px`,
    },
    input: {
        flex: 1,
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
}))

const InputFilter = (props) => {
    const { filterKey, facetId, type } = props
    const c = useStyles()

    const [filterInput, setFilterInput] = useState(null)

    const dispatch = useDispatch()
    const facet = useSelector((state) => {
        const sel = state.getIn(['activeFilters', filterKey, 'facets', facetId])
        return sel ? sel.toJS() : {}
    })

    useEffect(() => {
        setFilterInput(facet.state?.input || null)
    }, [JSON.stringify(facet.state)])

    const facetName = facet.field_name || filterKey

    const handleClear = () => {
        const current = facet.state?.input
        if (current !== false)
            dispatch(
                setFieldState(filterKey, facetId, {
                    input: false,
                })
            )
        setFilterInput('')
    }

    const handleSubmit = () => {
        const current = facet.state?.input
        if (current !== filterInput)
            dispatch(
                setFieldState(filterKey, facetId, {
                    input: filterInput,
                })
            )
    }

    return (
        <div className={c.InputFilter}>
            <Input
                className={c.input}
                placeholder={facetName}
                value={filterInput || ''}
                type={type}
                onInput={(e) => {
                    setFilterInput(e.target.value == '' ? null : e.target.value)
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit()
                }}
            />
            <div className={c.bottom}>
                <Button
                    className={c.clear}
                    size="small"
                    variant="contained"
                    onClick={handleClear}
                    disabled={filterInput == null}
                >
                    Clear
                </Button>
                <Button
                    className={c.submit}
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={filterInput == null}
                >
                    Search
                </Button>
            </div>
        </div>
    )
}

InputFilter.propTypes = {
    filterKey: PropTypes.string.isRequired,
    facetId: PropTypes.number.isRequired,
    type: PropTypes.string,
}

export default InputFilter
