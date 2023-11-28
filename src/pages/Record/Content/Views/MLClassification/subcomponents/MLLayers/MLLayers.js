import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import withWidth from '@material-ui/core/withWidth'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'

import { setSnackBarText } from '../../../../../../../core/redux/actions/actions'
import {
    getIn,
    getPDSUrl,
    prettify,
    abbreviateNumber,
    copyToClipboard,
} from '../../../../../../../core/utils.js'

const useStyles = makeStyles((theme) => ({
    MLLayers: {
        width: '100%',
        height: '100%',
        color: '#666',
        display: 'flex',
        flexFlow: 'column',
    },
    title: {
        fontSize: '14px',
        textTransform: 'uppercase',
        fontWeight: 600,
        margin: '0px',
        padding: '12px 12px 8px 12px',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    subtitle: {
        fontSize: '13px',
        fontWeight: 400,
        margin: '0px',
        padding: '12px 12px 8px 12px',
    },
    layers: {
        paddingBottom: '4px',
    },
    layersUl: {
        padding: 0,
        margin: 0,
    },
    layersLi: {
        height: '42px',
        width: '100%',
        display: 'flex',
        cursor: 'pointer',
        transition: 'background 0.2s ease-in-out',
    },
    checkbox: {
        padding: '0px 12px',
    },
    message: {
        fontSize: '14px',
        fontWeight: 500,
        lineHeight: '42px',
        textTransform: 'capitalize',
        userSelect: 'none',
    },
    messageChecked: {},
    filters: {
        '& > ul': {
            margin: 0,
            padding: 0,
        },
    },
    sliderWrapper: {
        height: '30px',
        width: 'calc(100% - 46px)',
        padding: '4px 23px 4px 23px',
    },
    sliderMarks: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: '-9px -4px 0px -4px',
        fontSize: '12px',
    },
    inputs: {
        display: 'flex',
        justifyContent: 'space-between',
        width: 'calc(100% - 40px)',
        padding: '0px 20px',
    },
    input: {
        'width': 'calc(50% - 6px)',
        '& .MuiFormLabel-root': {
            color: theme.palette.swatches.grey.grey700,
        },
    },
    topBar: {
        height: `${theme.headHeights[2]}px`,
        display: 'flex',
        justifyContent: 'flex-end',
        boxSizing: 'border-box',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        background: theme.palette.swatches.grey.grey0,
    },
    button1: {
        height: 30,
        margin: '5px',
        color: theme.palette.text.primary,
    },
}))

const MLLayers = (props) => {
    const { features, classes, onChange } = props
    const c = useStyles()
    const theme = useTheme()

    const dispatch = useDispatch()

    const min = 0.9
    const max = 1
    const step = 0.005
    const [value, setValue] = useState([min, max])
    // A value range the replaces nulls with minmax (in case a user cleared an input field)
    const normalizedValue = [value[0] != null ? value[0] : min, value[1] != null ? value[1] : max]

    const handleSliderChange = (e, newValue) => {
        setValue(newValue)
        onChange('confidence', newValue)
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

    return (
        <div className={c.MLLayers}>
            <div className={c.topBar}>
                <Button
                    className={c.button1}
                    variant="outlined"
                    aria-label="copy ML features"
                    size="small"
                    onClick={() => {
                        copyToClipboard(JSON.stringify({ ml_features: features }, null, 2))
                        dispatch(
                            setSnackBarText('Copied ML Features JSON to Clipboard!', 'success')
                        )
                    }}
                >
                    Copy ML Features JSON
                </Button>
            </div>
            <div className={c.layers}>
                <h4 className={c.title}>Layers</h4>
                <ul className={c.layersUl}>
                    {Object.keys(classes).map((key, idx) => {
                        const checkedClass = classes[key] || {}
                        const isChecked = checkedClass.on
                        return (
                            <li
                                className={c.layersLi}
                                style={{
                                    background: isChecked
                                        ? checkedClass.color
                                        : theme.palette.swatches.grey.grey200,
                                }}
                                key={idx}
                                onClick={() => {
                                    const nextClasses = JSON.parse(JSON.stringify(classes))
                                    nextClasses[key] = nextClasses[key] || {}
                                    nextClasses[key].on = !classes[key].on
                                    onChange('classes', nextClasses)
                                }}
                            >
                                <Checkbox
                                    className={c.checkbox}
                                    color="secondary"
                                    checked={isChecked}
                                    title="Select"
                                    aria-label="select"
                                />
                                <Typography
                                    className={clsx(c.message, {
                                        [c.messageChecked]: isChecked,
                                    })}
                                >
                                    {prettify(key)}
                                </Typography>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className={c.filters}>
                <h4 className={c.title}>Filters</h4>
                <ul>
                    <li className={c.confidenceFilter}>
                        <h4 className={c.subtitle}>Confidence</h4>
                        <div className={c.sliderWrapper}>
                            <Slider
                                value={normalizedValue}
                                min={min}
                                max={max}
                                step={step}
                                onChange={handleSliderChange}
                            />
                            <div className={c.sliderMarks}>
                                <div>{min}</div>
                                <div>{max}</div>
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
                                    min: min,
                                    max: max,
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
                                    min: min,
                                    max: max,
                                    type: 'number',
                                }}
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}

MLLayers.propTypes = {
    features: PropTypes.array,
    onChange: PropTypes.func,
}

export default withWidth()(MLLayers)
