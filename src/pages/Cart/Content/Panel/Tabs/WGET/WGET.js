import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import ProductDownloadSelector from '../../../../../../components/ProductDownloadSelector/ProductDownloadSelector'
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
    pCode: {
        background: theme.palette.swatches.grey.grey200,
        padding: `${theme.spacing(4)}px`,
        fontFamily: 'monospace',
    },
}))

function WGETTab(props) {
    const { value, index, ...other } = props

    const c = useStyles()
    const dispatch = useDispatch()
    const selectorRef = useRef()

    return (
        <div
            role="wget-tab"
            hidden={value !== index}
            id={`scrollable-auto-wgettabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography variant="h5">WGET</Typography>
                    <Typography className={c.p}>
                        Select the products to include in your download:
                    </Typography>
                    <ProductDownloadSelector ref={selectorRef} />
                    <Button
                        className={c.button1}
                        variant="contained"
                        aria-label="wget download button"
                        onClick={() => {
                            if (selectorRef && selectorRef.current) {
                                dispatch(WGETCart(selectorRef.current.getSelected()))
                            }
                        }}
                    >
                        Download WGET Script
                    </Button>
                    <Typography className={c.p}>
                        To provide bulk downloading of PDS Imaging products, we have provided a set
                        of preconfigured WGET commands below that can be executed on your computer
                        to download the contents of your bulk download cart.
                    </Typography>
                    <Typography className={c.p}>
                        WgGET is software that allows one to download internet content using a
                        command line interface. Availability and installation of wget varies between
                        operating systems. Please verify that wget is available for your computer
                        and is installed.
                    </Typography>
                    <Typography className={c.p2}>
                        After downloading, run the "atlas_wget_script.bat" with the following
                        command
                    </Typography>
                    <Typography className={c.pCode}>source atlas_wget_script.bat</Typography>
                </Box>
            )}
        </div>
    )
}

WGETTab.propTypes = {}

export default WGETTab
