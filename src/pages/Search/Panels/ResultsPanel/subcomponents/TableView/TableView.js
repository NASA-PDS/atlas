import React, { useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
    HASH_PATHS,
    ES_PATHS,
    AVAILABLE_URI_SIZES,
    IMAGE_EXTENSIONS,
} from '../../../../../../core/constants'

import { List, AutoSizer, InfiniteLoader } from 'react-virtualized'
import Draggable from 'react-draggable'

import clsx from 'clsx'
import Image from 'mui-image'

import { makeStyles } from '@mui/styles'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import {
    search,
    getResultViewIndex,
    setResultViewIndex,
    checkItemInResults,
    setResultSorting,
} from '../../../../../../core/redux/actions/actions.js'
import { sAKeys, sASet } from '../../../../../../core/redux/actions/subscribableActions.js'
import { getIn, getPDSUrl, getExtension } from '../../../../../../core/utils.js'

import ProductToolbar from '../../../../../../components/ProductToolbar/ProductToolbar'
import ProductIcons from '../../../../../../components/ProductIcons/ProductIcons'

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ImageIcon from '@mui/icons-material/Image'

const rowItemHeight = 32

const useStyles = makeStyles((theme) => ({
    TableView: {
        width: '100%',
        height: '100%',
        padding: `0px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    content: {
        'height': `calc(100% - ${theme.headHeights[3]}px)`,
        'overflowY': 'auto',
        'background': 'white',
        '& > div': {
            whiteSpace: 'nowrap',
        },
    },
    rowItem: {
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey150}`,
        'min-height': `${rowItemHeight}px`,
        'max-height': `${rowItemHeight}px`,
        'lineHeight': `${rowItemHeight}px`,
        'box-sizing': 'border-box',
        'position': 'relative',
        'width': '100%',
        'background': theme.palette.primary.main,
        'transition': 'background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.blue.blue100,
        },
    },
    cell: {
        'borderRight': `1px solid ${theme.palette.swatches.grey.grey150}`,
        'padding': '0px 6px',
        'boxSizing': 'border-box',
        'whiteSpace': 'nowrap',
        'textOverflow': 'ellipsis',
        'overflow': 'hidden',
        'display': 'inline-block',
        'transition': 'box-shadow 0.2s ease-out, background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey0,
            boxShadow: `inset 0px 0px 0px 1px ${theme.palette.accent.main}`,
        },
    },
    cellRaw: {
        borderRight: `1px solid ${theme.palette.swatches.grey.grey150}`,
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        display: 'inline-block',
        height: `${rowItemHeight}px`,
    },
    cellThumbnail: {
        'width': `${rowItemHeight}px`,
        'height': `${rowItemHeight}px`,
        'zIndex': 2,
        '& img': {
            width: '100%',
            height: '100%',
        },
        'cursor': 'pointer',
        'display': 'inline-block',
        'position': 'relative',
        '&:hover .thumbnailIcon': {
            opacity: '1',
        },
        '&:hover .hoverImage': {
            position: 'absolute !important',
            width: '128px !important',
            height: 'auto !important',
            pointerEvents: 'none',
            zIndex: 1000000,
            left: `${rowItemHeight + 10}px !important`,
            background: `${theme.palette.accent.main} !important`,
            boxShadow: '0px 2px 3px 0px rgba(0, 0, 0, 0.25)',
            transform: `translateY(calc(-50% + ${rowItemHeight / 2}px))`,
            borderRadius: '4px',
        },
    },
    cellImage: {
        'opacity': 1,
        'object-fit': 'cover !important',
        'user-select': 'none',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'image-rendering': 'pixelated',
        'width': `${rowItemHeight}px !important`,
        'height': `${rowItemHeight}px !important`,
        'display': 'inline-block',
        'position': 'static !important',
        'background': `linear-gradient(to bottom, #060606, ${theme.palette.swatches.black.black0}) !important`,
    },
    thumbnailIcon: {
        position: 'absolute',
        width: `${rowItemHeight + 10}px !important`,
        height: `${rowItemHeight}px !important`,
        background: theme.palette.accent.main,
        pointerEvents: 'none',
        opacity: '0',
        boxSizing: 'border-box',
        padding: '6px',
    },
    header: {
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey300}`,
        'min-height': `${theme.headHeights[3]}px`,
        'max-height': `${theme.headHeights[3]}px`,
        'lineHeight': `${theme.headHeights[3]}px`,
        'display': 'inline-block',
        'whiteSpace': 'nowrap',
        'box-sizing': 'border-box',
        'width': '100%',
        'background': theme.palette.swatches.grey.grey150,
    },
    cellHeader: {
        'padding': '0px 6px',
        'fontWeight': 'bold',
        'display': 'inline-block',
        'boxSizing': 'border-box',
        'position': 'relative',
        '&:hover .tableViewSortButton': {
            opacity: 1,
        },
        '& > div:last-child': {
            'position': 'absolute',
            'top': '0px',
            'left': '-5px',
            'width': '9px',
            'height': '100%',
            'cursor': 'col-resize',
            '& > div': {
                width: '1px',
                margin: '0px 4px',
                height: '100%',
                background: theme.palette.swatches.grey.grey300,
            },
        },
        '& > div.react-draggable-dragging:last-child': {
            'left': '-70px',
            'width': '139px',
            'height': '100vh',
            'zIndex': 1000,
            '& > div': {
                width: '1px',
                margin: '0px 69px',
                background: theme.palette.accent.main,
            },
        },
    },
    cellHeaderContent: {
        display: 'flex',
    },
    cellHeaderName: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        marginRight: '1px',
        textTransform: 'uppercase',
    },
    cellHeaderThumbnail: {
        'borderRight': `1px solid ${theme.palette.swatches.grey.grey200}`,
        'box-sizing': 'border-box',
        'display': 'inline-block',
    },
    sortButton: {
        position: 'absolute',
        margin: '4px',
        padding: '1px',
        borderRadius: '50%',
        opacity: 0,
        transition: 'opacity 0.2s ease-out',
    },
    sortButtonActive: {
        opacity: 1,
        color: theme.palette.accent.main,
    },
}))

let resultsLength = -1
let loadedMore = false

const TableView = (props) => {
    const { results, paging } = props

    const c = useStyles()
    const dispatch = useDispatch()

    const resultsPerPage = paging.resultsPerPage

    //columns
    const cols = [
        { type: 'toolbar', width: rowItemHeight * 3 },
        {
            type: 'thumbnail',
            width: rowItemHeight,
            name: '',
            path: ['pds_archive', 'file_name'],
        },
    ]

    const resultSorting = useSelector((state) => {
        return state.getIn(['resultSorting'])
    }).toJS()

    let resultsTable = useSelector((state) => {
        return state.getIn(['resultsTable'])
    })
    if (typeof resultsTable.toJS === 'function') resultsTable = resultsTable.toJS()

    resultsTable.columns.forEach((path) => {
        cols.push({ type: 'label', path: path.split('.') })
    })

    if (results.length != resultsLength) loadedMore = true
    resultsLength = results.length

    const [columnWidths, setColumnWidths] = useState([32, 32].concat(Array(498).fill(200)))

    const headerRef = React.useRef(null)
    const tableContainerRef = React.useRef(null)

    const setSort = (field, direction) => {
        dispatch(setResultSorting(field, direction))
    }
    // Load More
    const loadData = () => {
        if (loadedMore) {
            loadedMore = false
            dispatch(search(parseInt(results.length / resultsPerPage)))
        }
    }

    const RowItem = ({ index, data }) => {
        const c = useStyles()

        const navigate = useNavigate()

        if (data == null) return null

        const s = data._source

        function toRecord() {
            navigate(`${HASH_PATHS.record}?uri=${getIn(s, ES_PATHS.source)}`)
        }

        return (
            <div
                key={index}
                result-id={index}
                result-key={data.result_key}
                className={`${c.rowItem} TableViewRowItem`}
                onMouseEnter={() => {
                    sASet(sAKeys.HOVERED_RESULT, data)
                }}
                onMouseLeave={() => {
                    sASet(sAKeys.HOVERED_RESULT, null)
                }}
            >
                {makeColumns(index, data, cols, columnWidths, toRecord)}
            </div>
        )
    }

    return (
        <div className={`${c.TableView} fade-in`}>
            <div className={c.header} ref={headerRef}>
                {makeHeader(cols, columnWidths, setColumnWidths, resultSorting, setSort)}
            </div>
            <div
                className={c.content}
                id="TableViewContent"
                onScroll={(e) => {
                    if (e.target.classList.contains('ReactVirtualized__List'))
                        headerRef.current.style.marginLeft = -e.target.scrollLeft + 'px'
                }}
            >
                <InfiniteLoader
                    isRowLoaded={({ index }) => results[index]}
                    loadMoreRows={loadData}
                    rowCount={10000}
                >
                    {({ onRowsRendered, registerChild }) => (
                        <AutoSizer>
                            {({ width, height }) => (
                                <List
                                    ref={registerChild}
                                    onRowsRendered={onRowsRendered}
                                    width={width}
                                    height={height}
                                    overscanRowCount={10}
                                    rowCount={results.length}
                                    rowHeight={rowItemHeight}
                                    rowRenderer={({ index, key, style }) => (
                                        <div key={key} style={style}>
                                            <RowItem index={index} data={results[index]} />
                                        </div>
                                    )}
                                />
                            )}
                        </AutoSizer>
                    )}
                </InfiniteLoader>
            </div>
        </div>
    )
}

const makeColumns = (idx, data, cols, columnWidths, toRecord) => {
    const c = useStyles()

    const s = data._source

    const release_id = getIn(s, ES_PATHS.release_id)

    const thumb_id = getIn(s, ES_PATHS.thumb)

    const imgURL = getPDSUrl(thumb_id, release_id, AVAILABLE_URI_SIZES.xs)

    const fileName = getIn(s, ES_PATHS.file_name, '')

    let colElements = []
    cols.forEach((col, index) => {
        switch (col.type) {
            case 'toolbar':
                colElements.push(
                    <div
                        key={`${index}_${index}`}
                        className={c.cellRaw}
                        style={{
                            width: col.width,
                            position: 'relative',
                        }}
                    >
                        <ProductToolbar result={data} noHover={true} />
                    </div>
                )
                break
            case 'thumbnail':
                colElements.push(
                    <div key={`${index}_${index}`} className={c.cellThumbnail} onClick={toRecord}>
                        <div className={clsx(c.thumbnailIcon, 'thumbnailIcon')}>
                            <ImageIcon />
                        </div>
                        <Image
                            className={clsx(c.cellImage, 'hoverImage')}
                            wrapperStyle={{
                                height: '100%',
                                paddingTop: 'unset',
                                position: 'initial',
                            }}
                            shiftDuration={1200}
                            src={
                                IMAGE_EXTENSIONS.includes(getExtension(imgURL, true))
                                    ? imgURL
                                    : 'null'
                            }
                            alt={fileName}
                            errorIcon={
                                <ProductIcons filename={fileName} size="small" color="dark" />
                            }
                            loading="lazy"
                        />
                    </div>
                )
                break
            case 'label':
                const value = getIn(s, col.path, '--')
                colElements.push(
                    <div
                        key={`${index}_${index}`}
                        className={c.cell}
                        style={{
                            width: columnWidths[index],
                        }}
                        title={value}
                    >
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                    </div>
                )
                break
            default:
                console.warn(`Unknown Table View column type: ${col.type}`)
        }
    })
    return colElements
}

const makeHeader = (cols, columnWidths, setColumnWidths, resultSorting, setSort) => {
    const c = useStyles()

    const nodeRef = useRef(null)

    let colHeader = []
    cols.forEach((col, index) => {
        switch (col.type) {
            case 'toolbar':
                colHeader.push(
                    <div
                        key={index}
                        className={c.cellHeaderThumbnail}
                        style={{
                            width: col.width,
                        }}
                    >
                        {col.name}
                    </div>
                )
                break
            case 'thumbnail':
                colHeader.push(
                    <div
                        key={index}
                        className={c.cellHeaderThumbnail}
                        style={{
                            width: 32,
                        }}
                    >
                        {col.name}
                    </div>
                )
                break
            case 'label':
                const colField = col.path.join('.')
                colHeader.push(
                    <div
                        key={index}
                        className={c.cellHeader}
                        style={{
                            width: columnWidths[index],
                        }}
                    >
                        <div className={c.cellHeaderContent}>
                            <div className={c.cellHeaderName} title={colField}>
                                {col.name || col.path[col.path.length - 1]}
                            </div>
                            <div className={c.cellSorting}>
                                <Tooltip title="Sort Column" arrow placement="top">
                                    <IconButton
                                        className={clsx('tableViewSortButton', c.sortButton, {
                                            [c.sortButtonActive]: resultSorting.field === colField,
                                        })}
                                        aria-label={`sort ${colField} column`}
                                        size="small"
                                        onClick={() => {
                                            if (resultSorting.field === colField)
                                                setSort(
                                                    null,
                                                    resultSorting.direction === 'asc'
                                                        ? 'desc'
                                                        : 'asc'
                                                )
                                            else setSort(colField, resultSorting.direction)
                                        }}
                                    >
                                        {resultSorting.direction === 'asc' ? (
                                            <ArrowUpwardIcon />
                                        ) : (
                                            <ArrowDownwardIcon />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                        <Draggable
                            nodeRef={nodeRef}
                            axis="x"
                            position={{ x: 0, y: 0 }}
                            onStop={(e, d) => {
                                const newColumnWidths = JSON.parse(JSON.stringify(columnWidths))
                                newColumnWidths[index - 1] += d.x
                                newColumnWidths[index - 1] = Math.max(
                                    newColumnWidths[index - 1],
                                    50
                                )
                                setColumnWidths(newColumnWidths)
                            }}
                        >
                            <div ref={nodeRef} className={c.cellHeaderDrag}>
                                <div></div>
                            </div>
                        </Draggable>
                    </div>
                )
                break
            default:
                console.warn(`Unknown Table View column type: ${col.type}`)
        }
    })
    return colHeader
}

TableView.propTypes = {}

export default TableView
