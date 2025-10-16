import React, { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
    HASH_PATHS,
    AVAILABLE_URI_SIZES,
    ES_PATHS,
    MODEL_EXTENSIONS,
} from '../../../../core/constants'

import clsx from 'clsx'

import { useResizeDetector } from 'react-resize-detector'
import { useScroller } from 'mini-virtual-list'
import {
    usePositioner,
    useResizeObserver,
    useMasonry,
    useInfiniteLoader,
    useScrollToIndex,
} from 'masonic'

import Image from 'mui-image'

import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FolderIcon from '@mui/icons-material/Folder'
import ImageIcon from '@mui/icons-material/Image'

import { setRecordData, setSnackBarText } from '../../../../core/redux/actions/actions'

import {
    getIn,
    getPDSUrl,
    getFilename,
    getExtension,
    abbreviateNumber,
    copyToClipboard,
} from '../../../../core/utils.js'

import ProductToolbar from '../../../../components/ProductToolbar/ProductToolbar'
import ProductIcons from '../../../../components/ProductIcons/ProductIcons'

const gridItemHeight = 170
const gridItemGap = 10

const useStyles = makeStyles((theme) => ({
    CartView: {
        width: '100%',
        height: '100%',
        padding: `${gridItemGap}px 0px 0px ${gridItemGap}px`,
        boxSizing: 'border-box',
        position: 'relative',
        background: theme.palette.swatches.grey.grey100,
    },
    content: {
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    gridItem: {
        'cursor': 'pointer',
        //'box-shadow': '0 1px 5px rgba(0, 0, 0, 0.5)',
        'user-select': 'none',
        'line-height': '0',
        'min-height': `${gridItemHeight}px`,
        'max-height': `${gridItemHeight}px`,
        'overflow': 'hidden',
        'align-items': 'center',
        'justify-content': 'center',
        'display': 'flex',
        'box-sizing': 'border-box',
        'border-radius': '4px',
        'position': 'relative',
        'width': '100%',
        'background': `linear-gradient(to bottom, #060606, ${theme.palette.swatches.black.black0})`,
        '&:hover .selectionIndicator': {
            boxShadow: `inset 0px 0px 0px 4px ${theme.palette.accent.main}`,
        },
        '&:hover .ProductToolbar': {
            'opacity': 1,
            '& .ProductToolbarInner': {
                display: 'flex',
            },
            '& .ProductToolbarInCart': {
                opacity: 0,
            },
        },
        '& .mui-image-wrapper': {
            height: '100%',
            paddingTop: 'unset',
            background: '#192028',
        },
    },
    gridItemDirectory: {
        '& svg': {
            marginTop: '26px',
            fontSize: '194px',
        },
    },
    gridItemFile: {
        '& svg': {
            marginTop: '26px',
            fontSize: '153px',
        },
    },
    gridItemImage: {
        'opacity': 1,
        'background': theme.palette.swatches.black.black0,
        'object-fit': 'cover !important',
        'user-select': 'none',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'image-rendering': 'pixelated',
        'width': '100%',
        'height': `${gridItemHeight}px`,
    },
    name: {
        color: theme.palette.text.secondary,
        borderRadius: '3px',
        bottom: '56px',
        height: '20px',
        padding: '0px 5px',
        boxSizing: 'inherit',
        fontSize: '14px',
        lineHeight: '21px',
        position: 'absolute',
        background: theme.palette.swatches.grey.grey700,
        pointerEvents: 'none',
        maxWidth: '100%',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    nameRegex: {
        padding: '7px',
        color: theme.palette.text.secondary,
        fontFamily: 'monospace',
        overflow: 'hidden',
        position: 'absolute',
        fontSize: '14px',
        maxWidth: '100%',
        lineHeight: '21px',
        whiteSpace: 'normal',
        borderRadius: '3px',
        wordBreak: 'break-all',
        textOverflow: 'ellipsis',
        pointerEvents: 'none',
        maxHeight: '102px',
    },
    titleRegex: {
        position: 'absolute',
        top: '18px',
        left: '0px',
        width: '100%',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'darkgoldenrod',
    },
    info: {
        color: theme.palette.text.secondary,
        position: 'absolute',
        bottom: '5px',
        left: '5px',
        mixBlendMode: 'difference',
    },
    selectionIndicator: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        transition: 'box-shadow 0.2s ease-out',
    },
    queryCount: {
        'zIndex': 2,
        'position': 'absolute',
        'right': '7px',
        'bottom': '7px',
        'fontSize': '12px',
        'height': '22px',
        'lineHeight': '22px',
        'padding': '0px 6px',
        'fontWeight': 'bold',
        'borderRadius': '3px',
        'color': theme.palette.text.secondary,
        'background': theme.palette.accent.main,
        'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.25)',
    },
    emptyContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        width: '30%',
        minWidth: '300px',
        padding: theme.spacing(4),
    },
    emptyMessage: {
        width: '100%',
        textAlign: 'center',
        fontSize: '20px',
        marginBottom: theme.spacing(1),
    },
    emptyButtons: {
        display: 'flex',
        justifyContent: 'center',
    },
    button1: {
        height: 30,
        margin: '7px 3px',
        background: theme.palette.primary.light,
    },
    noBackground: {
        background: 'none',
    },
    errorIcon: {
        fontSize: '42px',
    },
}))

const CartView = (props) => {
    const c = useStyles()

    const navigate = useNavigate()

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })

    const gridContainerRef = useRef(null)
    const { width, height, ref } = useResizeDetector()
    const positioner = usePositioner(
        {
            width: Math.max(width - gridItemGap, 0),
            columnWidth: gridItemHeight,
            columnGutter: gridItemGap,
        },
        [cart.length]
    )

    const { scrollTop, isScrolling } = useScroller(gridContainerRef, 2)
    const resizeObserver = useResizeObserver(positioner)
    const scrollToIndex = useScrollToIndex(positioner, {
        element: gridContainerRef,
        height,
        offset: 0,
        align: 'top',
    })

    return (
        <div className={`${c.CartView} fade-in`} ref={ref}>
            <div className={c.content} id="CartViewContent" ref={gridContainerRef}>
                {useMasonry({
                    id: 'CartViewMasonry',
                    positioner,
                    resizeObserver,
                    items: cart.length > 0 ? cart : [],
                    height,
                    scrollTop,
                    isScrolling,
                    overscanBy: 3,
                    render: GridCard,
                })}
            </div>
            {cart.length == 0 ? (
                <div className={c.emptyContainer}>
                    <Typography className={c.emptyMessage} variant="h3">
                        Your Cart's Empty
                    </Typography>
                    <div className={c.emptyButtons}>
                        <Button
                            className={c.button1}
                            variant="contained"
                            aria-label="search images button"
                            size="small"
                            onClick={() => {
                                navigate(HASH_PATHS.search)
                            }}
                        >
                            Search Images
                        </Button>

                        <Button
                            className={c.button1}
                            variant="contained"
                            aria-label="search files button"
                            size="small"
                            onClick={() => {
                                navigate(HASH_PATHS.fileExplorer)
                            }}
                        >
                            Search Files
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

const GridCard = ({ index, data, width }) => {
    const c = useStyles()

    const dispatch = useDispatch()
    const navigate = useNavigate()
    data.item = data.item || {}

    let images
    if (data.type === 'query' || data.type === 'image') {
        images = data.type === 'query' ? data.item.images || [] : [data.item.related?.browse?.uri]
    }

    const imgAlt =
        data.type === 'query' ? 'Collection of images' : getFilename(getIn(data, 'item.uri', ''))

    let title
    if (data.type === 'query' || data.type === 'regex')
        title = JSON.stringify(data.item.query, null, 1)
    else title = data.item.uri

    const release_id = getIn(data, 'item.release_id', null)
    return (
        <div
            cart-index={index}
            key={index}
            className={clsx(c.gridItem, 'CartViewMasonryItem', {
                [c.noBackground]: data.type === 'directory' || data.type === 'file',
            })}
            style={data.type === 'query' ? { background: 'none' } : null}
            onClick={() => {
                if (data.item?.uri) {
                    // force a uri query
                    dispatch(setRecordData({}))
                    navigate(`${HASH_PATHS.record}?uri=${data.item?.uri}`)
                }
            }}
        >
            {data.type === 'directory' ? (
                <div className={c.gridItemDirectory}>
                    <FolderIcon />
                </div>
            ) : null}
            {data.type === 'file' ? (
                <div className={c.gridItemFile}>
                    <InsertDriveFileOutlinedIcon />
                </div>
            ) : null}
            {images &&
                images.map((image, idx) => {
                    const imgURL = getPDSUrl(image, release_id, AVAILABLE_URI_SIZES.sm)
                    return (
                        <>
                            <Image
                                className={c.gridItemImage}
                                style={
                                    data.type === 'query'
                                        ? {
                                              left: `-${idx * 16}px`,
                                              borderRight: '1px solid #FFF',
                                              top: `${(data.item.images.length - (idx + 1)) * 3}px`,
                                              height: `calc(100% - ${
                                                  (images.length - (idx + 1)) * 3 * 2
                                              }px)`,
                                              boxShadow: '0 1px 5px rgba(0,0,0,0.5)',
                                          }
                                        : null
                                }
                                shiftDuration={1200}
                                iconWrapperStyle={{ opacity: 0.6 }}
                                errorIcon={<ProductIcons filename={imgURL} />}
                                src={imgURL || ''}
                                alt={imgAlt}
                                loading="lazy"
                            />

                            {MODEL_EXTENSIONS.includes(getExtension(imgURL, true)) && (
                                <ProductIcons filename={imgURL} />
                            )}
                        </>
                    )
                })}
            {data.item.total ? (
                <div className={c.queryCount}>{`${abbreviateNumber(data.item.total)}`}</div>
            ) : null}
            <ProductToolbar result={data} isCart={true} cartIndex={index} />
            {data.type === 'directory' || data.type === 'file' ? (
                <div className={c.name}>{`${getFilename(data.item?.uri)}${
                    data.type === 'directory' ? '/' : ''
                }`}</div>
            ) : null}
            {data.type === 'regex' ? (
                <>
                    <div className={c.titleRegex}>{`RegEx`}</div>
                    <div className={c.nameRegex}>{`${getIn(data.item, [
                        'query',
                        'bool',
                        'must',
                        '0',
                        'regexp',
                        'uri',
                        'value',
                    ])}`}</div>
                </>
            ) : null}
            <div className={`${c.selectionIndicator} selectionIndicator`}></div>

            <Tooltip title={<pre style={{ margin: '3px 0px' }}>{title}</pre>} arrow>
                <div
                    className={c.info}
                    onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(title)
                        dispatch(setSnackBarText('Copied Cart Item Info to Clipboard!', 'success'))
                    }}
                >
                    <InfoOutlinedIcon />
                </div>
            </Tooltip>
        </div>
    )
}

CartView.propTypes = {}

export default CartView
