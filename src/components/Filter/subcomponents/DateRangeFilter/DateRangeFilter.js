import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@mui/styles'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import Button from '@mui/material/Button'

import moment from 'moment'

import { setFieldState } from '../../../../core/redux/actions/actions.js'
import { getIn, prettify } from '../../../../core/utils.js'

import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { TextField } from '@mui/material'

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

const useStyles = makeStyles((theme) => ({
    // DateRangeFilter: {
    //     width: '100%',
    //     display: 'flex',
    //     flexFlow: 'column',
    // },
    // notAlone: {
    //     paddingTop: '10px',
    //     position: 'relative',
    // },
    // title: {
    //     position: 'absolute',
    //     left: '50%',
    //     top: '146px',
    //     transform: 'translateX(-50%)',
    //     color: theme.palette.swatches.grey.grey400,
    // },
    wrapper: {
        width: '100%',
        padding: `4px ${theme.spacing(2)}`,
        boxSizing: 'border-box',
    },
    settings: {
        width: '100%',
        height: '0px',
        overflow: 'hidden',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey300}`,
        boxSizing: 'border-box',
        opacity: '0',
        transition: 'height 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out, margin 0.2s ease-out',
    },
    settingsActive: {
        height: '66px',
        opacity: '1',
        paddingTop: '8px',
        marginBottom: '8px',
    },
    // formControl: {
    //     width: '100%',
    //     marginBottom: '8px',
    // },
    // formHelperText: {
    //     color: theme.palette.swatches.grey.grey600,
    //     marginTop: '1px',
    //     marginLeft: '9px',
    // },
    // gap: {
    //     textAlign: 'center',
    //     position: 'relative',
    //     top: '-9px',
    //     fontWeight: 'bold',
    //     fontSize: '12px',
    //     color: theme.palette.swatches.grey.grey500,
    // },
    picker: {
    //     'display': 'flex',
    //     'justifyContent': 'space-between',
    //     '& .MuiOutlinedInput-input': {
    //         padding: '8px',
    //     },
    //     '& .MuiOutlinedInput-adornedEnd': {
    //         paddingRight: '0px',
    //     },
    //     '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    //         borderColor: theme.palette.accent.main,
    //     },
    },
    datePicker: {
        width: '100%',
        '& .MuiOutlinedInput-input': {
          padding: 8
        },
        '& .MuiFormLabel-root': {
          top: -8
        },
    },
    // pickerModal: {
    //     '& .MuiPickersToolbar-toolbar': {
    //         background: theme.palette.swatches.grey.grey150,
    //     },
    //     '& .MuiDialogActions-root': {
    //         'background': theme.palette.swatches.grey.grey150,
    //         '& .MuiButton-label': {
    //             color: theme.palette.text.primary,
    //         },
    //     },
    //     '& .MuiPickersYear-root': {
    //         height: '30px',
    //     },
    //     '& .MuiPickersYear-root:focus': {
    //         color: theme.palette.text.primary,
    //     },
    //     '& .MuiPickersYear-yearSelected': {
    //         color: theme.palette.accent.main,
    //     },
    //     '& .MuiPickersClock-pin': {
    //         background: theme.palette.swatches.grey.grey800,
    //     },
    //     '& .MuiPickersClockPointer-pointer': {
    //         background: theme.palette.swatches.grey.grey400,
    //     },
    //     '& .MuiPickersClockPointer-thumb': {
    //         borderColor: theme.palette.accent.main,
    //     },
    //     '& .MuiPickersClockPointer-noPoint': {
    //         background: theme.palette.accent.main,
    //     },
    //     '& .MuiPickersClockNumber-clockNumberSelected': {
    //         color: 'white',
    //     },
    // },
    // datesOutOfOrder: {
    //     textAlign: 'center',
    //     marginTop: '8px',
    //     color: theme.palette.swatches.red.red500,
    //     fontWeight: 'bold',
    // },
    // dateLimit: {
    //     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    //     lineHeight: '1.66',
    //     fontSize: '10.5px',
    //     color: theme.palette.swatches.grey.grey500,
    //     padding: '1px 0px',
    //     marginLeft: '9px',
    // },
    bottom: {
        marginTop: theme.spacing(2),
        padding: `0px ${theme.spacing(2)}`,
        display: 'flex',
        justifyContent: 'space-between'
    },
    clear: {
        'background': theme.palette.swatches.grey.grey500,
        '&:hover': {
            background: theme.palette.swatches.red.red500,
        },
    },
    submit: {}
}))

const DateRangeFilter = (props) => {
    const { filterKey, facetId, alone, settingsActive } = props
    const c = useStyles()

    const dispatch = useDispatch()
    const facet = useSelector((state) => {
        const sel = state.getIn(['activeFilters', filterKey, 'facets', facetId])
        return sel ? sel.toJS() : {}
    })

    const facetName = facet.field_name || filterKey

    const formats = [
        { format: 'yyyy-MM-DD', example: '2022-02-10' },
        { format: 'yyyy-MM-DD HH:mm', example: '2022-02-10 19:59' },
        { format: 'yyyy-DDDD', example: '2022-078' },
    ]

    const [minDate, setMinDate] = useState('1965-01-01')
    const [maxDate, setMaxDate] = useState(`${moment().year()}-12-31`)
    const [dateFormatIdx, setDateFormatIdx] = useState(0)
    const dateFormat = formats[dateFormatIdx].format
    const [selectedStartDate, handleStartDateChange] = useState(
        facet.state?.daterange?.start?.length > 0
            ? moment.utc(facet.state.daterange.start).format(dateFormat)
            : ''
    )
    const [selectedEndDate, handleEndDateChange] = useState(
        facet.state?.daterange?.end?.length > 0
            ? moment.utc(facet.state.daterange.end).format(dateFormat)
            : ''
    )
    const noDates = selectedStartDate.length === 0 && selectedEndDate.length === 0
    const bothDates = selectedStartDate.length > 0 && selectedEndDate.length > 0

    useEffect(() => {
        if (facet.state?.daterange === false) {
            handleStartDateChange('')
            handleEndDateChange('')
        }
    }, [JSON.stringify(facet.state)])

    useEffect(() => {
        if (facet.fields && facet.fields.length > 0) {
            setMinDate(facet.fields[0].key)
            setMaxDate(facet.fields[facet.fields.length - 1].key + 2592000000) //+ 30day to fill out bucket
        }
    }, [JSON.stringify(facet.fields)])

    const handleDateFormatChange = (nextIdx) => {
        if (selectedStartDate.length > 0)
            handleStartDateChange(
                moment.utc(selectedStartDate, dateFormat).format(formats[nextIdx].format)
            )
        if (selectedEndDate.length > 0)
            handleEndDateChange(
                moment.utc(selectedEndDate, dateFormat).format(formats[nextIdx].format)
            )
        setDateFormatIdx(nextIdx)
    }
    const handleClear = () => {
        if (!noDates)
            dispatch(
                setFieldState(filterKey, facetId, {
                    daterange: false,
                })
            )
        handleStartDateChange('')
        handleEndDateChange('')
    }
    const handleSubmit = () => {
        let formattedStartDate = selectedStartDate
        let formattedEndDate = selectedEndDate
        if (facet.field_format === 'ISO') {
            if (formattedStartDate.length > 0)
                formattedStartDate = moment(
                    moment.utc(formattedStartDate, dateFormat).valueOf()
                ).toISOString()
            if (formattedEndDate.length > 0)
                formattedEndDate = moment(
                    moment.utc(formattedEndDate, dateFormat).valueOf()
                ).toISOString()
        }

        dispatch(
            setFieldState(filterKey, facetId, {
                daterange: {
                    start: formattedStartDate,
                    end: formattedEndDate,
                },
            })
        )
    }

    return (
        <div
            className={clsx(c.DateRangeFilter, {
                [c.notAlone]: !alone,
            })}
        >
            {!alone ? <div className={c.title}>{prettify(facetName)}</div> : null}
            <div className={c.wrapper}>
                <div className={clsx(c.settings, { [c.settingsActive]: settingsActive })}>
                    <FormControl className={c.formControl} variant="outlined">
                        <InputLabel htmlFor="outlined-date-format">Date Format</InputLabel>
                        <Select
                            value={dateFormatIdx}
                            onChange={(e) => {
                                handleDateFormatChange(e.target.value)
                            }}
                            label="Date Format"
                            labelId="outlined-date-format"
                        >
                            {formats.map((f, idx) => {
                                return (
                                    <MenuItem key={idx} value={idx}>
                                        {f.format}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                        <FormHelperText
                            className={c.formHelperText}
                        >{`For example, "${formats[dateFormatIdx].example}"`}</FormHelperText>
                    </FormControl>
                </div>
                <div className={c.picker}>
                    <DateTimePicker
                        className={c.datePicker}
                        ampm={false}
                        value={selectedStartDate.length === 0 ? null : selectedStartDate}
                        onChange={(m, val) => {
                            handleStartDateChange(val || '')
                        }}
                        inputFormat={dateFormat}
                        openTo="year"
                        disableFuture={true}
                        minDate={minDate}
                        maxDate={maxDate}
                        invalidDateMessage={`Invalid Format. Use ${dateFormat}`}
                        DialogProps={{
                            className: c.pickerModal,
                        }}
                        label="Start Date"
                        renderInput={
                          (props) => <TextField {...props} />
                        }
                    />
                </div>
                <div className={c.dateLimit}>{`Min: ~${moment
                    .utc(minDate)
                    .format(dateFormat)}`}</div>
                <div className={c.gap}>to</div>
                <div className={c.picker}>
                    <DateTimePicker
                        className={c.datePicker}
                        inputVariant="outlined"
                        ampm={false}
                        value={selectedEndDate.length === 0 ? null : selectedEndDate}
                        onChange={(m, val) => {
                            handleEndDateChange(val || '')
                        }}
                        inputFormat={dateFormat}
                        openTo="year"
                        disableFuture={true}
                        minDate={minDate}
                        maxDate={maxDate}
                        invalidDateMessage={`Invalid Format. Use ${dateFormat}`}
                        DialogProps={{
                            className: c.pickerModal,
                        }}
                        label="End Date"
                        renderInput={
                          (props) => <TextField {...props} />
                        }
                    />
                </div>
                <div className={c.dateLimit}>{`Max: ~${moment
                    .utc(maxDate)
                    .format(dateFormat)}`}</div>
                {bothDates && selectedStartDate > selectedEndDate && (
                    <div className={c.datesOutOfOrder}>Start Date occurs after End Date!</div>
                )}
            </div>
            <div className={c.bottom}>
                <Button
                    className={c.clear}
                    size="small"
                    variant="contained"
                    onClick={handleClear}
                    disabled={noDates}
                >
                    Clear
                </Button>
                <Button
                    className={c.submit}
                    size="small"
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={noDates}
                >
                    Search
                </Button>
            </div>
        </div>
    )
}

DateRangeFilter.propTypes = {
    filterKey: PropTypes.string.isRequired,
    facetId: PropTypes.number.isRequired,
}

export default DateRangeFilter
