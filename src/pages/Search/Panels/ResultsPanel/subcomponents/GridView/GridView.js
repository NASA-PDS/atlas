import React, { useState, useEffect, useRef } from 'react'
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
} from '../../../../../../core/redux/actions/actions.js'
import { sAKeys, sASet } from '../../../../../../core/redux/actions/subscribableActions.js'
import { getIn, getPDSUrl, getExtension } from '../../../../../../core/utils.js'

import ProductToolbar from '../../../../../../components/ProductToolbar/ProductToolbar'
import ProductIcons from '../../../../../../components/ProductIcons/ProductIcons'

const gridItemGap = 10

const useStyles = makeStyles((theme) => ({
    GridView: {
        width: '100%',
        height: '100%',
        padding: `${gridItemGap}px 0px 0px ${gridItemGap}px`,
        boxSizing: 'border-box',
    },
    content: {
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        opacity: 0,
        transition: 'opacity 0.4s ease-in-out',
    },
    contentVisible: {
        opacity: 1,
    },
    contentNone: {},
    gridItem: {
        'cursor': 'pointer',
        'box-shadow': '0 1px 5px rgba(0, 0, 0, 0.5)',
        'user-select': 'none',
        'line-height': '0',
        'overflow': 'hidden',
        'align-items': 'center',
        'justify-content': 'center',
        'display': 'flex',
        'box-sizing': 'border-box',
        'border-radius': '3px',
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
    },
    gridItemToolbar: {
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
        transition: 'box-shadow 0.2s ease-out',
    },
    fileExt: {
        right: '0px',
        bottom: '0px',
        position: 'absolute',
        background: theme.palette.swatches.grey.grey800,
        borderRadius: '2px',
        textTransform: 'uppercase',
        height: '16px',
        lineHeight: '16px',
        color: theme.palette.swatches.grey.grey200,
        padding: '0px 4px',
        margin: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
    },
    hasML: {
        left: '0px',
        bottom: '0px',
        position: 'absolute',
        background: theme.palette.swatches.orange.orange600,
        borderRadius: '2px',
        textTransform: 'uppercase',
        height: '16px',
        lineHeight: '16px',
        color: theme.palette.swatches.grey.grey800,
        padding: '0px 4px',
        margin: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
    },
}))

let lastPage = null
let itemLength = 0
let nextRenderAllowPageCheck = false
let allowPageCheck = true

const GridView = (props) => {
    const { results, paging } = props

    const c = useStyles()
    const dispatch = useDispatch()

    const gridItemHeight = useSelector((state) => state.getIn(['gridSize'])) || 192

    const resultsPerPage = paging.resultsPerPage

    if (nextRenderAllowPageCheck) {
        nextRenderAllowPageCheck = false
        allowPageCheck = true
    }

    // We need this otherwise we might query multiple pages when we reach the end
    // (because the next page has yet to load)
    if (itemLength != results.length) nextRenderAllowPageCheck = true
    itemLength = results.length

    const gridContainerRef = useRef(null)
    const { width, height, ref } = useResizeDetector()
    const { widthR, heightR } = useSize(gridContainerRef)
    const positioner = usePositioner(
        {
            width: Math.max(width - gridItemGap - 2, 0),
            columnWidth: gridItemHeight,
            columnGutter: gridItemGap,
        },
        [paging.activePages[0], gridItemHeight]
    )

    const { scrollTop, isScrolling } = useScroller(gridContainerRef, 2)
    const resizeObserver = useResizeObserver(positioner, [gridItemHeight])
    const scrollToIndex = useScrollToIndex(positioner, {
        element: gridContainerRef,
        height,
        offset: 0,
        align: 'top',
    })

    // On mount, if the user is coming from another view and has scroll to
    // some position in it, scroll to that same item
    useEffect(() => {
        const resultViewIndex = getResultViewIndex()
        if (resultViewIndex != 0 && results[resultViewIndex]) {
            // scrollToIndex hates the number 0
            scrollToIndex(resultViewIndex)
        }
    }, [gridItemHeight])

    // Every time our scroll position changes, update the ideal result view index
    // in case the user switches views
    useEffect(() => {
        // Does the current page match the page we expect from scroll?
        // Hmm, let's do this by looking at all the current masonry divs
        let masonryItems = [...document.getElementsByClassName('GridViewMasonryItem')]
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

    // Load more. If we're near enough to the edge of one page, preload the next
    useEffect(() => {
        const masonryElm = document.getElementById('GridViewMasonry')

        if (allowPageCheck && masonryElm) {
            // Load More on scroll
            const masonryHeight = masonryElm.getBoundingClientRect().height
            if (masonryHeight > 0) {
                const pxFromTop = scrollTop
                const pxFromBottom = masonryHeight - (scrollTop + height)

                if (pxFromBottom < gridItemHeight * 2) {
                    dispatch(search(parseInt(results.length / resultsPerPage)))
                    allowPageCheck = false
                }
            }
        }
    })

    return (
        <div className={`${c.GridView} fade-in`} ref={ref}>
            <div
                className={`${c.content} ${results.length > 0 ? c.contentVisible : c.contentNone}`}
                id="GridViewContent"
                ref={gridContainerRef}
            >
                {useMasonry({
                    id: 'GridViewMasonry',
                    positioner,
                    resizeObserver,
                    items: results.length > 0 ? results : [],
                    height,
                    scrollTop,
                    isScrolling,
                    overscanBy: 2,
                    render: GridCard,
                })}
            </div>
        </div>
    )
}

const GridCard = ({ index, data, width }) => {
    const c = useStyles()

    const dispatch = useDispatch()

    // let's change pages by updating the history
    const history = useHistory()
    const s = data._source

    const gridItemHeight = useSelector((state) => state.getIn(['gridSize'])) || 170

    const release_id = getIn(s, ES_PATHS.release_id)

    const thumb_id = getIn(s, ES_PATHS.thumb)

    const imgURL = getPDSUrl(
        thumb_id,
        release_id,
        gridItemHeight < 140 ? AVAILABLE_URI_SIZES.xs : AVAILABLE_URI_SIZES.sm
    )

    const fileName = getIn(s, ES_PATHS.file_name, '')

    return (
        <div
            // Index relative to current pages
            result-id={index}
            // Key relative to all pages
            result-key={data.result_key}
            className={`${c.gridItem} GridViewMasonryItem`}
            style={{
                minHeight: `${gridItemHeight}px`,
                maxHeight: `${gridItemHeight}px`,
            }}
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
            <LazyLoad offset={600} once>
                <Image
                    className={`${c.gridItemImage} ResultsPanelImage`}
                    style={{
                        height: '100%',
                        paddingTop: 'unset',
                        background: '#192028',
                        position: 'initial',
                    }}
                    imageStyle={{
                        transition:
                            'filterBrightness 900ms cubic-bezier(0.4, 0, 0.2, 1) 0s, filterSaturate 1200ms cubic-bezier(0.4, 0, 0.2, 1) 0s, opacity 600ms cubic-bezier(0.4, 0, 0.2, 1) 0s, transform 0.15s ease-out 0s',
                        transform: `rotateZ(${window.atlasGlobal.imageRotation}deg)`,
                        height: `${gridItemHeight}px`,
                    }}
                    disableSpinner={true}
                    animationDuration={1200}
                    iconContainerStyle={{ opacity: 0.6 }}
                    src={IMAGE_EXTENSIONS.includes(getExtension(imgURL, true)) ? imgURL : 'null'}
                    alt={fileName}
                    errorIcon={<ProductIcons filename={fileName} />}
                />
            </LazyLoad>
            <ProductToolbar result={data} />
            <div className={c.fileExt}>{getExtension(fileName, true)}</div>
            {getIn(s, ES_PATHS.ml, false) ? <div className={c.hasML}>ML</div> : null}
            <div className={`${c.selectionIndicator} selectionIndicator`}></div>
        </div>
    )
}

GridView.propTypes = {}

export default GridView
