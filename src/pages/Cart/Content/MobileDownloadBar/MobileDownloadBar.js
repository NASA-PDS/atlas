import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles, withStyles } from '@mui/styles'

import clsx from 'clsx'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'

import { ZipStreamCart } from '../../../../core/downloaders/ZipStream'
import { setSnackBarText } from '../../../../core/redux/actions/actions.js'
import { humanFileSize } from '../../../../core/utils'

import ProductDownloadSelector from '../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import DownloadingCard from '../../../../components/DownloadingCard/DownloadingCard'

const useStyles = makeStyles((theme) => ({
    MobileDownloadBar: {
        width: `calc(100% - ${theme.headHeights[1] + 1}px)`,
        position: 'absolute',
        left: `${theme.headHeights[1] + 1}px`,
        bottom: '0px',
        height: `${theme.headHeights[1]}px`,
        display: 'flex',
        flexFlow: 'column',
        background: theme.palette.swatches.grey.grey200,
        borderTop: `1px solid ${theme.palette.swatches.grey.grey300}`,
        zIndex: 1,
    },
    introMessage: {
        lineHeight: '20px',
        color: theme.palette.text.main,
        background: theme.palette.swatches.yellow.yellow800,
        padding: '10px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    button1: {
        height: 26,
        margin: '7px auto',
        fontSize: '14px',
        background: theme.palette.accent.main,
    },
    p: {
        padding: `${theme.spacing(1.5)}px 0px`,
    },
    downloadButton: {
        display: 'flex',
        justifyContent: 'center',
    },
    downloadingButton: {
        background: theme.palette.swatches.grey.grey300,
        color: theme.palette.text.primary,
        pointerEvents: 'none',
    },
    downloading: {
        bottom: '0px',
        position: 'absolute',
        width: '100%',
        padding: '12px',
        boxSizing: 'border-box',
    },
    error: {
        display: 'none',
        fontSize: '16px',
        padding: '10px',
        background: theme.palette.swatches.red.red500,
        color: theme.palette.text.secondary,
        borderTop: `1px solid ${theme.palette.swatches.red.red600}`,
        fontWeight: 'bold',
    },
    errorOn: {
        display: 'flex',
    },
    errorClose: {
        color: theme.palette.text.secondary,
        position: 'absolute',
        right: '0px',
        top: '0px',
    },
}))

const MobileDownloadBar = (props) => {
    const {} = props
    const c = useStyles()

    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadId, setDownloadId] = useState(0)
    const [status, setStatus] = useState(null)
    const [zipController, setZipController] = useState(null)
    const [error, setError] = useState(null)
    const [summary, setSummary] = useState({ size: 0 })

    const dispatch = useDispatch()
    const selectorRef = useRef()

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })
    const checkedCart = cart.filter((v) => v.checked === true)

    const onSummaryReady = (summary) => {
        setSummary(summary)
    }

    return (
        <div className={c.MobileDownloadBar}>
            <ProductDownloadSelector
                ref={selectorRef}
                hidden={true}
                forceAllSelected={true}
                onSummaryReady={onSummaryReady}
            />
            <div className={clsx(c.error, { [c.errorOn]: error != null })}>
                <div>{error}</div>
                <IconButton
                    className={c.errorClose}
                    aria-label="close error"
                    onClick={() => {
                        setError(null)
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            {checkedCart.length === 0 ? (
                <div className={c.introMessage}>
                    <span></span>
                    <div>Select items to download.</div>
                </div>
            ) : !isDownloading ? (
                <div className={c.downloadButton}>
                    <Button
                        className={clsx(c.button1)}
                        variant="contained"
                        aria-label="browser zip download button"
                        onClick={() => {
                            if (selectorRef && selectorRef.current) {
                                const sel = selectorRef.current.getSelected() || []
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
                        {`Download ZIP (${humanFileSize(summary.size)})`}
                    </Button>
                </div>
            ) : (
                <div className={c.downloading}>
                    <DownloadingCard
                        downloadId={downloadId}
                        status={status}
                        controller={zipController}
                        controllerType="zip"
                        onStop={() => {
                            setIsDownloading(false)
                        }}
                    />
                </div>
            )}
        </div>
    )
}

MobileDownloadBar.propTypes = {}

export default MobileDownloadBar
