import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import ProductDownloadSelector from '../../../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import { setSnackBarText } from '../../../../../../core/redux/actions/actions.js'
import { CURLCart } from '../../../../../../core/downloaders/CURL'

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
        padding: `${theme.spacing(4)}px`,
        fontFamily: 'monospace',
        marginBottom: '5px',
    },
}))

function CURLTab(props) {
    const { value, index, ...other } = props

    const c = useStyles()
    const dispatch = useDispatch()
    const selectorRef = useRef()

    const [datestamp, setDatestamp] = useState()

    return (
        <div
            role="curl-tab"
            hidden={value !== index}
            id={`scrollable-auto-CURLTabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography variant="h5">CURL</Typography>
                    <Typography className={c.p}>
                        Select the products to include in your download:
                    </Typography>
                    <ProductDownloadSelector ref={selectorRef} />
                    <Button
                        className={c.button1}
                        variant="contained"
                        aria-label="curl download button"
                        onClick={() => {
                            if (selectorRef && selectorRef.current) {
                                const sel = selectorRef.current.getSelected() || {}
                                if (sel.length == 0) {
                                    dispatch(setSnackBarText('Nothing to download', 'warning'))
                                } else {
                                    const datestamp = new Date()
                                        .toISOString()
                                        .replace(/:/g, '_')
                                        .replace(/\./g, '_')
                                        .replace(/Z/g, '')
                                    dispatch(CURLCart(sel, datestamp))
                                    setDatestamp(datestamp)
                                }
                            }
                        }}
                    >
                        Download CURL Script
                    </Button>
                    <Typography className={c.p2}>Requires: curl 7.73.0+</Typography>
                    <Typography className={c.p}>
                        To provide bulk downloading of PDS Imaging products, we have provided a set
                        of pre-configured CURL commands below that can be executed on your computer
                        to download the contents of your bulk download cart.
                    </Typography>
                    <Typography className={c.p}>
                        CURL is software that allows one to download internet content using a
                        command line interface. Availability and installation of Curl varies between
                        operating systems. Please verify that Curl is available for your computer
                        and is installed.
                    </Typography>
                    <Typography className={c.p2}>
                        After downloading, run the "pdsimg-atlas-curl_{datestamp}.bat" with the
                        following command:
                    </Typography>
                    <Typography className={c.p3}>Mac / Linux:</Typography>
                    <Typography className={c.pCode}>
                        source pdsimg-atlas-curl_{datestamp}.bat
                    </Typography>

                    <Typography className={c.p3}>Windows (WSL):</Typography>
                    <Typography className={c.pCode}>
                        bash
                        <br />
                        source pdsimg-atlas-curl_{datestamp}.bat
                    </Typography>
                    <Typography className={c.p}>
                        All files are download into an `./pdsimg-atlas-curl_{datestamp}` directory.
                    </Typography>
                </Box>
            )}
        </div>
    )
}

CURLTab.propTypes = {}

export default CURLTab
