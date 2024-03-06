import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import clsx from 'clsx'

import ProductDownloadSelector from '../../../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import DownloadingCard from '../../../../../../components/DownloadingCard/DownloadingCard'
import { setSnackBarText } from '../../../../../../core/redux/actions/actions.js'
import { WGETCart } from '../../../../../../core/downloaders/WGET'

import Box from '@material-ui/core/Box'

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
    p2: {
        fontWeight: 'bold',
        padding: `${theme.spacing(1.5)}px 0px`,
    },
    p3: {
        color: theme.palette.swatches.blue.blue900,
        padding: `${theme.spacing(1.5)}px 0px`,
        fontWeight: 'bold',
        fontSize: '13px',
    },
    pCode: {
        background: theme.palette.swatches.grey.grey200,
        padding: `${theme.spacing(3)}px`,
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

function WGETTab(props) {
    const { value, index, ...other } = props

    const c = useStyles()
    const dispatch = useDispatch()
    const selectorRef = useRef()

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
            role="wget-tab"
            hidden={value !== index}
            id={`scrollable-auto-wgettabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <>
                    <Box p={3}>
                        <Typography variant="h5">WGET</Typography>
                        <Typography className={c.p}>
                            Select the products to include in your download:
                        </Typography>
                        <ProductDownloadSelector ref={selectorRef} />
                        <Button
                            className={clsx(c.button1, {
                                [c.downloadingButton]: isDownloading,
                            })}
                            variant="contained"
                            aria-label="wget download button"
                            onClick={() => {
                                if (selectorRef && selectorRef.current) {
                                    const sel = selectorRef.current.getSelected() || {}
                                    if (sel.length == 0) {
                                        dispatch(setSnackBarText('Nothing to download', 'warning'))
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
                                            WGETCart(
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
                            {isDownloading ? 'Download in Progress' : 'Download WGET Script'}
                        </Button>
                        <Typography className={c.p}>
                            To provide bulk downloading of PDS Imaging products, we have provided a
                            set of pre-configured WGET commands below that can be executed on your
                            computer to download the contents of your bulk download cart.
                        </Typography>
                        <Typography className={c.p}>
                            WGET is software that allows one to download internet content using a
                            command line interface. Availability and installation of wget varies
                            between operating systems. Please verify that wget is available for your
                            computer and is installed.
                        </Typography>
                        <Typography className={c.p2}>
                            After downloading, run the "pdsimg-atlas-wget_{datestamp}.bat" with the
                            following command:
                        </Typography>
                        <Typography className={c.p3}>Mac / Linux:</Typography>
                        <Typography className={c.pCode}>
                            source pdsimg-atlas-wget_{datestamp}.bat
                        </Typography>

                        <Typography className={c.p3}>Windows (WSL):</Typography>
                        <Typography className={c.pCode}>
                            bash
                            <br />
                            source pdsimg-atlas-wget_{datestamp}.bat
                        </Typography>
                        <Typography className={c.p}>
                            The downloaded script files max out at 500k lines. Multiple script files
                            may be downloaded to support to entire payload.
                        </Typography>
                        <Typography className={c.p}>
                            All files are downloaded into an `./pdsimg-atlas-wget_{datestamp}`
                            directory.
                        </Typography>
                    </Box>
                    <div className={c.downloading}>
                        <div className={clsx(c.error, { [c.errorOn]: error != null })}>{error}</div>
                        <DownloadingCard
                            downloadId={'wget' + downloadId}
                            status={status}
                            hidePause={true}
                            onStop={onStop}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

WGETTab.propTypes = {}

export default WGETTab
