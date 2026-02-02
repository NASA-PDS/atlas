import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@mui/styles'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import clsx from 'clsx'

import DownloadingCard from '../../../../../../components/DownloadingCard/DownloadingCard'
import { setSnackBarText } from '../../../../../../core/redux/actions/actions.js'
import { TXTCart } from '../../../../../../core/downloaders/TXT'

import Box from '@mui/material/Box'

const useStyles = makeStyles((theme) => ({
    button1: {
        height: 30,
        width: '100%',
        margin: '7px 0px',
        background: theme.palette.primary.light,
    },
    p: {
        padding: `${theme.spacing(1.5)} 0px`,
    },
    p2: {
        fontWeight: 'bold',
        padding: `${theme.spacing(1.5)} 0px`,
    },
    p3: {
        color: theme.palette.swatches.blue.blue900,
        padding: `${theme.spacing(1.5)} 0px`,
        fontWeight: 'bold',
        fontSize: '13px',
    },
    pCode: {
        background: theme.palette.swatches.grey.grey200,
        padding: theme.spacing(3),
        fontFamily: 'monospace',
        marginBottom: '5px',
    },
    downloadingButton: {
        background: theme.palette.swatches.grey.grey300,
        color: theme.palette.text.primary,
        pointerEvents: 'none',
    },
    downloading: {
        bottom: '0px',
        position: 'sticky',
        width: '100%',
        padding: '12px',
        boxSizing: 'border-box',
    },
    error: {
        display: 'none',
        fontSize: '16px',
        padding: '12px',
        background: theme.palette.swatches.red.red500,
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.swatches.red.red600}`,
        textAlign: 'center',
    },
    errorOn: {
        display: 'block',
    },
}))

function TXTTab(props) {
    const { value, index, selectorRef, selectionCount, ...other } = props

    const c = useStyles()
    const dispatch = useDispatch()

    const [isDownloading, setIsDownloading] = useState(false)
    const [onStop, setOnStop] = useState(false)
    const [downloadId, setDownloadId] = useState(0)
    const [status, setStatus] = useState(null)
    const [error, setError] = useState(null)

    const [datestamp, setDatestamp] = useState()

    useEffect(() => {
        // If true, then it'll next be false
        if (isDownloading === true && status != null) {
            const nextStatus = status
            nextStatus.overall.percent = 100
            setStatus(nextStatus)
        }
    }, [isDownloading])

    return (
        <div
            role="txt-tab"
            hidden={value !== index}
            id={`scrollable-auto-txttabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <>
                    <Box p={3}>
                        <Typography variant="h5">TXT</Typography>
                        <Tooltip
                            title={selectionCount === 0 ? 'Select products above to download.' : ''}
                            arrow
                        >
                            <span>
                                <Button
                                    className={clsx(c.button1, {
                                        [c.downloadingButton]: isDownloading,
                                    })}
                                    variant="contained"
                                    aria-label="txt download button"
                                    disabled={selectionCount === 0}
                                    onClick={() => {
                                        if (selectorRef && selectorRef.current) {
                                            const sel = selectorRef.current.getSelected() || {}
                                            if (sel.length == 0) {
                                                dispatch(
                                                    setSnackBarText(
                                                        'Please select products to download',
                                                        'warning'
                                                    )
                                                )
                                            } else {
                                                setIsDownloading(true)
                                                setDownloadId(downloadId + 1)
                                                setError(null)
                                                const datestamp = new Date()
                                                    .toISOString()
                                                    .replace(/:/g, '_')
                                                    .replace(/\./g, '_')
                                                    .replace(/Z/g, '')
                                                dispatch(
                                                    TXTCart(
                                                        setStatus,
                                                        setIsDownloading,
                                                        setOnStop,
                                                        sel,
                                                        datestamp
                                                    )
                                                )
                                                setDatestamp(datestamp)
                                            }
                                        }
                                    }}
                                >
                                    {isDownloading ? 'Download in Progress' : 'Download TXT'}
                                </Button>
                            </span>
                        </Tooltip>
                        <Typography className={c.p}>
                            Downloads a .txt file named `./pdsimg-atlas_{datestamp}.txt` that simply
                            lists out all download urls.
                        </Typography>
                        <Typography className={c.p}>
                            The downloaded script files max out at 500k lines. Multiple script files
                            may be downloaded to support to entire payload.
                        </Typography>
                        <div className={c.downloading}>
                            <div className={clsx(c.error, { [c.errorOn]: error != null })}>
                                {error}
                            </div>
                            <DownloadingCard
                                downloadId={'txt' + downloadId}
                                status={status}
                                hidePause={true}
                                onStop={onStop}
                            />
                        </div>
                    </Box>
                </>
            )}
        </div>
    );
}

TXTTab.propTypes = {}

export default TXTTab
