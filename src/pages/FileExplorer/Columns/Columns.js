import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import Url from 'url-parse'

import ViewSlider from 'react-view-slider'

import {
    getIn,
    getPDSUrl,
    splitUri,
    getFilename,
    abbreviateNumber,
    getExtension,
} from '../../../core/utils'
import { IMAGE_EXTENSIONS, ES_PATHS } from '../../../core/constants'
import { streamDownloadFile } from '../../../core/downloaders/ZipStream.js'

import {
    addFilexColumn,
    removeFilexColumn,
    updateFilexColumn,
    queryFilexColumn,
    setFilexPreview,
    setModal,
    addToCart,
    setSnackBarText,
} from '../../../core/redux/actions/actions'

import { makeStyles } from '@material-ui/core/styles'

import MenuButton from '../../../components/MenuButton/MenuButton'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import Checkbox from '@material-ui/core/Checkbox'
import InputAdornment from '@material-ui/core/InputAdornment'

import AddIcon from '@material-ui/icons/Add'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import SortIcon from '@material-ui/icons/Sort'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined'
import FolderIcon from '@material-ui/icons/Folder'
import DragIndicatorIcon from '@material-ui/icons/DragIndicator'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import ImageIcon from '@material-ui/icons/Image'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import GetAppIcon from '@material-ui/icons/GetApp'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import SearchIcon from '@material-ui/icons/Search'
import FilterListIcon from '@material-ui/icons/FilterList'

import Draggable from 'react-draggable'
import Highlighter from 'react-highlight-words'

const initialColumnWidth = 180
const minColumnWidth = 180

const useStyles = makeStyles((theme) => ({
    Columns: {
        height: '100%',
        display: 'inline-flex',
        transition: 'opacity 0.2s ease-in-out',
    },
    columnsMobile: {
        width: 'unset !important',
        borderRight: 'none',
    },
    hasModalOver: {
        opacity: 0,
        maxWidth: '100%',
        overflow: 'hidden',
    },
    introMessage: {
        'position': 'relative',
        'width': '170px',
        'lineHeight': '18px',
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
    Column: {
        display: 'flex',
        height: '100%',
        minWidth: `${minColumnWidth}px`,
        borderRight: `1px solid ${theme.palette.swatches.grey.grey200}`,
        position: 'relative',
        background: theme.palette.swatches.grey.grey100,
        boxShadow: 'inset -1px 0px 2px rgba(0,0,0,0.06)',
        transition: 'width 0.3s ease-in-out, flex-basis 0.3s ease-in-out',
    },
    mobile: {
        width: '100vw !important',
    },
    tabletColumn: {
        height: `calc(100% - ${theme.headHeights[4]}px)`,
        width: '50%',
    },
    content: {
        height: '100%',
        // minus divider width
        width: '100%',
        position: 'relative',
    },
    header: {
        'height': `${theme.headHeights[2]}px`,
        'background': theme.palette.swatches.grey.grey0,
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey200}`,
        'boxSizing': 'border-box',
        'display': 'flex',
        'justifyContent': 'space-between',
        '& > div': {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
        },
        '& > div > div:first-child': {
            flex: 1,
            display: 'flex',
            maxWidth: 'calc(100% - 0px)',
        },
    },
    headerMobile: {
        '& > div > div:first-child': {
            maxWidth: 'calc(100% - 88px)',
        },
    },
    filterHeader: {},
    filterHeaderMobile: {},
    volumeHeader: {
        '& > div': {
            display: 'flex',
        },
    },
    directoryHeader: {},
    backButton: {
        lineHeight: '32px',
        borderRadius: 0,
        marginRight: '-12px',
    },
    searchButton: {
        lineHeight: '32px',
        borderRadius: 0,
        marginRight: '-12px',
    },
    searchButtonActive: {
        borderTop: `2px solid Transparent`,
        borderBottom: `2px solid ${theme.palette.accent.main}`,
    },
    dropdown: {
        'margin': '4px',
        'background': theme.palette.swatches.grey.grey600,
        'padding': '0px 0px 0px 11px',
        'borderRadius': '3px',
        'color': theme.palette.swatches.grey.grey0,
        '&::before': {
            borderBottom: 'unset',
        },
        '& > svg': {
            color: theme.palette.swatches.grey.grey0,
        },
    },
    dropdownMobile: {
        float: 'right',
    },
    headerTools: {
        display: 'flex',
    },
    buttonSort: {
        width: `${theme.headHeights[2]}px`,
        height: `${theme.headHeights[2]}px`,
    },
    buttonMore: {
        width: `${theme.headHeights[2]}px`,
        height: `${theme.headHeights[2]}px`,
    },
    iconSort: {
        transform: 'rotateY(180deg)',
    },
    body: {
        height: `calc(100% - ${theme.headHeights[2] + theme.headHeights[4]}px)`,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        boxSizing: 'border-box',
        overflowY: 'auto',
        transition: 'height 0.2s ease-in-out',
    },
    bodyWithFilterOpen: {
        height: `calc(100% - ${theme.headHeights[2] + theme.headHeights[4] + 37}px)`,
    },
    bodyMobile: {
        height: `calc(100% - ${
            theme.headHeights[2] + theme.headHeights[4] + theme.headHeights[4]
        }px)`,
    },
    list: {
        listStyleType: 'none',
        margin: 0,
        padding: `2px 0px`,
    },
    listItem: {
        'display': 'flex',
        'height': '28px',
        'lineHeight': '28px',
        'padding': `0px 12px 0px 4px`,
        'marginLeft': theme.spacing(1),
        'borderRadius': '4px 0px 0px 4px',
        'cursor': 'pointer',
        //'transition': 'background 0.1s ease-in',
        'overflow': 'hidden',
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey150}`,
        '&:hover': {
            'background': theme.palette.swatches.grey.grey150,
            '& .listItemButtons': {
                pointerEvents: 'inherit',
                opacity: 1,
            },
        },
    },
    listItemLessPadding: {
        paddingRight: '0px',
    },
    listItemFilter: {
        justifyContent: 'space-between',
        padding: `0px ${theme.spacing(2)}px 0px 0px`,
    },
    liType: {
        fontSize: '24px',
        padding: '2px',
    },
    liName: {
        margin: `0px ${theme.spacing(1.5)}px`,
        lineHeight: '30px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    liNameMobile: {
        lineHeight: `${theme.headHeights[3]}px`,
    },
    listItemActive: {
        background: `${theme.palette.accent.main} !important`,
        color: theme.palette.text.secondary,
    },
    listItemMobile: {
        height: `${theme.headHeights[3]}px`,
        lineHeight: `${theme.headHeights[3]}px`,
        fontSize: '16px',
    },
    footer: {
        padding: `0px ${theme.spacing(1.5)}px`,
        height: `${theme.headHeights[4]}px`,
        lineHeight: `${theme.headHeights[4]}px`,
        color: theme.palette.swatches.grey.grey500,
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    footerPath: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: 'calc(100% - 70px)',
    },
    divider: {
        'width': '20px',
        'height': '40px',
        'position': 'absolute',
        'right': 0,
        'lineHeight': '40px',
        'cursor': 'col-resize',
        'boxSizing': 'border-box',
        'textAlign': 'center',
        'paddingTop': '4px',
        'color': theme.palette.swatches.grey.grey300,
        'transform': 'unset !important',
        'transition': 'color 0.2s ease-out',
        '&:hover': {
            color: theme.palette.swatches.grey.grey500,
        },
    },
    flex: {
        display: 'flex',
    },
    flex2: {
        display: 'flex',
        justifyContent: 'space-between',
        maxWidth: '100%',
        width: '100%',
    },
    flexBetween: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
    },
    liflex: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    docCount: {
        marginLeft: '8px',
    },
    iconSvg: {
        width: '24px',
        height: '24px',
        paddingLeft: '2px',
    },
    volumeTitle: {
        padding: '8px 10px 6px 12px',
        fontSize: '15px',
        fontWeight: 700,
        fontFamily: 'inherit',
        textTransform: 'capitalize',
    },
    volumeTitleMobile: {
        fontSize: '16px',
        padding: '7px 2px 7px 12px',
        fontFamily: 'inherit',
    },
    directoryTitle: {
        padding: '12px 10px 9px 12px',
        color: theme.palette.swatches.grey.grey700,
        fontSize: '12px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        textOverflow: 'ellipsis',
        fontFamily: 'inherit',
    },
    directoryTitleMobile: {
        fontSize: '16px',
        padding: '7px 2px 7px 12px',
        fontFamily: 'inherit',
    },
    noContent: {
        textAlign: 'center',
        color: theme.palette.swatches.grey.grey500,
        padding: '4px 0px',
    },
    loading: {
        'position': 'absolute',
        'width': '100%',
        '& .MuiLinearProgress-barColorPrimary': {
            background: theme.palette.swatches.blue.blue500,
        },
    },
    viewSlider: {},
    viewSliderViewport: {
        '& > div': {
            'overflow': 'hidden !important',
            'background': 'white',
            '& > div': {
                height: '100%',
            },
        },
    },
    sliderPosition: {
        'display': 'flex',
        'width': '100%',
        'height': `${theme.headHeights[4]}px`,
        'position': 'absolute',
        'bottom': '0px',
        'left': '0px',
        'boxSizing': 'border-box',
        'padding': '0px 4px',
        'borderTop': `1px solid ${theme.palette.swatches.grey.grey200}`,
        '& > div': {
            transition: 'all 0.2s ease-in-out',
        },
        '& > div > div': {
            height: '4px',
            borderRadius: '4px',
            transition: 'all 0.2s ease-in-out',
        },
    },
    sliderPositionTablet: {
        width: 'calc(100% - 553px)',
        marginLeft: `${theme.headHeights[1] + 1}px`,
    },
    positionInactive: {
        '& > div': {
            background: theme.palette.swatches.grey.grey200,
        },
    },
    positionActive: {
        '& > div': {
            background: theme.palette.accent.main,
        },
    },
    hiddenColumn: {
        width: 0,
        flexBasis: 'unset !important',
        transition: 'width 0.3s ease-in-out',
        minWidth: '0px',
        overflow: 'hidden',
    },
    finalColumn: {
        //background: `linear-gradient(to right, ${theme.palette.swatches.grey.grey100}, transparent)`,
        //boxShadow: 'none',
        //borderRight: 'none',
    },
    finalColumnHead: {
        //background: `linear-gradient(to right, ${theme.palette.swatches.grey.grey0}, transparent)`,
    },
    detailsButton: {
        'marginRight': '-9px',
        'marginTop': '-1px',
        '& > button': {
            padding: '7px 12px',
        },
    },
    listItemButtons: {
        lineHeight: '25px',
        position: 'absolute',
        right: '0px',
        background: theme.palette.swatches.grey.grey150,
        transition: 'opacity 0.2s ease-out',
        opacity: 0,
        pointerEvents: 'none',
    },
    listItemButtonsActive: {
        'background': theme.palette.accent.main,
        '& button': {
            color: theme.palette.swatches.grey.grey0,
        },
    },
    button: {
        padding: '4px 4px 3px 4px',
    },
    checkLabel: {
        lineHeight: '30px',
        color: theme.palette.swatches.grey.grey50,
        fontSize: '11px',
    },
    filterSearch: {
        height: '0px',
        overflow: 'hidden',
        transition: 'height 0.2s ease-in-out',
    },
    filterSearchOpen: {
        height: '37px',
    },
    filterSearchInput: {
        'width': '100%',
        'height': '37px',
        '& input': {
            padding: '10px 12px',
        },
        '& .MuiFilledInput-underline:after': {
            borderBottom: `2px solid ${theme.palette.accent.main}`,
        },
        '& .MuiInputAdornment-root': {
            marginTop: '0px !important',
            marginRight: '-3px',
        },
    },
    highlight: {
        fontWeight: 'bold',
    },
}))

const Column = (props) => {
    const {
        params,
        columnId,
        numCols,
        prevColumn,
        prevNames,
        isMobile,
        mobileBack,
        mobileForward,
        setShowFilterColumns,
        showFilterColumns,
        isTablet,
        forceBackArrow,
        sort,
        setSort,
        setShowMobilePreview,
        pds_standard,
    } = props
    const mainPath = getIn(prevColumn, 'active.parent_uri', ':/').split(':/')[1]

    const c = useStyles()

    const dispatch = useDispatch()

    const colRef = useRef(null)
    const firstItemRef = useRef(null)

    let content = null

    switch (params.type) {
        case 'filter':
            content = getIn(params, 'results.buckets')
            break
        case 'volume':
            content = getIn(params, 'results.buckets')
            break
        case 'directory':
            content = getIn(params, 'results')
            break
        default:
            break
    }

    // This reclicks a product to repopulate it's preview.
    // Used in deep link
    useEffect(() => {
        if (scrollLoading) {
            return
        }
        if (params.active?._needsData === true && content) {
            for (let i = 0; i < content.length; i++) {
                const r = content[i]
                if (getIn(r, '_source.archive.name') === params.active?.key) {
                    dispatch(
                        setFilexPreview({
                            ...r._source.archive,
                            ...r._source.pds4_label,
                            key: params.active?.key,
                        })
                    )
                    break
                }
            }
        }
    }, [params])

    useEffect(() => {
        if (scrollLoading) {
            setScrollLoading(false)
            return
        }
        if (colRef && colRef.current) {
            if (content != null) {
                // And if there's only one item, click it
                if (!isMobile && content.length === 1 && firstItemRef && firstItemRef.current) {
                    firstItemRef.current.click()
                }
                // Find widest column name
                let longestName = ''
                content.forEach((c) => {
                    let name = getIn(c, '_source.archive.name')
                    if (name == null) name = getIn(c, 'key', '')
                    if (name.length > longestName.length) longestName = name
                })
                const bestWidth = Math.max(longestName.length * 8.2 + 70, minColumnWidth)
                colRef.current.style.width = `${bestWidth}px`
            }
        }
    }, [content, prevNames ? prevNames.length : null])

    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const [scrollLoading, setScrollLoading] = useState(false)
    const [filterSearchOpen, setFilterSearchOpen] = useState(false)
    const [filterSearchValue, setFilterSearchValue] = useState('')

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX)
    }
    const handleTouchMove = (e) => {
        // Not all touches move
        setTouchEnd(e.targetTouches[0].clientX)
    }
    const handleTouchEnd = () => {
        if (isMobile && touchEnd != null) {
            if (touchStart - touchEnd > 100) {
                // left swipe
                mobileForward()
            }

            if (touchStart - touchEnd < -100)
                // right swipe
                mobileBack()
        }
        setTouchEnd(null)
    }
    const handleScroll = (e) => {
        const distanceFromBottom =
            e.currentTarget.scrollHeight -
            (e.currentTarget.scrollTop + e.currentTarget.getBoundingClientRect().height - 1)
        if (
            !scrollLoading &&
            distanceFromBottom < 10 &&
            params &&
            params.results &&
            params.total > params.results.length
        ) {
            setScrollLoading(true)
            dispatch(queryFilexColumn(columnId, null, null))
        }
    }

    const isFinalColumn = !isMobile && columnId === numCols - 1

    const total =
        (params.type === 'filter' || params.type === 'volume') && content != null
            ? content.length
            : params.total || 0

    let currentParentUri = params?.results?.[0]?._source?.archive?.parent_uri
    if (currentParentUri == null && params?.results?.sampleEntry?._source?.archive?.parent_uri)
        currentParentUri = splitUri(
            params.results.sampleEntry._source.archive.parent_uri,
            'spacecraft/'
        )

    return (
        <div
            className={clsx(
                c.Column,
                {
                    'fade-in': !(!showFilterColumns && params.type === 'filter') && !isTablet,
                    'width-in-240': !(!showFilterColumns && params.type === 'filter'),
                    [c.hiddenColumn]: !showFilterColumns && params.type === 'filter',
                    [c.finalColumn]: isFinalColumn,
                },
                { [c.mobile]: isMobile, [c.tabletColumn]: isTablet }
            )}
            style={
                !(!showFilterColumns && params.type === 'filter')
                    ? { width: initialColumnWidth }
                    : {}
            }
            ref={colRef}
            onTouchStart={(e) => handleTouchStart(e)}
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={() => handleTouchEnd()}
        >
            <div className={c.content}>
                <div
                    className={clsx(c.header, c[params.type + 'Header'], {
                        [c.headerMobile]: isMobile,
                        [c[params.type + 'HeaderMobile']]: isMobile,
                        [c.finalColumnHead]: isFinalColumn,
                    })}
                >
                    <div className={c.flexBetween}>
                        <div className={c.flexBetween}>
                            {(isMobile || forceBackArrow) && columnId > 0 && (
                                <IconButton
                                    className={c.backButton}
                                    aria-label="back"
                                    onClick={() => {
                                        mobileBack()
                                    }}
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </IconButton>
                            )}
                            <>
                                {params.type === 'filter' &&
                                params.fields &&
                                params.fields.length > 0 ? (
                                    /*
                                    <Select
                                        className={clsx(c.dropdown, {
                                            [c.dropdownMobile]: isMobile,
                                        })}
                                        value={params.value}
                                        onChange={(e) => {
                                            dispatch(
                                                updateFilexColumn(columnId, {
                                                    value: e.target.value,
                                                })
                                            )
                                        }}
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Without label' }}
                                    >
                                        {params.fields.map((field, idx) => (
                                            <MenuItem value={field.value} key={idx}>
                                                {field.display_name || field.value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    */
                                    <Typography
                                        className={clsx(c.volumeTitle, {
                                            [c.volumeTitleMobile]: isMobile,
                                        })}
                                        variant="h6"
                                    >
                                        {params.display_name}
                                    </Typography>
                                ) : null}
                                {params.type === 'volume' ? (
                                    <div className={c.flex2}>
                                        <div className={c.flex}>
                                            {!isMobile && !showFilterColumns && (
                                                <IconButton
                                                    className={c.backButton}
                                                    aria-label="back"
                                                    onClick={() => {
                                                        setShowFilterColumns(true)
                                                    }}
                                                >
                                                    <ArrowBackIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <Typography
                                                className={clsx(c.volumeTitle, {
                                                    [c.volumeTitleMobile]: isMobile,
                                                })}
                                                variant="h6"
                                            >
                                                {pds_standard === 'pds3' ? 'Volumes' : 'Bundles'}
                                            </Typography>
                                        </div>
                                        <MenuButton
                                            key={1}
                                            options={['Filter', 'Regex Search']}
                                            buttonComponent={<MoreVertIcon fontSize="inherit" />}
                                            title={'Actions'}
                                            onChange={(option) => {
                                                if (option === 'Filter')
                                                    setFilterSearchOpen(!filterSearchOpen)
                                                else if (option === 'Regex Search')
                                                    dispatch(
                                                        setModal('regex', {
                                                            uri: currentParentUri,
                                                        })
                                                    )
                                            }}
                                        />
                                    </div>
                                ) : null}
                                {params.type === 'directory' && prevColumn?.active?.key != null ? (
                                    <div className={c.flex2}>
                                        <Typography
                                            className={clsx(c.directoryTitle, {
                                                [c.directoryTitleMobile]: isMobile,
                                            })}
                                            variant="h6"
                                        >
                                            {prevNames
                                                ? prevNames.map((n) => n.title).join('/')
                                                : prevColumn.active.key}
                                        </Typography>
                                        <MenuButton
                                            key={1}
                                            options={['Filter', 'Regex Search']}
                                            buttonComponent={<MoreVertIcon fontSize="inherit" />}
                                            title={'Actions'}
                                            onChange={(option) => {
                                                if (option === 'Filter')
                                                    setFilterSearchOpen(!filterSearchOpen)
                                                else if (option === 'Regex Search')
                                                    dispatch(
                                                        setModal('regex', {
                                                            uri: currentParentUri,
                                                        })
                                                    )
                                            }}
                                        />
                                    </div>
                                ) : null}
                            </>
                        </div>
                        <div className={c.flex}>
                            {setShowMobilePreview && prevColumn && (
                                <IconButton
                                    key={0}
                                    aria-label="details"
                                    onClick={() => {
                                        setShowMobilePreview(true, prevColumn.active)
                                    }}
                                >
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                            )}
                            {setSort && (
                                <MenuButton
                                    key={1}
                                    options={['Folders', 'Files', 'A-Z', 'Z-A']}
                                    active={sort}
                                    buttonComponent={<SortIcon fontSize="inherit" />}
                                    title={'Sort'}
                                    onChange={(option) => {
                                        setSort(option)
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {params.type === 'directory' && prevColumn?.active?.key != null ? (
                    <div
                        className={clsx(c.filterSearch, { [c.filterSearchOpen]: filterSearchOpen })}
                    >
                        <TextField
                            className={c.filterSearchInput}
                            placeholder="Filter"
                            value={filterSearchValue}
                            variant="filled"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FilterListIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            onChange={(e) => {
                                setFilterSearchValue(e.target.value.toLowerCase())
                            }}
                        />
                        {/*
                        
                        <div className={c.regexSearchFooter}>
                            <div className={c.flex}>
                                <IconButton
                                    className={c.regexSearchHelp}
                                    aria-label="regex help"
                                    onClick={() => {
                                        const url =
                                            'https://www.elastic.co/guide/en/elasticsearch/reference/7.10/regexp-syntax.html'
                                        window.open(url, '_blank').focus()
                                    }}
                                >
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>

                                <Tooltip title="Search through all subfolders as well." arrow>
                                    <div className={c.flex}>
                                        <Checkbox
                                            className={c.regexSearchCheckbox}
                                            checked={regexSearchChildrenChecked}
                                            onChange={handleRegexSearchChildrenCheckbox}
                                            inputProps={{
                                                'aria-label':
                                                    'search all children recursively checkbox',
                                            }}
                                        />
                                        <div className={c.checkLabel}>Recursive</div>
                                    </div>
                                </Tooltip>
                            </div>
                            <Button
                                className={c.regexSearchSearch}
                                size="small"
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => {
                                    dispatch(
                                        updateFilexColumn(columnId, {
                                            search: {
                                                value: regexSearchValue,
                                                withChildren: regexSearchChildrenChecked,
                                            },
                                        })
                                    )
                                }}
                            >
                                Search
                            </Button>
                        </div>
                            */}
                    </div>
                ) : null}
                {content == null || scrollLoading ? (
                    <div className={c.loading}>
                        <LinearProgress />
                    </div>
                ) : null}
                <div
                    className={clsx(c.body, {
                        [c.bodyMobile]: isMobile,
                        [c.bodyWithFilterOpen]: filterSearchOpen,
                    })}
                    onScroll={handleScroll}
                >
                    {content != null ? (
                        <ul className={clsx(c.list, { 'fade-in': !prevNames })}>
                            {content.length == 0 ? (
                                <div className={c.noContent}>
                                    <Typography>This directory is empty.</Typography>
                                </div>
                            ) : null}
                            {params.type === 'filter'
                                ? content.map((result, idx) => (
                                      <li
                                          key={idx}
                                          className={clsx(c.listItem, c.listItemFilter, {
                                              [c.listItemActive]:
                                                  params.active && params.active.key === result.key,
                                              [c.listItemMobile]: isMobile,
                                          })}
                                          onClick={() => {
                                              dispatch(
                                                  updateFilexColumn(columnId, {
                                                      active: { ...result, fs_type: 'filter' },
                                                  })
                                              )
                                          }}
                                      >
                                          <div className={c.liflex}>
                                              <div className={c.liType}>
                                                  <svg className={c.iconSvg} viewBox="0 0 24 24">
                                                      <path
                                                          fill="currentColor"
                                                          d="M15,19.88C15.04,20.18 14.94,20.5 14.71,20.71C14.32,21.1 13.69,21.1 13.3,20.71L9.29,16.7C9.06,16.47 8.96,16.16 9,15.87V10.75L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L15,10.75V19.88M7.04,5L11,10.06V15.58L13,17.58V10.05L16.96,5H7.04Z"
                                                      />
                                                  </svg>
                                              </div>
                                              <div
                                                  className={clsx(c.liName, {
                                                      [c.liNameMobile]: isMobile,
                                                  })}
                                                  title={result.key}
                                              >
                                                  {result.key}
                                              </div>
                                          </div>
                                          <div className={c.flex}>
                                              <div className={c.docCount}>
                                                  {abbreviateNumber(result.doc_count)}
                                              </div>
                                          </div>
                                      </li>
                                  ))
                                : params.type === 'volume'
                                ? content.map((result, idx) => (
                                      <li
                                          key={idx}
                                          className={clsx(c.listItem, c.listItemFilter, {
                                              [c.listItemActive]:
                                                  params.active && params.active.key === result.key,

                                              [c.listItemMobile]: isMobile,
                                          })}
                                          onClick={() => {
                                              if (!isMobile) setShowFilterColumns(false)
                                              dispatch(
                                                  updateFilexColumn(columnId, {
                                                      active: { ...result, fs_type: 'volume' },
                                                  })
                                              )
                                          }}
                                      >
                                          <div className={c.liflex}>
                                              <div className={c.liType}>
                                                  <svg className={c.iconSvg} viewBox="0 0 24 24">
                                                      <path
                                                          fill="currentColor"
                                                          d="M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7C3.24,6.8 3.41,6.66 3.6,6.58L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.66,6.72 20.82,6.88 20.91,7.08L22.36,9.6C22.64,10.08 22.47,10.69 22,10.96L21,11.54V16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V10.96C2.7,11.13 2.32,11.14 2,10.96M12,4.15V4.15L12,10.85V10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V12.69L14,15.59C13.67,15.77 13.3,15.76 13,15.6V19.29L19,15.91M13.85,13.36L20.13,9.73L19.55,8.72L13.27,12.35L13.85,13.36Z"
                                                      />
                                                  </svg>
                                              </div>
                                              <div
                                                  className={clsx(c.liName, {
                                                      [c.liNameMobile]: isMobile,
                                                  })}
                                                  title={result.key}
                                              >
                                                  {getFilename(result.key)}
                                              </div>
                                          </div>
                                      </li>
                                  ))
                                : content.map((r, idx) => {
                                      const s = r._source || {}
                                      const result = s.archive || {}
                                      const pds4_label = s.pds4_label || {}

                                      // Exit if not match filter
                                      if (
                                          result.name &&
                                          filterSearchValue &&
                                          filterSearchValue.length > 0 &&
                                          result.name.toLowerCase().indexOf(filterSearchValue) == -1
                                      )
                                          return null

                                      return (
                                          <li
                                              key={idx}
                                              ref={idx === 0 ? firstItemRef : null}
                                              className={clsx(c.listItem, c.listItemLessPadding, {
                                                  [c.listItemActive]:
                                                      params.active &&
                                                      params.active.key === result.name,

                                                  [c.listItemMobile]: isMobile,
                                              })}
                                              onClick={() => {
                                                  dispatch(
                                                      updateFilexColumn(columnId, {
                                                          active: {
                                                              ...result,
                                                              ...pds4_label,
                                                              key: result.name,
                                                          },
                                                      })
                                                  )
                                              }}
                                          >
                                              <div className={c.liType}>
                                                  {getIn(r._source, ES_PATHS.archive.fs_type) ===
                                                  'file' ? (
                                                      <>
                                                          {IMAGE_EXTENSIONS.includes(
                                                              getExtension(result.uri, true)
                                                          ) ? (
                                                              <ImageIcon size="small" />
                                                          ) : (
                                                              <InsertDriveFileOutlinedIcon size="small" />
                                                          )}{' '}
                                                      </>
                                                  ) : (
                                                      <FolderIcon size="small" />
                                                  )}
                                              </div>
                                              <div className={c.flexBetween}>
                                                  <div
                                                      className={clsx(c.liName, {
                                                          [c.liNameMobile]: isMobile,
                                                      })}
                                                      title={result.name}
                                                  >
                                                      <Highlighter
                                                          highlightClassName={c.highlight}
                                                          searchWords={[filterSearchValue]}
                                                          autoEscape={true}
                                                          textToHighlight={String(
                                                              prevNames
                                                                  ? prevNames
                                                                        .map((n) => n.name)
                                                                        .join('/')
                                                                  : result.name
                                                          )}
                                                      />
                                                  </div>
                                                  <div
                                                      className={clsx(
                                                          c.listItemButtons,
                                                          'listItemButtons',
                                                          {
                                                              [c.listItemButtonsActive]:
                                                                  params.active &&
                                                                  params.active.key === result.name,
                                                          }
                                                      )}
                                                  >
                                                      {getIn(s, ES_PATHS.archive.fs_type) ===
                                                      'file' ? (
                                                          <Tooltip title="Download" arrow>
                                                              <IconButton
                                                                  className={clsx(c.button, {
                                                                      [c.buttonMobile]: isMobile,
                                                                  })}
                                                                  aria-label="quick download"
                                                                  onClick={(e) => {
                                                                      e.stopPropagation()
                                                                      if (s.uri != null) {
                                                                          streamDownloadFile(
                                                                              getPDSUrl(
                                                                                  s.uri,
                                                                                  getIn(
                                                                                      s,
                                                                                      ES_PATHS.release_id
                                                                                  )
                                                                              ),
                                                                              getFilename(s.uri)
                                                                          )
                                                                      }
                                                                  }}
                                                              >
                                                                  <GetAppIcon size="small" />
                                                              </IconButton>
                                                          </Tooltip>
                                                      ) : null}
                                                      <Tooltip title="Add to Cart" arrow>
                                                          <IconButton
                                                              className={clsx(c.button, {
                                                                  [c.buttonMobile]: isMobile,
                                                              })}
                                                              aria-label="add to cart"
                                                              onClick={(e) => {
                                                                  e.stopPropagation()
                                                                  dispatch(
                                                                      addToCart(
                                                                          getIn(
                                                                              s,
                                                                              ES_PATHS.archive
                                                                                  .fs_type
                                                                          ) === 'directory'
                                                                              ? 'directory'
                                                                              : 'file',
                                                                          {
                                                                              uri: getIn(
                                                                                  s,
                                                                                  ES_PATHS.source
                                                                              ),
                                                                              related: getIn(
                                                                                  s,
                                                                                  ES_PATHS.related
                                                                              ),
                                                                              release_id: getIn(
                                                                                  s,
                                                                                  ES_PATHS.release_id
                                                                              ),
                                                                              size: getIn(
                                                                                  s,
                                                                                  ES_PATHS.archive
                                                                                      .size
                                                                              ),
                                                                          }
                                                                      )
                                                                  )

                                                                  dispatch(
                                                                      setSnackBarText(
                                                                          'Added to Cart!',
                                                                          'success'
                                                                      )
                                                                  )
                                                              }}
                                                          >
                                                              <AddShoppingCartIcon size="small" />
                                                          </IconButton>
                                                      </Tooltip>
                                                  </div>
                                              </div>
                                          </li>
                                      )
                                  })}
                        </ul>
                    ) : null}
                </div>
                <div className={c.footer}>
                    <div>{isMobile ? mainPath : null}</div>
                    <div>
                        {content != null ? (
                            <React.Fragment>
                                {total} item
                                {total === 1 ? '' : 's'}
                            </React.Fragment>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

let slideTimeout

const Columns = (props) => {
    const {
        isMobile,
        sort,
        slideToRight,
        forceNColumns,
        setSort,
        setShowMobilePreview,
        hasModalOver,
    } = props

    const c = useStyles()

    const dispatch = useDispatch()

    const columnsRef = useRef()

    const columns = useSelector((state) => {
        const cols = state.get('columns')
        return typeof cols.toJS === 'function' ? [] : cols
    })
    const lastFilexFilterDoc = useSelector((state) => {
        return state.get('lastFilexFilterDoc')
    })

    const [showFilterColumns, setShowFilterColumns] = useState(true)
    const [mobileActiveColumnIndex, setMobileActiveColumnIndex] = useState(0)

    // Make sure we always have at least one column
    useEffect(() => {
        const url = new Url(window.location, true)
        if (columns.length === 0) {
            let mission = null
            let spacecraft = null
            if (url.query.uri != null) {
                mission = getIn(url.query, [ES_PATHS.archive.mission.join('.')])
                spacecraft = getIn(url.query, [ES_PATHS.archive.spacecraft.join('.')])
            }

            // type, sort, fields, value, active, isLast, cb
            dispatch(
                addFilexColumn(
                    'filter',
                    'az',
                    [
                        { display_name: 'Missions', value: ES_PATHS.archive.mission.join('.') },
                        {
                            display_name: 'Spacecraft',
                            value: ES_PATHS.archive.spacecraft.join('.'),
                        },
                    ],
                    spacecraft != null
                        ? ES_PATHS.archive.spacecraft.join('.')
                        : ES_PATHS.archive.mission.join('.'),
                    spacecraft != null
                        ? { key: spacecraft }
                        : mission != null
                        ? { key: mission }
                        : null
                )
            )
            // Set the value if one came from the url
            const nextActive =
                spacecraft != null
                    ? { active: { key: spacecraft } }
                    : mission != null
                    ? { active: { key: mission } }
                    : null
            if (nextActive) dispatch(updateFilexColumn(0, nextActive, false, true))
        }
        if ((isMobile || forceNColumns > 0) && columns.length - 1 > mobileActiveColumnIndex) {
            // Find the first column without an active element
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].active == null) {
                    if (mobileActiveColumnIndex < i) setMobileActiveColumnIndex(i)
                    break
                }
            }
        }
    }, [columns])

    // Slide to column on new column load
    useEffect(() => {
        if (!isMobile && columns[columns.length - 1]?.results != null) {
            clearTimeout(slideTimeout)
            slideTimeout = setTimeout(() => {
                if (slideToRight) slideToRight()
            }, 750)
        }
    }, [
        columns.length,
        columns[columns.length - 1] != null ? columns[columns.length - 1].results : [],
    ])

    //Sort by A-Z first
    columns.forEach((c) => {
        if (c.results != null && c.type === 'directory')
            c.results.sort((a, b) =>
                a._source?.archive?.name.localeCompare(b._source?.archive?.name)
            )
        else if (c.results?.buckets != null && c.type != 'directory')
            c.results.buckets.sort((a, b) => a.key.localeCompare(b.key))
    })

    switch (sort) {
        case 'Z-A':
            columns.forEach((c) => {
                if (c.results != null) {
                    if (c.type === 'directory') c.results.reverse()
                    else c.results.buckets.reverse()
                }
            })
            break
        case 'Folders':
            columns.forEach((c) => {
                if (c.results != null && c.type === 'directory') {
                    c.results.sort((a, b) =>
                        b._source?.archive?.fs_type === 'file' &&
                        a._source?.archive?.fs_type === 'directory'
                            ? -1
                            : 0
                    )
                }
            })
            break
        case 'Files':
            columns.forEach((c) => {
                if (c.results != null && c.type === 'directory') {
                    c.results.sort((a, b) =>
                        a._source?.archive?.fs_type === 'file' &&
                        b._source?.archive?.fs_type === 'directory'
                            ? -1
                            : 0
                    )
                }
            })
            break
        default:
            //A-Z is default
            break
    }

    const setMobileIndex = (idx) => {
        let maxAllowedColumnIndex = 0
        for (let i = 0; i < columns.length; i++) {
            maxAllowedColumnIndex = i
            if (columns[i].active == null) {
                break
            }
        }
        if (idx <= maxAllowedColumnIndex && idx >= 0) setMobileActiveColumnIndex(idx)
    }
    const mobileBack = () => {
        if (mobileActiveColumnIndex > 0) setMobileActiveColumnIndex(mobileActiveColumnIndex - 1)
    }
    const mobileForward = () => {
        let maxAllowedColumnIndex = 0
        for (let i = 0; i < columns.length; i++) {
            maxAllowedColumnIndex = i
            if (columns[i].active == null) {
                break
            }
        }
        if (mobileActiveColumnIndex < maxAllowedColumnIndex)
            setMobileActiveColumnIndex(mobileActiveColumnIndex + 1)
    }

    let prevTitleNames = []

    return (
        <div
            className={clsx(c.Columns, {
                [c.columnsMobile]: isMobile,
                [c.hasModalOver]: hasModalOver,
            })}
            ref={columnsRef}
        >
            {isMobile ? (
                <>
                    <ViewSlider
                        renderView={({ index, active, transitionState }) => {
                            return (
                                <>
                                    {columns[index] ? (
                                        <Column
                                            columnId={index}
                                            numCols={columns.length}
                                            params={columns[index]}
                                            prevColumn={index > 0 ? columns[index - 1] : null}
                                            isMobile={true}
                                            mobileBack={mobileBack}
                                            mobileForward={mobileForward}
                                            sort={sort}
                                            setSort={setSort}
                                            setShowMobilePreview={setShowMobilePreview}
                                            pds_standard={getIn(
                                                lastFilexFilterDoc,
                                                ES_PATHS.archive.pds_standard
                                            )}
                                        />
                                    ) : null}
                                </>
                            )
                        }}
                        className={c.viewSlider}
                        numViews={columns.length}
                        activeView={mobileActiveColumnIndex}
                        animateHeight={false}
                        fillParent={true}
                        transitionDuration={300}
                        viewportClassName={c.viewSliderViewport}
                        transitionTimingFunction="cubic-bezier(0.12, 0, 0.39, 0)"
                    />
                    <div className={c.sliderPosition}>
                        {[...Array(40).keys()].map((v) => (
                            <div
                                key={v}
                                style={{
                                    width: `${v >= columns.length ? 0 : 100 / columns.length}%`,
                                    padding: v >= columns.length ? 0 : '10px 4px',
                                }}
                                className={clsx({
                                    [c.positionInactive]: v !== mobileActiveColumnIndex,
                                    [c.positionActive]: v === mobileActiveColumnIndex,
                                })}
                                onClick={() => {
                                    setMobileIndex(v)
                                }}
                            >
                                <div></div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {columns.map((column, idx) => {
                        const prevColumn = idx > 0 ? columns[idx - 1] : null
                        // Collapse column if it's not the end and only have one item
                        const r = getIn(column, 'results', [])
                        let prevNames
                        if (
                            column.type === 'directory' &&
                            r.length === 1 &&
                            idx != columns.length - 1
                        ) {
                            prevTitleNames.push({
                                title: prevColumn?.active?.key,
                                name: r?.[0]?._source?.archive?.name,
                            })
                            prevNames = prevTitleNames
                            // Now need to render column if the next one is collapsing the same way
                            if (
                                idx + 1 != columns.length - 1 &&
                                columns[idx + 1].type === 'directory' &&
                                getIn(columns[idx + 1], 'results', []).length === 1
                            ) {
                                return null
                            }
                        } else {
                            prevTitleNames = []
                        }
                        if (
                            !forceNColumns ||
                            (idx > mobileActiveColumnIndex - forceNColumns &&
                                idx <= mobileActiveColumnIndex)
                        )
                            return (
                                <React.Fragment key={idx}>
                                    <Column
                                        columnId={idx}
                                        params={column}
                                        prevColumn={prevColumn}
                                        prevNames={prevNames}
                                        numCols={columns.length}
                                        isMobile={isMobile}
                                        mobileBack={mobileBack}
                                        mobileForward={mobileForward}
                                        setShowFilterColumns={setShowFilterColumns}
                                        showFilterColumns={showFilterColumns}
                                        isTablet={forceNColumns > 0}
                                        forceBackArrow={
                                            forceNColumns > 0 &&
                                            idx == mobileActiveColumnIndex - forceNColumns + 1
                                        }
                                        pds_standard={getIn(
                                            lastFilexFilterDoc,
                                            ES_PATHS.archive.pds_standard
                                        )}
                                    />
                                </React.Fragment>
                            )
                    })}
                    {forceNColumns > 0 && (
                        <div className={clsx(c.sliderPosition, c.sliderPositionTablet)}>
                            {[...Array(40).keys()].map((v) => (
                                <div
                                    key={v}
                                    style={{
                                        width: `${v >= columns.length ? 0 : 100 / columns.length}%`,
                                        padding: v >= columns.length ? 0 : '10px 4px',
                                    }}
                                    className={clsx({
                                        [c.positionInactive]: v !== mobileActiveColumnIndex,
                                        [c.positionActive]: v === mobileActiveColumnIndex,
                                    })}
                                    onClick={() => {
                                        setMobileIndex(v)
                                    }}
                                >
                                    <div></div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {!isMobile && columns && columns.length === 1 && (
                <div>
                    <div className={c.introMessage}>
                        <span></span>
                        <div>Select a mission to begin browsing our data archive.</div>
                    </div>
                </div>
            )}
        </div>
    )
}

Columns.propTypes = { sort: PropTypes.string }

export default Columns
