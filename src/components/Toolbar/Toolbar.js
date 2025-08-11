import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import Url from 'url-parse'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'

import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles, useTheme } from '@mui/material/styles'
import withWidth from '@mui/material/withWidth'

import MenuIcon from '@material-ui/icons/Menu'
import MenuOpenIcon from '@material-ui/icons/MenuOpen'
import SettingsIcon from '@material-ui/icons/Settings'
import CloseIcon from '@material-ui/icons/Close'
import FilterListIcon from '@material-ui/icons/FilterList'
import MapIcon from '@material-ui/icons/Map'
import ViewComfyIcon from '@material-ui/icons/ViewComfy'
import RefreshIcon from '@material-ui/icons/Refresh'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import ImageSearchIcon from '@material-ui/icons/ImageSearch'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'

import {
    setModal,
    setWorkspace,
    resetFilters,
    setFilexPreview,
    removeFilexColumn,
} from '../../core/redux/actions/actions.js'

import { publicUrl, HASH_PATHS } from '../../core/constants'

const drawerWidth = 230

const useStyles = makeStyles((theme) => ({
    Toolbar: {
        height: '100%',
        background: theme.palette.swatches.grey.grey100,
        color: theme.palette.text.secondary,
        boxSizing: 'border-box',
        borderRight: `1px solid ${theme.palette.swatches.grey.grey700}`,
    },
    main: {
        width: theme.headHeights[1],
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'space-between',
        background: theme.palette.swatches.grey.grey850,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    mainShift1: {
        marginLeft: drawerWidth - theme.headHeights[1],
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    mainShift2: {
        width: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    top: {
        display: 'flex',
        flexFlow: 'column',
    },
    bottom: {
        display: 'flex',
        flexFlow: 'column',
    },
    panelMenu: {
        display: 'flex',
        flexFlow: 'column',
    },
    drawer: {
        background: theme.palette.swatches.grey.grey900,
        width: drawerWidth - theme.headHeights[1],
        borderRight: `1px solid ${theme.palette.swatches.grey.grey700}`,
    },
    list: {
        'minWidth': 150,
        'paddingTop': 0,
        '& a': {
            height: theme.headHeights[1],
        },
    },
    listItem: {
        'padding': 0,
        'height': theme.headHeights[1],
        'backgroundColor': 'rgba(0,0,0,0)',
        '&:hover': {
            backgroundColor: theme.palette.swatches.grey.grey700,
        },
    },
    listItemNoClick: {
        pointerEvents: 'none',
        paddingRight: '8px',
    },
    listIndent: {
        paddingLeft: '14px',
    },
    aLink: {
        'width': '100%',
        'height': '100% !important',
        'padding': `9px 0px 9px ${theme.spacing(3)}px`,
        'color': theme.palette.text.secondary,
        'textDecoration': 'none',
        'boxSizing': 'border-box',
        'lineHeight': `${theme.headHeights[1]}px`,
        'display': 'flex',
        'justifyContent': 'space-between',
        'borderLeft': `2px solid rgba(0,0,0,0)`,
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey800}`,
        '& span': {
            lineHeight: 1,
        },
    },
    activePath: {
        'background': theme.palette.swatches.grey.grey800,
        'borderLeft': `2px solid ${theme.palette.swatches.blue.blue500}`,
        '& svg': {
            color: theme.palette.swatches.blue.blue500,
        },
        '& span': {
            color: theme.palette.swatches.blue.blue500,
            fontWeight: 'bold',
        },
    },
    divider: {
        background: theme.palette.swatches.grey.grey700,
    },
    dividerNonSearch: {
        background: theme.palette.swatches.grey.grey200,
    },
    button: {
        'width': theme.headHeights[1],
        'height': theme.headHeights[1],
        'borderRadius': 0,
        'fontSize': 18,
        'color': theme.palette.swatches.grey.grey400,
        'border': `2px solid transparent`,
        'transition': 'all 0.2s ease-in-out',
        '&:hover': {
            color: theme.palette.swatches.grey.grey300,
        },
    },
    buttonActive: {
        color: theme.palette.active.main,
        borderLeft: `2px solid ${theme.palette.active.main}`,
        [theme.breakpoints.down('sm')]: {
            background: `${theme.palette.active.main} !important`,
            color: theme.palette.swatches.grey.grey800,
        },
    },
    nav: {
        height: theme.headHeights[1],
        fontSize: 24,
        paddingTop: '4px',
    },
    navNonSearch: {
        'background': theme.palette.swatches.grey.grey100,
        'borderLeft': `1px solid transparent`,
        'borderRight': `1px solid ${theme.palette.swatches.grey.grey200}`,
        'transition': 'all 0.2s ease-in-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey100,
            color: theme.palette.swatches.grey.grey700,
        },
    },
    optionsName: {
        whiteSpace: 'nowrap',
    },
    optionsItem: {
        'display': 'flex',
        'lineHeight': `${theme.headHeights[1]}px`,
        '& > span': {
            'display': 'flex',
            'justifyContent': 'space-between',
            'flex': '1',
            '& > span': {
                margin: 12,
            },
        },
        '& .MuiSwitch-track': {
            background: theme.palette.swatches.grey.grey100,
        },
    },
    cartLength: {
        color: theme.palette.text.secondary,
        background: '#F64137',
        border: `2px solid ${theme.palette.secondary.main}`,
        padding: '0px 4px 0px 3px',
        height: '16px',
        minWidth: '8px',
        borderRadius: '12px',
        textAlign: 'center',
        lineHeight: '16px',
        fontSize: '12px',
        position: 'absolute',
        margin: '2px',
        left: '88px',
        fontFamily: 'sans-serif',
    },
    navIcon: {
        marginRight: '8px',
        display: 'flex',
        width: '22px',
        height: '22px',
    },
}))

const drawerItems = [
    {
        name: 'Home',
        path: 'https://pds-imaging.jpl.nasa.gov/',
    },
    {
        name: 'Atlas',
        isHeader: true,
    },
    {
        name: 'Search Images',
        path: '/search',
        isAtlas: true,
    },
    {
        name: 'Browse Archive',
        path: '/archive-explorer',
        isAtlas: true,
    },
    {
        name: 'Cart',
        path: '/cart',
        isAtlas: true,
        showLength: true,
    },
    {
        name: 'Documentation',
        path: '/documentation',
        isAtlas: true,
    },
    {
        name: 'Data',
        isHeader: true,
    },
    {
        name: 'Volumes',
        path: 'https://pds-imaging.jpl.nasa.gov/volumes/',
        isData: true,
    },
    {
        name: 'Holdings',
        path: 'https://pds-imaging.jpl.nasa.gov/holdings/',
        isData: true,
    },
    {
        name: 'Portal',
        path: 'https://pds-imaging.jpl.nasa.gov/portal/',
        isData: true,
    },
    {
        name: 'Release Calendar',
        path: 'https://pds.nasa.gov/datasearch/subscription-service/data-release-calendar.shtml',
        isData: true,
        isExternal: true,
    },
    {
        name: 'Tools & Tutorials',
        path: 'https://pds-imaging.jpl.nasa.gov/software/',
    },
    {
        name: 'Help',
        path: 'https://pds-imaging.jpl.nasa.gov/help/help.html',
    },
]

// Prepend publicUrl if available
if (publicUrl != null || publicUrl.length > 0)
    Object.keys(drawerItems).forEach((r) => {
        if (drawerItems[r].path) drawerItems[r].path = publicUrl + drawerItems[r].path
    })

const Toolbar = (props) => {
    const c = useStyles()

    // the current page we're on
    const location = useLocation()
    const history = useHistory()

    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down('sm'))

    const dispatch = useDispatch()
    const w = useSelector((state) => {
        return state.getIn(['workspace', 'main']).toJS()
    })
    const mW = useSelector((state) => {
        return state.getIn(['workspace', 'mobile'])
    })

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })
    const cartLength = cart.length

    // 0 all closed, 1 nav is open, 2 options is open
    const [drawer, setDrawer] = useState(0)

    const toggleDrawer = (state) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return
        }
        setDrawer(state)
    }

    let pathRoot = location.pathname
    pathRoot = pathRoot.split('?')[0]

    if (false && mobile) {
        return <div />
    }

    return (
        <div className={c.Toolbar}>
            <Drawer
                anchor={'left'}
                variant={'persistent'}
                open={drawer === 1}
                onClose={toggleDrawer(0)}
                PaperProps={{ className: c.drawer }}
            >
                <List className={c.list}>
                    {drawerItems.map((item, idx) => (
                        <ListItem
                            className={clsx(c.listItem, {
                                [c.listItemNoClick]: item.isHeader,
                                [c.listIndent]: item.isAtlas || item.isData || item.isPDS,
                            })}
                            key={idx}
                        >
                            <a
                                className={clsx(c.aLink, {
                                    [c.activePath]:
                                        item.path === pathRoot ||
                                        (item.path &&
                                            item.name != 'Home' &&
                                            pathRoot.indexOf(item.path) === 0),
                                })}
                                onClick={(e) => {
                                    if (item.isAtlas) {
                                        e.preventDefault()
                                        setDrawer(0)
                                        history.push(`${item.path}`)
                                    }
                                }}
                                target="__blank"
                                href={item.path}
                                rel="noopener"
                            >
                                {item.name === 'Search Images' && (
                                    <div className={c.navIcon}>
                                        <ImageSearchIcon />
                                    </div>
                                )}
                                {item.name === 'Browse Archive' && (
                                    <div className={c.navIcon}>
                                        <AccountTreeIcon />
                                    </div>
                                )}
                                {item.name === 'Cart' && (
                                    <div className={c.navIcon}>
                                        <ShoppingCartOutlinedIcon />
                                    </div>
                                )}
                                {item.name === 'Documentation' && (
                                    <div className={c.navIcon}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            style={{
                                                fill: 'currentColor',
                                            }}
                                        >
                                            <path d="M7 7H5A2 2 0 0 0 3 9V17H5V13H7V17H9V9A2 2 0 0 0 7 7M7 11H5V9H7M14 7H10V17H12V13H14A2 2 0 0 0 16 11V9A2 2 0 0 0 14 7M14 11H12V9H14M20 9V15H21V17H17V15H18V9H17V7H21V9Z" />
                                        </svg>
                                    </div>
                                )}
                                {item.isExternal && (
                                    <div className={c.navIcon}>
                                        <OpenInNewIcon />
                                    </div>
                                )}
                                <ListItemText primary={item.name}> </ListItemText>
                                {item.showLength && cartLength > 0 ? (
                                    <div className={c.cartLength}>
                                        {cartLength > 99 ? '99+' : cartLength}
                                    </div>
                                ) : null}
                            </a>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <div
                className={clsx(c.main, {
                    [c.mainShift1]: drawer === 1,
                    [c.mainShift2]: drawer === 2,
                })}
            >
                <div className={c.top}>
                    <Tooltip title="Navigation" arrow placement="right">
                        <IconButton
                            className={clsx(c.button, c.nav)}
                            aria-label="navigation"
                            size="small"
                            onClick={toggleDrawer(drawer === 1 ? 0 : 1)}
                        >
                            {drawer === 1 ? (
                                <MenuOpenIcon fontSize="inherit" />
                            ) : (
                                <MenuIcon fontSize="inherit" />
                            )}
                        </IconButton>
                    </Tooltip>
                    <Divider className={clsx(c.divider)} />

                    {pathRoot === `${publicUrl}/archive-explorer` ? (
                        <React.Fragment>
                            <div className={c.optionsItem}>
                                <Tooltip title="Reset Path" arrow placement="right">
                                    <IconButton
                                        className={c.button}
                                        aria-label="Reset path"
                                        size="small"
                                        onClick={() => {
                                            const newPath = HASH_PATHS.fileExplorer
                                            const currentURL = new Url(window.location, true)

                                            dispatch(setFilexPreview({}))
                                            if (Object.keys(currentURL.query).length > 0)
                                                history.replace(newPath)
                                            dispatch(removeFilexColumn(0))
                                        }}
                                    >
                                        <RefreshIcon
                                            fontSize="inherit"
                                            style={{ transform: 'rotateY(180deg)' }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </React.Fragment>
                    ) : null}
                    {pathRoot === `${publicUrl}/search` ? (
                        <React.Fragment>
                            <div className={c.panelMenu}>
                                <div className={c.optionsItem}>
                                    <Tooltip title="Options" arrow placement="right">
                                        <IconButton
                                            className={c.button}
                                            aria-label="options"
                                            size="small"
                                            onClick={toggleDrawer(drawer === 2 ? 0 : 2)}
                                        >
                                            {drawer === 2 ? (
                                                <CloseIcon fontSize="inherit" />
                                            ) : (
                                                <SettingsIcon fontSize="inherit" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    {drawer === 2 ? (
                                        <div className={c.optionsName}>Close Settings Menu</div>
                                    ) : null}
                                </div>
                                <div className={c.optionsItem}>
                                    <Tooltip title="Filters Panel" arrow placement="right">
                                        <IconButton
                                            className={clsx(c.button, {
                                                [c.buttonActive]: mobile
                                                    ? mW === 'filters'
                                                    : w.filters,
                                            })}
                                            aria-label="filters panel"
                                            size="small"
                                            onClick={() => {
                                                if (mobile)
                                                    dispatch(setWorkspace('filters', 'mobile'))
                                                else
                                                    dispatch(
                                                        setWorkspace({ ...w, filters: !w.filters })
                                                    )
                                            }}
                                        >
                                            <FilterListIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                    {drawer === 2 ? (
                                        <span>
                                            <div className={c.optionsName}>Show Filters</div>
                                            <Switch
                                                size="small"
                                                checked={w.filters}
                                                onChange={() => {
                                                    if (mobile)
                                                        dispatch(setWorkspace('filters', 'mobile'))
                                                    else
                                                        dispatch(
                                                            setWorkspace({
                                                                ...w,
                                                                filters: !w.filters,
                                                            })
                                                        )
                                                }}
                                            />
                                        </span>
                                    ) : null}
                                </div>
                                <div className={c.optionsItem}>
                                    <Tooltip title="Map Panel" arrow placement="right">
                                        <IconButton
                                            className={clsx(c.button, {
                                                [c.buttonActive]: mobile
                                                    ? mW === 'secondary'
                                                    : w.secondary,
                                            })}
                                            aria-label="Map Panel"
                                            size="small"
                                            onClick={() => {
                                                if (mobile)
                                                    dispatch(setWorkspace('secondary', 'mobile'))
                                                else
                                                    dispatch(
                                                        setWorkspace({
                                                            ...w,
                                                            secondary: !w.secondary,
                                                            results:
                                                                !w.secondary === false
                                                                    ? true
                                                                    : w.results,
                                                        })
                                                    )
                                            }}
                                        >
                                            <MapIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                    {drawer === 2 ? (
                                        <span>
                                            <div className={c.optionsName}>Show Map</div>
                                            <Switch
                                                size="small"
                                                checked={w.secondary}
                                                onChange={() => {
                                                    if (mobile)
                                                        dispatch(
                                                            setWorkspace('secondary', 'mobile')
                                                        )
                                                    else
                                                        dispatch(
                                                            setWorkspace({
                                                                ...w,
                                                                secondary: !w.secondary,
                                                                results:
                                                                    !w.secondary === false
                                                                        ? true
                                                                        : w.results,
                                                            })
                                                        )
                                                }}
                                            />
                                        </span>
                                    ) : null}
                                </div>
                                <div className={c.optionsItem}>
                                    <Tooltip title="Results Panel" arrow placement="right">
                                        <IconButton
                                            className={clsx(c.button, {
                                                [c.buttonActive]: mobile
                                                    ? mW === 'results'
                                                    : w.results,
                                            })}
                                            aria-label="Results Panel"
                                            size="small"
                                            onClick={() => {
                                                if (mobile)
                                                    dispatch(setWorkspace('results', 'mobile'))
                                                else
                                                    dispatch(
                                                        setWorkspace({
                                                            ...w,
                                                            results: !w.results,
                                                            secondary:
                                                                !w.results === false
                                                                    ? true
                                                                    : w.secondary,
                                                        })
                                                    )
                                            }}
                                        >
                                            <ViewComfyIcon fontSize="inherit" />
                                        </IconButton>
                                    </Tooltip>
                                    {drawer === 2 ? (
                                        <span>
                                            <div className={c.optionsName}>Show Results</div>
                                            <Switch
                                                size="small"
                                                checked={w.results}
                                                onChange={() => {
                                                    if (mobile)
                                                        dispatch(setWorkspace('results', 'mobile'))
                                                    else
                                                        dispatch(
                                                            setWorkspace({
                                                                ...w,
                                                                results: !w.results,
                                                                secondary:
                                                                    !w.results === false
                                                                        ? true
                                                                        : w.secondary,
                                                            })
                                                        )
                                                }}
                                            />
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <Divider className={c.divider} />
                            <div className={c.optionsItem}>
                                <Tooltip title="Restart Search" arrow placement="right">
                                    <IconButton
                                        className={c.button}
                                        aria-label="Restart search"
                                        size="small"
                                        onClick={() => {
                                            dispatch(resetFilters())
                                        }}
                                    >
                                        <RefreshIcon
                                            fontSize="inherit"
                                            style={{ transform: 'rotateY(180deg)' }}
                                        />
                                    </IconButton>
                                </Tooltip>
                                {drawer === 2 ? (
                                    <div className={c.optionsName}>Reset All Search Settings</div>
                                ) : null}
                            </div>
                            <Divider className={c.divider} />
                        </React.Fragment>
                    ) : null}
                </div>
                <div className={c.bottom}>
                    <Divider className={c.divider} />
                    <div className={c.optionsItem}>
                        <Tooltip title="Help" arrow placement="right">
                            <IconButton className={c.button} aria-label="help button" size="small">
                                <HelpOutlineIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        {drawer === 2 ? <div className={c.optionsName}>Help</div> : null}
                    </div>
                    <div className={c.optionsItem}>
                        <Tooltip title="Info" arrow placement="right">
                            <IconButton
                                className={c.button}
                                aria-label="info button"
                                size="small"
                                onClick={() => dispatch(setModal('information'))}
                            >
                                <InfoOutlinedIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        {drawer === 2 ? <div className={c.optionsName}>About Atlas</div> : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withWidth()(Toolbar)
