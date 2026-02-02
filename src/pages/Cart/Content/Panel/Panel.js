import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles } from '@mui/styles'

import Typography from '@mui/material/Typography'

import BrowserTab from './Tabs/Browser/Browser'
import CURLTab from './Tabs/CURL/CURL'
import WGETTab from './Tabs/WGET/WGET'
import CSVTab from './Tabs/CSV/CSV'
import TXTTab from './Tabs/TXT/TXT'
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
    tabPanels: {
        height: `calc(100% - ${theme.headHeights[2] * 2}px)`,
        overflowY: 'auto',
        position: 'relative',
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

    const [tab, setTab] = useState(0)
    const [selectionCount, setSelectionCount] = useState(0)
    const selectorRef = useRef()

    const dispatch = useDispatch()

    const handleChange = (event, newTabIndex) => {
        setTab(newTabIndex)
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
                    <div className={c.panelBody}>
                        <Typography className={c.panelBodyText}>
                            First, select the products you want to download.<br />
                            Second, choose your download method.<br />
                            Third, click the download button to start the download.
                        </Typography>
                    </div>
                    <ProductDownloadSelector
                        ref={selectorRef}
                        onSelection={setSelectionCount}
                    />
                    <DownloadMethodTabs value={tab} onChange={handleChange} />
                    <div className={c.tabPanels}>
                        <BrowserTab value={tab} index={0} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <WGETTab value={tab} index={1} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <CURLTab value={tab} index={2} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <CSVTab value={tab} index={3} selectorRef={selectorRef} selectionCount={selectionCount} />
                        <TXTTab value={tab} index={4} selectorRef={selectorRef} selectionCount={selectionCount} />
                    </div>
                </>
            )}
        </div>
    )
}

Panel.propTypes = {}

export default Panel
