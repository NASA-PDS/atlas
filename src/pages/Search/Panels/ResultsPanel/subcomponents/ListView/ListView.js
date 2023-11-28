import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { useLocation, useHistory } from 'react-router-dom'
import {
    HASH_PATHS,
    ES_PATHS,
    AVAILABLE_URI_SIZES,
    IMAGE_EXTENSIONS,
} from '../../../../../../core/constants'

import { useResizeDetector } from 'react-resize-detector'
import { useSize, useScroller } from 'mini-virtual-list'
import {
    usePositioner,
    useResizeObserver,
    useMasonry,
    useInfiniteLoader,
    useScrollToIndex,
} from 'masonic'

import clsx from 'clsx'
import LazyLoad from 'react-lazy-load'
import Image from 'material-ui-image'

import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'

import {
    search,
    getResultViewIndex,
    setResultViewIndex,
    checkItemInResults,
} from '../../../../../../core/redux/actions/actions.js'
import { sAKeys, sASet } from '../../../../../../core/redux/actions/subscribableActions.js'
import { getIn, getPDSUrl, getExtension } from '../../../../../../core/utils.js'

import ProductToolbar from '../../../../../../components/ProductToolbar/ProductToolbar'
import ProductIcons from '../../../../../../components/ProductIcons/ProductIcons'

const listItemHeight = 200
const listItemWidth = 370
const listItemGap = 10

const useStyles = makeStyles((theme) => ({
    ListView: {
        width: '100%',
        height: '100%',
        padding: `${listItemGap}px 0px 0px ${listItemGap}px`,
        boxSizing: 'border-box',
    },
    content: {
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    listItem: {
        'cursor': 'pointer',
        'box-shadow': '0 1px 5px rgba(0, 0, 0, 0.5)',
        'min-height': `${listItemHeight}px`,
        'max-height': `${listItemHeight}px`,
        'overflow': 'hidden',
        'justify-content': 'space-between',
        'display': 'flex',
        'box-sizing': 'border-box',
        'border-radius': '3px',
        'position': 'relative',
        'width': '100%',
        'background': `linear-gradient(to bottom, #060606, ${theme.palette.swatches.black.black0}) !important`,
        '&:hover .selectionIndicator': {
            boxShadow: `inset 0px 0px 0px 4px ${theme.palette.swatches.blue.blue800}`,
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
    },
    listItemLeft: {
        position: 'relative',
        width: '200px',
        height: '200px',
    },
    listItemRight: {
        flex: 1,
        padding: `${listItemGap}px`,
        overflowY: 'auto',
        background: theme.palette.secondary.main,
    },
    listItemImage: {
        'opacity': 1,
        'object-fit': 'cover !important',
        'user-select': 'none',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'image-rendering': 'pixelated',
        'width': `${listItemHeight}px !important`,
        'height': `${listItemHeight}px !important`,
        'transition': 'all 0.2s ease-in',
        'position': 'static !important',
        'background': `linear-gradient(to bottom, #060606, ${theme.palette.swatches.black.black0}) !important`,
    },
    listItemTitle: {
        fontSize: '14px',
        lineHeight: '20px',
        color: theme.palette.swatches.yellow.yellow500,
        wordBreak: 'break-all',
    },
    listItemTime: {
        fontSize: '12px',
        lineHeight: '14px',
        color: theme.palette.swatches.grey.grey300,
        marginBottom: theme.spacing(2),
    },
    listItemProperty: {
        'marginBottom': theme.spacing(1),
        '& > div:first-child': {
            fontSize: '12px',
            lineHeight: '14px',
            color: theme.palette.swatches.grey.grey200,
        },
        '& > div:last-child': {
            fontSize: '14px',
            height: '20px',
            lineHeight: '20px',
            color: theme.palette.text.secondary,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
    },
    listItemToolbar: {
        'position': 'absolute',
        'bottom': 0,
        'left': 0,
        'width': '100%',
        'background': 'rgba(0, 0, 0, 0.5)',
        'line-height': '30px',
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'word-break': 'unset',
        'font-size': '14px',
        'text-align': 'center',
    },
    selectionIndicator: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
}))

let page = 0
let itemLength = 0
let nextRenderAllowPageCheck = false
let allowPageCheck = true

const ListView = (props) => {
    const { results, paging } = props

    const c = useStyles()
    const dispatch = useDispatch()

    const resultsPerPage = paging.resultsPerPage

    if (nextRenderAllowPageCheck) {
        nextRenderAllowPageCheck = false
        allowPageCheck = true
    }

    let resultKeys = Object.keys(results)

    const items = resultKeys.map((key) => results[key])
    // We need tis otherwise we might query multiple pages when we reach the end
    // (because the next page has yet to load)
    if (itemLength != items.length) nextRenderAllowPageCheck = true
    itemLength = items.length

    const listContainerRef = React.useRef(null)

    const { width, height, ref } = useResizeDetector()

    // In this example we are deriving the height and width properties
    // from a hook that measures the offsetWidth and offsetHeight of
    // the scrollable div.
    //
    // The code for this hook can be found here:
    // https://github.com/jaredLunde/mini-virtual-list/blob/5791a19581e25919858c43c37a2ff0eabaf09bfe/src/index.tsx#L376
    const { widthR, heightR } = useSize(listContainerRef)
    // Likewise, we are tracking scroll position and whether or not
    // the element is scrolling using the element, rather than the
    // window.
    //
    // The code for this hook can be found here:
    // https://github.com/jaredLunde/mini-virtual-list/blob/5791a19581e25919858c43c37a2ff0eabaf09bfe/src/index.tsx#L414
    const { scrollTop, isScrolling } = useScroller(listContainerRef)
    const positioner = usePositioner(
        {
            width: Math.max(width - listItemGap * 2, 0),
            columnWidth: listItemWidth,
            columnGutter: listItemGap,
        },
        [paging.activePages[0]]
    )
    const resizeObserver = useResizeObserver(positioner)
    const scrollToIndex = useScrollToIndex(positioner, {
        element: listContainerRef,
        height,
        offset: 0,
        align: 'top',
    })

    // On mount, if the user is coming from another view and has scroll to
    // some position in it, scroll to that same item
    useEffect(() => {
        const resultViewIndex = getResultViewIndex()
        if (resultViewIndex != 0 && results[resultViewIndex]) {
            scrollToIndex(resultViewIndex)
        }
    }, [])

    // Every time our scroll position changes, update the ideal result view index
    // in case the user switches views
    useEffect(() => {
        // Does the current page match the page we expect from scroll?
        // Hmm, let's do this by looking at all the current masonry divs
        let masonryItems = [...document.getElementsByClassName('ListViewMasonryItem')]
        if (masonryItems.length > 0) {
            // order them by their result-key attribute
            masonryItems = masonryItems.sort(
                (a, b) =>
                    parseInt(a.getAttribute('result-key')) - parseInt(b.getAttribute('result-key'))
            )
            const middleItem = masonryItems[Math.round(masonryItems.length / 2 - 1)]
            let currentResultViewIndex = Math.max(
                0,
                parseInt(middleItem.getAttribute('result-key')) - 1
            )
            // Don't be fancy if we're still on the first visible page portion
            if (currentResultViewIndex < resultsPerPage / 2) currentResultViewIndex = 0
            if (results[currentResultViewIndex]) {
                setResultViewIndex(currentResultViewIndex)
            }
        }
    }, [scrollTop])

    // Load More
    useEffect(() => {
        const masonryElm = document.getElementById('ListViewMasonry')

        if (allowPageCheck && masonryElm) {
            // Load More on scroll
            const masonryHeight = masonryElm.getBoundingClientRect().height
            if (masonryHeight > 0) {
                const pxFromTop = scrollTop
                const pxFromBottom = masonryHeight - (scrollTop + height)

                if (pxFromBottom < listItemHeight * 2) {
                    dispatch(search(parseInt(results.length / resultsPerPage)))
                    allowPageCheck = false
                }
            }
        }
    })

    return (
        <div className={`${c.ListView} fade-in`} ref={ref}>
            <div className={c.content} id="ListViewContent" ref={listContainerRef}>
                {useMasonry({
                    id: 'ListViewMasonry',
                    positioner,
                    resizeObserver,
                    items: results.length > 0 ? results : [],
                    height,
                    scrollTop,
                    isScrolling,
                    overscanBy: 6,
                    render: ListCard,
                })}
            </div>
        </div>
    )
}

const ListCard = ({ index, data, width }) => {
    const c = useStyles()
    const s = data._source

    const dispatch = useDispatch()
    const history = useHistory()

    const release_id = getIn(s, ES_PATHS.release_id)

    const thumb_id = getIn(s, ES_PATHS.thumb)

    const imgURL = getPDSUrl(thumb_id, release_id, AVAILABLE_URI_SIZES.sm)

    const fileName = getIn(s, ES_PATHS.file_name, '')

    return (
        <div
            // Index relative to current pages
            result-id={index}
            // Key relative to all pages
            result-key={data.result_key}
            className={c.listItem}
            onClick={() => {
                history.push(`${HASH_PATHS.record}?uri=${getIn(s, ES_PATHS.source)}`)
            }}
            onMouseEnter={() => {
                sASet(sAKeys.HOVERED_RESULT, data)
            }}
            onMouseLeave={() => {
                sASet(sAKeys.HOVERED_RESULT, null)
            }}
        >
            <div className={c.listItemLeft}>
                <LazyLoad offset={600} once>
                    <Image
                        className={c.listItemImage}
                        style={{
                            height: '100%',
                            paddingTop: 'unset',
                            background: 'linear-gradient(to bottom, #060606, #000000)',
                            position: 'initial',
                        }}
                        disableSpinner={true}
                        animationDuration={1200}
                        iconContainerStyle={{ opacity: 0.6 }}
                        src={
                            IMAGE_EXTENSIONS.includes(getExtension(imgURL, true)) ? imgURL : 'null'
                        }
                        alt={fileName}
                        errorIcon={<ProductIcons filename={fileName} />}
                    />
                </LazyLoad>
                <ProductToolbar result={data} />
            </div>
            <div className={c.listItemRight}>
                <div className={c.listItemTitle}>{getIn(s, ES_PATHS.file_name)}</div>
                <div className={c.listItemTime}>{getIn(s, ES_PATHS.start_time)}</div>

                <div className={c.listItemProperty}>
                    <div>Mission/Spacecraft:</div>
                    <div>
                        {getIn(s, ES_PATHS.mission)}/{getIn(s, ES_PATHS.spacecraft)}
                    </div>
                </div>
                <div className={c.listItemProperty}>
                    <div>Targets:</div>
                    <div>{getIn(s, ES_PATHS.target, []).join(', ')}</div>
                </div>
                <div className={c.listItemProperty}>
                    <div>Instrument:</div>
                    <div>{getIn(s, ES_PATHS.instrument)}</div>
                </div>
            </div>
            <div className={`${c.selectionIndicator} selectionIndicator`}></div>
        </div>
    )
}

ListView.propTypes = {}

export default ListView
