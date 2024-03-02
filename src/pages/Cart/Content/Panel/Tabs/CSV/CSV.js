import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import ProductDownloadSelector from '../../../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import { setSnackBarText } from '../../../../../../core/redux/actions/actions.js'
import { CSVCart } from '../../../../../../core/downloaders/CSV'

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
}))

function CSVTab(props) {
    const { value, index, ...other } = props

    const c = useStyles()
    const dispatch = useDispatch()
    const selectorRef = useRef()

    const [datestamp, setDatestamp] = useState()

    return (
        <div
            role="csv-tab"
            hidden={value !== index}
            id={`scrollable-auto-csvtabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography variant="h5">CSV</Typography>
                    <Typography className={c.p}>
                        Select the products to include in your download:
                    </Typography>
                    <ProductDownloadSelector ref={selectorRef} />
                    <Button
                        className={c.button1}
                        variant="contained"
                        aria-label="csv download button"
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
                                    dispatch(CSVCart(sel, datestamp))
                                    setDatestamp(datestamp)
                                }
                            }
                        }}
                    >
                        Download CSV
                    </Button>
                    <Typography className={c.p}>
                        Downloads a .csv named `./pdsimg-atlas_{datestamp}.csv` with the following
                        header:
                    </Typography>
                    <Typography className={c.pCode}>filename,size,uri,download_url</Typography>
                </Box>
            )}
        </div>
    )
}

CSVTab.propTypes = {}

export default CSVTab
