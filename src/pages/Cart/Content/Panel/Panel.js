import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles } from '@mui/styles'

import Typography from '@mui/material/Typography'

import ProductDownloadSelector from '../../../../components/ProductDownloadSelector/ProductDownloadSelector'
import DownloadMethodTabs from './DownloadMethodTabs'

const useStyles = makeStyles((theme) => ({
    Panel: {
        width: '600px',
        height: `100%`,
        display: 'flex',
        flexFlow: 'column',
        background: theme.palette.swatches.grey.grey100,
        borderLeft: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    header: {
        height: theme.headHeights[2],
        width: '100%',
        padding: `0px ${theme.spacing(2)}`,
        boxSizing: 'border-box',
        flexShrink: 0,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    scrollableContent: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    panelTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        lineHeight: `${theme.headHeights[2]}px`,
    },
    panelBody: {
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    introMessage: {
        'position': 'relative',
        'top': '100px',
        'width': '280px',
        'transform': 'translateY(-50%)',
        'lineHeight': '20px',
        'fontSize': '16px',
        'color': theme.palette.text.main,
        'background': theme.palette.swatches.yellow.yellow700,
        'margin': theme.spacing(4),
        'padding': theme.spacing(4),
        'boxShadow': '0px 2px 4px 0px rgba(0, 0, 0, 0.2)',
        '& > span': {
            position: 'absolute',
            top: '50%',
            left: '-8px',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `8px solid ${theme.palette.swatches.yellow.yellow800}`,
        },
    },
}))

const Panel = (props) => {
    const {} = props
    const c = useStyles()

    const [selectedDownloadMethodIndex, setSelectedDownloadMethodIndex] = useState(null)
    const [selectionCount, setSelectionCount] = useState(0)
    const selectorRef = useRef()

    const dispatch = useDispatch()

    // Reset download method when no product types are selected
    useEffect(() => {
        if (selectionCount === 0) {
            setSelectedDownloadMethodIndex(null)
        }
    }, [selectionCount])

    const handleChange = (event, newDownloadMethodIndex) => {
        setSelectedDownloadMethodIndex(newDownloadMethodIndex)
    }

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })
    const checkedCart = cart.filter((v) => v.checked === true)

    return (
        <div className={c.Panel}>
            {checkedCart.length === 0 ? (
                <div className={c.introMessage}>
                    <span></span>
                    <div>
                        Select one or more items in your cart to begin the bulk download process.
                    </div>
                </div>
            ) : (
                <>
                    <div className={c.header}>
                        <Typography className={c.panelTitle} variant="h4">
                            Download Your Products
                        </Typography>
                    </div>
                    <div className={c.scrollableContent}>
                        <div className={c.panelBody}>
                            <Typography className={c.panelBodyText}>
                                Select the products to include in your download, choose your download method, then click the download button to start.
                            </Typography>
                        </div>
                        <ProductDownloadSelector
                            ref={selectorRef}
                            onSelection={setSelectionCount}
                        />
                        {selectionCount > 0 && (
                            <DownloadMethodTabs
                                selectedDownloadMethodIndex={selectedDownloadMethodIndex}
                                onChange={handleChange}
                                selectorRef={selectorRef}
                                selectionCount={selectionCount}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

Panel.propTypes = {}

export default Panel
