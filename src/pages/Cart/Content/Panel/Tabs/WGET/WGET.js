import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@mui/styles'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import clsx from 'clsx'

import ProductDownloadSelector from '../../../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import DownloadingCard from '../../../../../../components/DownloadingCard/DownloadingCard'
import { setSnackBarText } from '../../../../../../core/redux/actions/actions.js'
import { WGETCart } from '../../../../../../core/downloaders/WGET'

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
        padding: theme.spacing(4),
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
    const [selectionCount, setSelectionCount] = useState(0)

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
                                    aria-label="wget download button"
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
                                    {isDownloading
                                        ? 'Download in Progress'
                                        : 'Download WGET Script'}
                                </Button>
                            </span>
                        </Tooltip>
                        <Typography className={c.p2}>Download notes:</Typography>
                        <Typography className={c.p}>
                            The downloaded script will contain a set of pre-configured WGET commands that you can execute on your computer system.
                        </Typography>
                        <Typography className={c.p3}>WGET Software:</Typography>
                        <Typography className={c.p}>
                            WGET is software that allows one to download internet content using a
                            command line interface. Availability and installation of wget varies
                            between operating systems. Please verify that wget is available for 
                            your computer system and is installed.
                        </Typography>
                        <Typography className={c.p3}>WGET Script File Size Limit:</Typography>
                        <Typography className={c.p}>
                            The downloaded script files max out at 500k lines. Multiple script 
                            files may be downloaded to support the entire payload.
                        </Typography>
                        <Typography className={c.p3}>Downloaded Products Directory:</Typography>
                        <Typography className={c.p}>
                            After script execution, you can find all the downloaded products in a 
                            directory named:
                            <Typography className={c.pCode}>
                                ./pdsimg-atlas-wget_&lt;datestamp&gt;
                            </Typography>
                            This directory will be created in your shell's current working directory. If you are using a Windows machine, you may need to run the script in a Windows Subsystem for Linux (WSL) environment.
                        </Typography>
                        <Typography className={c.p2}>Operating System Instructions:</Typography>
                        <Typography className={c.p3}>Mac / Linux:</Typography>
                        <Typography className={c.p}>
                            After downloading, open a shell window and change directory to the location where the script was downloaded and then execute the "pdsimg-atlas-wget_&lt;datestamp&gt;.sh" script 
                            using the following command:<br />
                        </Typography>
                        <Typography className={c.pCode}>
                            source pdsimg-atlas-wget_&lt;datestamp&gt;.sh
                        </Typography>
                        <Typography className={c.p3}>Windows (WSL):</Typography>
                        <Typography className={c.p}>
                            After downloading, open a shell window and change directory to the location where the script was downloaded and then execute the "pdsimg-atlas-wget_&lt;datestamp&gt;.bat" script 
                            using the following command:<br />
                        </Typography>
                        <Typography className={c.pCode}>
                            pdsimg-atlas-wget_&#123;datestamp&#125;.bat
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
    );
}

WGETTab.propTypes = {}

export default WGETTab
