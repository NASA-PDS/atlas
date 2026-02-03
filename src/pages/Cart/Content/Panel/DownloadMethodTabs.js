import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@mui/styles'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import BrowserTab from './Tabs/Browser/Browser'
import CURLTab from './Tabs/CURL/CURL'
import WGETTab from './Tabs/WGET/WGET'
import CSVTab from './Tabs/CSV/CSV'
import TXTTab from './Tabs/TXT/TXT'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
        background: theme.palette.swatches.grey.grey100,
    },
    title: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: theme.spacing(3),
    },
    radioGroupContainer: {
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: theme.spacing(3),
    },
    radioGroup: {
        gap: theme.spacing(1),
    },
    radioOption: {
        'border': `1px solid ${theme.palette.swatches.grey.grey300}`,
        'borderRadius': '4px',
        'padding': theme.spacing(1.5),
        'margin': 0,
        'marginBottom': theme.spacing(1),
        'transition': 'all 0.2s',
        '&:hover:not(.selected)': {
            'borderColor': theme.palette.swatches.grey.grey500,
            '& .MuiRadio-root': {
                color: theme.palette.swatches.grey.grey500,
            },
        },
        '&.selected': {
            'border': `1px solid ${theme.palette.accent.main}`,
        },
    },
    radioLabelContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(0.5),
    },
    radioTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: theme.palette.common.black,
    },
    radioDescription: {
        fontSize: '12px',
        color: theme.palette.swatches.grey.grey800,
        lineHeight: '1.4',
    },
    tabPanels: {
        position: 'relative',
        padding: `${theme.spacing(0)} ${theme.spacing(3)}`,
    },
    borderBottom: {
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    radio: {
        'color': theme.palette.swatches.grey.grey300,
        'transition': 'color 0.2s',
        '&.Mui-checked': {
            color: theme.palette.accent.main,
        },
    },
}))

const DownloadMethodTabs = ({ selectedDownloadMethodIndex, onChange, selectorRef, selectionCount }) => {
    const c = useStyles()

    const methods = [
        { 
            value: 0, 
            title: 'ZIP', 
            description: 'Download files as a compressed ZIP archive through your browser' 
        },
        { 
            value: 1, 
            title: 'WGET', 
            description: 'Use wget command-line tool to download files' 
        },
        { 
            value: 2, 
            title: 'CURL', 
            description: 'Use curl command-line tool to download files' 
        },
        { 
            value: 3, 
            title: 'CSV', 
            description: 'Download a CSV file containing URLs for all products' 
        },
        { 
            value: 4, 
            title: 'TXT', 
            description: 'Download a text file containing URLs for all products' 
        },
    ]

    const handleRadioChange = (event) => {
        const newValue = parseInt(event.target.value, 10)
        onChange(event, newValue)
    }

    return (
        <>
            <div className={clsx(c.root, c.borderBottom)}>
                <Typography className={c.title}>
                    2. Select a download method:
                </Typography>
                <div className={c.radioGroupContainer}>
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            aria-label="cart download method selection"
                            value={selectedDownloadMethodIndex !== null ? selectedDownloadMethodIndex : ''}
                            onChange={handleRadioChange}
                            className={c.radioGroup}
                        >
                            {methods.map((method) => (
                                <FormControlLabel
                                    key={method.value}
                                    value={method.value}
                                    className={clsx(c.radioOption, {
                                        selected: selectedDownloadMethodIndex === method.value,
                                    })}
                                    control={<Radio className={c.radio} />}
                                    label={
                                        <Box className={c.radioLabelContent}>
                                            <Typography className={c.radioTitle}>
                                                {method.title}
                                            </Typography>
                                            {method.description && (
                                                <Typography className={c.radioDescription}>
                                                    {method.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
            {selectedDownloadMethodIndex !== null && (
                <div className={clsx(c.root)}>
                    <Typography className={c.title}>
                        3. Download your products:
                    </Typography>
                    <div className={c.tabPanels}>
                        <BrowserTab value={selectedDownloadMethodIndex} index={0} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <WGETTab value={selectedDownloadMethodIndex} index={1} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <CURLTab value={selectedDownloadMethodIndex} index={2} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <CSVTab value={selectedDownloadMethodIndex} index={3} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <TXTTab value={selectedDownloadMethodIndex} index={4} selectorRef={selectorRef} selectionCount={selectionCount} />
                    </div>
                </div>
            )}
        </>
    )
}

DownloadMethodTabs.propTypes = {
    selectedDownloadMethodIndex: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    selectorRef: PropTypes.object,
    selectionCount: PropTypes.number,
}

export default DownloadMethodTabs
