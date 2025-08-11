import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles, withStyles } from '@mui/material/styles'

import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import BrowserTab from './Tabs/Browser/Browser'
import CURLTab from './Tabs/CURL/CURL'
import WGETTab from './Tabs/WGET/WGET'
import CSVTab from './Tabs/CSV/CSV'
import TXTTab from './Tabs/TXT/TXT'

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
        padding: `0px ${theme.spacing(2)}px`,
        boxSizing: 'border-box',
    },
    panelTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: `${theme.headHeights[2]}px`,
    },
    tabs: {
        height: theme.headHeights[2],
        width: '100%',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey150,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        color: theme.palette.text.main,
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
        'background': theme.palette.swatches.yellow.yellow800,
        'margin': theme.spacing(4),
        'padding': theme.spacing(3),
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

const StyledTabs = withStyles((theme) => ({
    indicator: {
        'display': 'flex',
        'justifyContent': 'center',
        'backgroundColor': 'transparent',
        'height': '5px',
        '& > span': {
            maxWidth: 124,
            width: '100%',
            backgroundColor: theme.palette.accent.main,
        },
    },
}))((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />)

const StyledTab = withStyles((theme) => ({
    root: {
        'color': theme.palette.text.main,
        'fontSize': theme.typography.pxToRem(14),
        'marginRight': theme.spacing(1),
        'minWidth': 58,
        '&:focus': {
            opacity: 1,
        },
    },
}))((props) => <Tab disableRipple {...props} />)

const Panel = (props) => {
    const {} = props
    const c = useStyles()

    const [tab, setTab] = useState(0)

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
                            Choose Your Download Method
                        </Typography>
                    </div>
                    <div className={c.tabs}>
                        <StyledTabs
                            value={tab}
                            onChange={handleChange}
                            aria-label="cart download tab"
                        >
                            <StyledTab label="ZIP" />
                            <StyledTab label="WGET" />
                            <StyledTab label="CURL" />
                            <StyledTab label="CSV" />
                            <StyledTab label="TXT" />
                        </StyledTabs>
                    </div>
                    <div className={c.tabPanels}>
                        <BrowserTab value={tab} index={0} />
                        <WGETTab value={tab} index={1} />
                        <CURLTab value={tab} index={2} />
                        <CSVTab value={tab} index={3} />
                        <TXTTab value={tab} index={4} />
                    </div>
                </>
            )}
        </div>
    )
}

Panel.propTypes = {}

export default Panel
