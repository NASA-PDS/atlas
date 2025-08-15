import React from 'react'
import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Heading from './Heading/Heading'
import Columns from './Columns/Columns'
import Preview from './Preview/Preview'

import RegexModal from './Modals/RegexModal/RegexModal'

import MenuButton from '../../components/MenuButton/MenuButton'

import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles } from '@mui/styles'
import { useTheme } from '@mui/material/styles'

import SortIcon from '@mui/icons-material/Sort'

import clsx from 'clsx'
import Draggable from 'react-draggable'

const initialPreviewWidth = 512

const useStyles = makeStyles((theme) => ({
    FileExplorer: {
        width: '100%',
        height: '100%',
        color: theme.palette.text.primary,
    },
    title: {
        color: theme.palette.text.primary,
        lineHeight: `${theme.headHeights[2]}px`,
        fontSize: '16px',
        fontWeight: 500,
        margin: 0,
        padding: `0 ${theme.spacing(3)}px`,
    },
    topMenu: {},
    sort: {
        'color': theme.palette.swatches.grey.grey300,
        'padding': '9px 10px 10px 10px',
        'background': 'rgba(0,0,0,0)',
        'transition': 'background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    content: {
        width: '100%',
        height: `calc(100% - ${theme.headHeights[2] + 1}px)`,
        display: 'flex',
        justifyContent: 'space-between',
        overflow: 'hidden',
        background: theme.palette.swatches.grey.grey150,
        boxShadow: 'inset 0px 1px 2px 0px rgba(0,0,0,0.07)',
    },
    contentTall: {
        height: `calc(100% - 1px)`,
    },
    contentMobile: {
        height: 'calc(100% - 41px)',
        width: '100%',
        position: 'absolute',
        top: '41px',
        left: 0,
    },
    left: {
        'overflowX': 'auto',
        'overflowY': 'hidden',
        'flex': 1,
        'boxShadow': '1px 0px 2px 0px rgba(0,0,0,0.02)',
        'position': 'relative',
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.swatches.grey.grey300,
            boxShadow: `inset 0px 0px 0px 1px ${theme.palette.swatches.grey.grey50}`,
        },
    },
    leftUnderLarge: {
        overflow: 'hidden',
        flex: 1,
    },
    rightWrapper: {
        display: 'flex',
        position: 'relative',
    },
    right: {
        width: `${initialPreviewWidth}px`,
        boxShadow: '-1px 0px 2px 0px rgba(0,0,0,0.07)',
    },
    divider: {
        width: '8px',
        height: '100%',
        cursor: 'col-resize',
        position: 'absolute',
        height: '100%',
        zIndex: 1000,
    },
}))

let slidingRight = false

const FileExplorer = (props) => {

    const c = useStyles()

    const dispatch = useDispatch()

    const slideRef = useRef(null)
    const rightRef = useRef(null)
    const dragRef = useRef(null)

    const mobileWorkspace = useSelector((state) => {
        return state.getIn(['workspace', 'mobile'])
    })

    let [sort, setSort] = useState('Folders')

    let [showMobilePreview, setShowMobilePreview] = useState(false)
    let [forcedPreview, setForcedPreview] = useState(null)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isLarge = useMediaQuery(theme.breakpoints.down('md'))

    const slideToRight = () => {
        if (slidingRight || slideRef == null || slideRef.current == null) return
        else slidingRight = true

        // cancel if already on top
        if (!(slideRef && slideRef.current.scrollWidth > slideRef.current.offsetWidth)) {
            slidingRight = false
            return
        }

        const cosParameter = (slideRef.current.scrollWidth - slideRef.current.offsetWidth) / 2
        let scrollCount = 0,
            oldTimestamp = null,
            duration = Math.max(
                Math.min(3 * (slideRef.current.scrollWidth - slideRef.current.offsetWidth), 1000),
                400
            ) // n ms per pixel to scroll

        function step(newTimestamp) {
            if (oldTimestamp !== null) {
                // if duration is 0 scrollCount will be Infinity
                scrollCount += (Math.PI * (newTimestamp - oldTimestamp)) / duration
                if (scrollCount >= Math.PI) {
                    slideRef.current.scrollLeft =
                        slideRef.current.scrollWidth - slideRef.current.offsetWidth
                    slidingRight = false
                    return
                }
                slideRef.current.scrollLeft = Math.max(
                    slideRef.current.scrollLeft,
                    slideRef.current.scrollWidth -
                        slideRef.current.offsetWidth -
                        (cosParameter + cosParameter * Math.cos(scrollCount))
                )
            }
            oldTimestamp = newTimestamp
            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }

    const setShowMobilePreviewWrapper = (show, forcedPreview) => {
        setShowMobilePreview(show)
        if (show && forcedPreview != null) {
            setForcedPreview(forcedPreview)
        } else setForcedPreview(null)
    }

    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'regex'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })

    // If mobile
    if (isMobile) {
        return (
            <div className={c.FileExplorer}>
                <div className={clsx(c.content, c.contentMobile)}>
                    <Columns
                        isMobile={true}
                        sort={sort}
                        setSort={setSort}
                        setShowMobilePreview={setShowMobilePreviewWrapper}
                    />
                    <RegexModal modal={modal} />
                    <Preview
                        isMobile={true}
                        showMobilePreview={showMobilePreview}
                        setShowMobilePreview={setShowMobilePreviewWrapper}
                        forcedPreview={forcedPreview}
                    />
                </div>
            </div>
        )
    }
    return (
        <div className={c.FileExplorer}>
            <Heading
                hide={modal !== false}
                menuItems={[
                    <MenuButton
                        key={'mI2'}
                        options={['Folders', 'Files', 'A-Z', 'Z-A']}
                        active={sort}
                        buttonComponent={<SortIcon fontSize="inherit" />}
                        title={'Sort'}
                        onChange={(option) => {
                            setSort(option)
                        }}
                    />,
                ]}
            />
            <div className={clsx(c.content, { [c.contentTall]: modal !== false })}>
                <div
                    className={clsx(c.left, { [c.leftUnderLarge]: isLarge && !isMobile })}
                    ref={slideRef}
                >
                    <Columns
                        sort={sort}
                        slideToRight={slideToRight}
                        forceNColumns={isLarge ? 2 : false}
                        hasModalOver={modal != false}
                    />
                    <RegexModal modal={modal} />
                </div>
                <div className={c.rightWrapper}>
                    <Draggable
                        axis="x"
                        defaultPosition={{ x: 0, y: 0 }}
                        position={null}
                        scale={1}
                        onStart={(e) => {}}
                        onDrag={(e, ui) => {
                            if (rightRef && rightRef.current) {
                                const currentWidth = parseInt(
                                    (
                                        rightRef.current.style.width ||
                                        initialPreviewWidth.toString()
                                    ).replace('px', '')
                                )
                                const newWidth =
                                    Math.max(
                                        500,
                                        Math.min(window.innerWidth / 2, currentWidth - ui.deltaX)
                                    ) + 'px'
                                rightRef.current.style.width = newWidth
                            }
                        }}
                        onStop={(e) => {
                            if (dragRef && dragRef.current) {
                                dragRef.current.style.transform = 'translate(0px, 0px)'
                            }
                        }}
                    >
                        <div className={c.divider} ref={dragRef}></div>
                    </Draggable>
                    <div className={c.right} ref={rightRef}>
                        <Preview />
                    </div>
                </div>
            </div>
        </div>
    )
}

FileExplorer.propTypes = {}

export default FileExplorer;
