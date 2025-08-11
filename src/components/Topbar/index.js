import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles, useTheme } from '@mui/material/styles'

import clsx from 'clsx'

import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import Badge from '@mui/material/Badge'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import AccountTreeIcon from '@mui/icons-material/AccountTree'

import { HASH_PATHS } from '../../core/constants'

import NASALogo from '../../media/images/nasa-logo.svg'

const useStyles = makeStyles((theme) => ({
    Topbar: {
        height: theme.headHeights[1],
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    left: {
        display: 'flex',
        marginLeft: theme.spacing(1.5),
    },
    right: {
        display: 'flex',
    },
    logoDiv: {
        width: theme.headHeights[1],
        height: theme.headHeights[1],
        padding: 4,
        boxSizing: 'border-box',
    },
    logo: {
        width: 32,
        height: 32,
    },
    appTitle: {
        'display': 'flex',
        'flexFlow': 'column',
        '& > div:last-child': {
            display: 'flex',
            marginTop: '-5px',
        },
    },
    node: {
        color: theme.palette.swatches.grey.grey500,
        fontWeight: 400,
        fontSize: 11,
        margin: 0,
        padding: `0px ${theme.spacing(1)}px`,
        lineHeight: '22px',
        textTransform: 'uppercase',
    },
    appNameDiv: {
        display: 'flex',
    },
    appName: {
        color: theme.palette.text.primary,
        fontWeight: 500,
        fontSize: 20,
        margin: 0,
        padding: `0px ${theme.spacing(0.5)}px`,
        lineHeight: '22px',
    },
    appNameBeta: {
        fontStyle: 'italic',
        fontSize: '14px',
        textTransform: 'uppercase',
        color: 'darkgoldenrod',
        lineHeight: '23px',
    },
    titleDivider: {
        color: theme.palette.swatches.grey.grey500,
        fontWeight: 500,
        fontSize: 20,
        margin: 0,
        padding: `0px 3px 0px 2px`,
        lineHeight: '22px',
    },
    appPage: {
        color: theme.palette.swatches.blue.blue800,
        fontSize: 14,
        letterSpacing: '1px',
        margin: 0,
        padding: `0px ${theme.spacing(0.5)}px`,
        lineHeight: '22px',
        textTransform: 'uppercase',
    },
    dividerV1: {
        background: theme.palette.swatches.grey.grey600,
        margin: `${theme.spacing(0.5)}px ${theme.spacing(2)}px`,
    },
    dividerV2: {
        background: theme.palette.swatches.grey.grey600,
        margin: `${theme.spacing(0.5)}px`,
    },
    dividerH: {
        background: theme.palette.swatches.grey.grey600,
    },
    button: {
        'width': theme.headHeights[1],
        'height': theme.headHeights[1],
        'borderRadius': 0,
        'fontSize': 20,
        'color': theme.palette.text.muted,
        'transition': 'color 0.2s ease-out',
        'borderTop': `2px solid transparent`,
        'borderBottom': `2px solid transparent`,
        '&:hover': {
            color: theme.palette.text.primary,
        },
    },
    buttonActive: {
        color: theme.palette.swatches.blue.blue500,
        background: 'rgba(0,0,0,0.05)',
        borderBottom: `2px solid ${theme.palette.swatches.blue.blue500}`,
    },
    cartBadge: {
        '& .MuiBadge-badge': {
            background: theme.palette.swatches.red.red500,
            color: theme.palette.text.secondary,
            right: 4,
            top: 1,
            border: `1px solid ${theme.palette.swatches.grey.grey100}`,
            padding: '0px 3px 0px 3px',
            height: '16px',
            minWidth: '16px;',
        },
    },
}))

const Topbar = () => {
    const c = useStyles()

    const location = useLocation()
    const history = useHistory()

    const theme = useTheme()
    const isMobileSm = useMediaQuery(theme.breakpoints.down('sm'))
    const isMobileXs = useMediaQuery(theme.breakpoints.down('xs'))

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })
    const cartLength = cart.length

    let pageName = null
    switch (location.pathname) {
        case HASH_PATHS.cart:
            pageName = 'Cart'
            break
        case HASH_PATHS.fileExplorer:
            pageName = 'Archive Explorer'
            break
        case HASH_PATHS.record:
            pageName = 'Record'
        case HASH_PATHS.search:
            pageName = 'Image Search'
            break
        default:
    }

    return (
        <div className={c.Topbar}>
            <div className={c.left}>
                <div className={c.logoDiv}>
                    <img className={c.logo} src={NASALogo} alt="NASA logo" />
                </div>
                <div className={c.appTitle}>
                    <div className={c.nodeDiv}>
                        <h3 className={c.node}>
                            {isMobileXs ? 'PDSIMG' : 'Cartography and Imaging Sciences'}
                        </h3>
                    </div>
                    <div>
                        <div className={c.appNameDiv}>
                            <h1 className={c.appName}>ATLAS</h1>
                            <div className={c.appNameBeta}>beta</div>
                        </div>
                        {pageName && (
                            <>
                                <div className={c.titleDivider}>/</div>
                                <div className={c.appPageDiv}>
                                    <h2 className={c.appPage}>{pageName}</h2>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className={c.right}>
                <Tooltip title="API Documentation" arrow placement="bottom">
                    <IconButton
                        className={clsx(c.button)}
                        aria-label="go to api documentation"
                        onClick={() => {
                            window.open(HASH_PATHS.apiDocumentation, '_blank').focus()
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            style={{ transform: 'scale(1.5)', fill: 'currentColor' }}
                        >
                            <path d="M7 7H5A2 2 0 0 0 3 9V17H5V13H7V17H9V9A2 2 0 0 0 7 7M7 11H5V9H7M14 7H10V17H12V13H14A2 2 0 0 0 16 11V9A2 2 0 0 0 14 7M14 11H12V9H14M20 9V15H21V17H17V15H18V9H17V7H21V9Z" />
                        </svg>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Image Search" arrow placement="bottom">
                    <IconButton
                        className={clsx(c.button, {
                            [c.buttonActive]: pageName === 'Image Search',
                        })}
                        aria-label="go to image search"
                        onClick={() => {
                            history.push(HASH_PATHS.search)
                        }}
                    >
                        <ImageSearchIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Archive Explorer" arrow placement="bottom">
                    <IconButton
                        className={clsx(c.button, {
                            [c.buttonActive]: pageName === 'Archive Explorer',
                        })}
                        aria-label="go to archive explorer"
                        onClick={() => {
                            history.push(HASH_PATHS.fileExplorer)
                        }}
                    >
                        <AccountTreeIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Cart" arrow placement="bottom">
                    <IconButton
                        className={clsx(c.button, { [c.buttonActive]: pageName === 'Cart' })}
                        aria-label="go to cart"
                        onClick={() => {
                            history.push(HASH_PATHS.cart)
                        }}
                    >
                        <Badge className={c.cartBadge} badgeContent={cartLength}>
                            <ShoppingCartOutlinedIcon fontSize="inherit" />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    )
}

export default Topbar
