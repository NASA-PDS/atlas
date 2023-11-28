import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import MiniHistogram from '../../../MiniHistogram/MiniHistogram'

import { setFieldState } from '../../../../core/redux/actions/actions.js'
import { getIn, prettify, abbreviateNumber } from '../../../../core/utils.js'

import Slider from '@material-ui/core/Slider'

const useStyles = makeStyles((theme) => ({
    SliderRangeFilter: {
        width: '100%',
        display: 'flex',
        flexFlow: 'column',
    },
    notAlone: {
        paddingTop: '10px',
        position: 'relative',
    },
    title: {
        position: 'absolute',
        left: '50%',
        top: '146px',
        transform: 'translateX(-50%)',
        color: theme.palette.swatches.grey.grey400,
    },
    histogramWrapper: {
        margin: '8px 18px 0px 18px',
    },
    sliderWrapper: {
        height: '30px',
        width: 'calc(100% - 40px)',
        padding: '4px 23px 4px 23px',
        marginTop: '-17px',
    },
    sliderMarks: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '-9px -4px 0px -4px',
        fontSize: '12px',
    },
    inputs: {
        display: 'flex',
        flexFlow: 'column',
        width: 'calc(100% - 40px)',
        padding: '4px 20px 0px 20px',
    },
    input: {
        'flex': 1,
        '& .MuiFormLabel-root': {
            color: theme.palette.swatches.grey.grey700,
        },
    },
    bottom: {
        marginTop: theme.spacing(2),
        padding: `0px ${theme.spacing(2)}px`,
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

const SliderRangeFilter = (props) => {
    const { filterKey, facetId, alone, settingsActive } = props
    const c = useStyles()

    const dispatch = useDispatch()
    const facet = useSelector((state) => {
        const sel = state.getIn(['activeFilters', filterKey, 'facets', facetId])
        return sel ? sel.toJS() : {}
    })

    const facetName = facet.field_name || filterKey

    // Find reasonable mins a maxes and ignore wild no-data outliers
    const fieldsLength = facet.fields?.length || 1
    const outliers = []
    // Find reasonable mins and ignore wild no-data outliers
    let min = getIn(facet, 'fields.0.min', 0)
    const trueMin = min
    let minOutlierCounter = 0
    while (min.toString().includes('e')) {
        outliers.push(minOutlierCounter)
        min = getIn(facet, `fields.${++minOutlierCounter}.min`, 0)
    }
    // Find reasonable maxes and ignore wild no-data outliers
    let max = getIn(facet, `fields.${fieldsLength - 1}.max`, 100)
    const trueMax = max
    let maxOutlierCounter = fieldsLength - 1
    while (max.toString().includes('e')) {
        outliers.push(maxOutlierCounter)
        max = getIn(facet, `fields.${--maxOutlierCounter}.max`, 100)
    }

    // Always step 1%
    const step = Math.min((max - min) / 100, 1)

    let units = getIn(facet, 'units', '')
    if (units == 'degrees') units = '°'

    const [value, setValue] = useState([null, null])

    // A value range the replaces nulls with minmax (in case a user cleared an input field)
    const normalizedValue = [value[0] != null ? value[0] : min, value[1] != null ? value[1] : max]

    const handleSliderChange = (e, newValue) => {
        setValue(newValue)
    }
    const handleInputChange = (type, newValue) => {
        if (newValue === '') {
            newValue = null
        } else {
            newValue = parseFloat(newValue)
            if (isNaN(newValue)) return
        }

        let nextValue = [value[0], value[1]]

        if (type === 'min') nextValue[0] = newValue
        else if (type === 'max') nextValue[1] = newValue
        setValue(nextValue)
    }
    const handleClear = () => {
        setValue([null, null])
    }
    const handleSubmit = () => {
        dispatch(
            setFieldState(filterKey, facetId, {
                range: value,
            })
        )
    }

    return (
        <div
            className={clsx(c.SliderRangeFilter, {
                [c.notAlone]: !alone,
            })}
        >
            {!alone ? <div className={c.title}>{prettify(facetName)}</div> : null}
            <div className={c.histogramWrapper}>
                <MiniHistogram
                    buckets={facet.fields}
                    height={100}
                    selectedRange={normalizedValue}
                    outliers={outliers}
                />
            </div>
            <div className={c.sliderWrapper}>
                <Slider
                    value={normalizedValue}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleSliderChange}
                />
                <div className={c.sliderMarks}>
                    <div>{abbreviateNumber(min, 2)}</div>
                    <div>{abbreviateNumber(max, 2)}</div>
                </div>
            </div>
            <div className={c.inputs}>
                <TextField
                    label="From"
                    className={c.input}
                    value={value[0] != null ? value[0] : ''}
                    margin="dense"
                    onChange={(e) => {
                        handleInputChange('min', e.target.value)
                    }}
                    inputProps={{
                        step: step,
                        min: trueMin,
                        max: trueMax,
                        type: 'number',
                    }}
                />
                <TextField
                    label="To"
                    className={c.input}
                    value={value[1] != null ? value[1] : ''}
                    margin="dense"
                    onChange={(e) => {
                        handleInputChange('max', e.target.value)
                    }}
                    inputProps={{
                        step: step,
                        min: trueMin,
                        max: trueMax,
                        type: 'number',
                    }}
                />
            </div>
            <div className={c.bottom}>
                <Button
                    className={c.clear}
                    size="small"
                    variant="contained"
                    onClick={handleClear}
                    disabled={value[0] == null && value[1] == null}
                >
                    Clear
                </Button>
                <Button
                    className={c.submit}
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={
                        value[0] === facet.state?.range?.[0] && value[1] === facet.state?.range?.[1]
                    }
                >
                    Search
                </Button>
            </div>
        </div>
    )
}

SliderRangeFilter.propTypes = {
    filterKey: PropTypes.string.isRequired,
    facetId: PropTypes.number.isRequired,
}

export default SliderRangeFilter
