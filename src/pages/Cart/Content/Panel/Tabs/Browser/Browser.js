import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@mui/styles'

import clsx from 'clsx'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

import { ZipStreamCart } from '../../../../../../core/downloaders/ZipStream'
import { setSnackBarText } from '../../../../../../core/redux/actions/actions.js'

import ProductDownloadSelector from '../../../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import DownloadingCard from '../../../../../../components/DownloadingCard/DownloadingCard'

const useStyles = makeStyles((theme) => ({
    button1: {
        height: 30,
        width: '100%',
        margin: '7px 0px',
        background: theme.palette.primary.light,
    },
    p: {
        padding: `${theme.spacing(1.5)}px 0px`,
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

function BrowserTab(props) {
    const { value, index, ...other } = props

    const c = useStyles()

    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadId, setDownloadId] = useState(0)
    const [status, setStatus] = useState(null)
    const [zipController, setZipController] = useState(null)
    const [error, setError] = useState(null)
    const [selectionCount, setSelectionCount] = useState(0)

    const dispatch = useDispatch()
    const selectorRef = useRef()

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
            role="browser-tab"
            hidden={value !== index}
            id={`scrollable-auto-browsertabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <>
                    <Box p={3}>
                        <Typography variant="h5">Browser ZIP</Typography>
                        <Typography className={clsx(c.p, c.subtitle)}>
                            Select the products to include in your download:
                        </Typography>
                        <ProductDownloadSelector
                            ref={selectorRef}
                            onSelection={setSelectionCount}
                        />
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
                                    aria-label="browser zip download button"
                                    disabled={selectionCount === 0}
                                    onClick={() => {
                                        if (selectorRef && selectorRef.current) {
                                            const sel = selectorRef.current.getSelected() || []
                                            if (sel.length === 0) {
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
                                                dispatch(
                                                    ZipStreamCart(
                                                        setStatus,
                                                        setIsDownloading,
                                                        setZipController,
                                                        sel,
                                                        (err) => {
                                                            setError(err)
                                                            setIsDownloading(false)
                                                        }
                                                    )
                                                )
                                            }
                                        }
                                    }}
                                >
                                    {isDownloading ? 'Download in Progress' : 'Download ZIP'}
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                    <div className={c.downloading}>
                        <div className={clsx(c.error, { [c.errorOn]: error != null })}>{error}</div>
                        <DownloadingCard
                            downloadId={'zip' + downloadId}
                            status={status}
                            controller={zipController}
                            controllerType="zip"
                        />
                    </div>
                </>
            )}
        </div>
    )
}

BrowserTab.propTypes = {}

export default BrowserTab
