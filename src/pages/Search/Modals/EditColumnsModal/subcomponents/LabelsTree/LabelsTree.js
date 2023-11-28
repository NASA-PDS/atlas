import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { fade, makeStyles, withStyles, useTheme } from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'
import TreeItem from '@material-ui/lab/TreeItem'
import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Checkbox from '@material-ui/core/Checkbox'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import { useSpring, animated } from 'react-spring/web.cjs' // web.cjs is required for IE 11 support

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import FilterListIcon from '@material-ui/icons/FilterList'
import DragIndicatorIcon from '@material-ui/icons/DragIndicator'
import DeleteIcon from '@material-ui/icons/Delete'

import { List, arrayMove, arrayRemove } from 'react-movable'

import { isObject } from '../../../../../../core/utils'

function TransitionComponent(props) {
    const style = useSpring({
        from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
    })

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    )
}

TransitionComponent.propTypes = {
    /**
     * Show the component; triggers the enter or exit states
     */
    in: PropTypes.bool,
}

const StyledTreeGroup = withStyles((theme) => ({
    root: {
        minHeight: theme.headHeights[3],
    },
    content: {
        height: theme.headHeights[3],
    },
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    label: {
        fontSize: 16,
        height: theme.headHeights[3],
        lineHeight: `${theme.headHeights[3]}px`,
    },
    group: {
        marginLeft: 7,
        paddingLeft: 12,
    },
}))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />)

const StyledTreeItem = withStyles((theme) => ({
    root: {
        'height': theme.headHeights[3],
        'marginLeft': '-20px',
        '& > div > .MuiTreeItem-label': {
            padding: '0px',
        },
    },
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        marginLeft: 7,
        paddingLeft: 12,
        height: '32px',
    },
}))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />)

const LabelsTreeLabel = withStyles((theme) => ({
    LabelsTreeLabel: {
        display: 'flex',
        height: theme.headHeights[3],
    },
    checkbox: {},
    infoIcon: {
        fontSize: '18px',
        padding: '12px 7px',
        color: theme.palette.accent.main,
    },
    label: {
        flex: 1,
        lineHeight: `${theme.headHeights[3]}px`,
        paddingLeft: '3px',
        fontSize: '16px',
    },
}))((props) => {
    const { classes, id, label, active, onCheck, onInfoClick } = props
    return (
        <div className={classes.LabelsTreeLabel}>
            <Checkbox
                className={classes.checkbox}
                color="default"
                checked={active}
                size="medium"
                title="Add"
                aria-label="add"
                onClick={onCheck}
            />
            <IconButton
                className={classes.infoIcon}
                title="Info"
                aria-label="info"
                size="medium"
                onClick={onInfoClick}
            >
                <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
            <span className={classes.label} onClick={onCheck}>
                {label}
            </span>
        </div>
    )
})

// Makes the addFilter tree and does so with respect to the filterString (which subsets the tree)
const makeTree = (source, activeColumnFields, filterString, setSelected, addRemoveColumn) => {
    // We'll search with a lowercase string
    filterString = filterString.toLowerCase()

    // Checks if an element is to be filtered out or not
    // Uses recursion to support visibilities where the parent doesn't match but a child does
    const isShown = (key, obj, forceShown) => {
        // fromNesting signifies whether it's only shown because a child is shown
        // it's useful so that we don't assume all children are shown because one is
        let shown = { shown: true, fromNesting: false }

        // If forcing or not filtering
        // Forcing let's us show ALL children of a matched group
        if (forceShown || filterString == null || filterString.length == 0) return shown
        // check key
        if (key.toLowerCase().includes(filterString)) return shown

        // Let's check the children too
        shown = { shown: false, fromNesting: false }
        const iter = Object.keys(obj)
        for (let i = 0; i < iter.length; i++) {
            if (isObject(obj[iter[i]])) {
                if (isShown(iter[i], obj[iter[i]])) shown = { shown: true, fromNesting: true }
            } else {
                if (iter[i].toLowerCase().includes(filterString))
                    shown = { shown: true, fromNesting: true }
            }
        }
        return shown
    }

    // Iterate this to conveniently make keys in order
    let keyI = 0
    // A depth first traversal through the facet json tree to construct the react elements
    const depthTraversal = (node, depth, path, forceShown) => {
        let tree = []
        let iter = Object.keys(node)
        for (let i = 0; i < iter.length; i++) {
            const shown = isShown(iter[i], node[iter[i]], forceShown)
            const currentPath = path === '' ? path + iter[i] : path + '.' + iter[i]
            if (iter[i] === 'uuid') {
                // skip these
            } else if (isObject(node[iter[i]])) {
                keyI++
                tree.push(
                    <StyledTreeGroup
                        key={keyI}
                        nodeId={`${keyI}`}
                        label={iter[i]}
                        style={{ display: shown.shown ? 'inherit' : 'none' }}
                    >
                        {depthTraversal(
                            node[iter[i]],
                            depth + 1,
                            currentPath,
                            shown.shown && !shown.fromNesting
                        )}
                    </StyledTreeGroup>
                )
            } else {
                keyI++
                tree.push(
                    <StyledTreeItem
                        key={keyI}
                        nodeId={`${keyI}`}
                        style={{
                            display: shown.shown ? 'inherit' : 'none',
                        }}
                        label={
                            <LabelsTreeLabel
                                id={iter[i]}
                                label={iter[i]}
                                active={activeColumnFields.includes(currentPath)}
                                onCheck={() => {
                                    addRemoveColumn(
                                        currentPath,
                                        !activeColumnFields.includes(currentPath)
                                    )
                                }}
                                onInfoClick={() => {
                                    setSelected({
                                        filter: node[iter[i]],
                                        filterKey: iter[i],
                                    })
                                }}
                            />
                        }
                    />
                )
            }
        }
        return tree
    }

    return depthTraversal(source, 0, '')
}

const useStyles = makeStyles((theme) => ({
    LabelsTree: {
        display: 'flex',
        height: '100%',
        [theme.breakpoints.down('xs')]: {
            flexFlow: 'column',
        },
    },
    left: {
        flexGrow: 1,
        overflowX: 'hidden',
        width: '300px',
        transition: 'width 0.2s ease-out',
        display: 'flex',
        flexFlow: 'column',
        [theme.breakpoints.down('xs')]: {
            width: '100%',
        },
    },
    leftTop: {
        paddingTop: '1px',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey150}`,
    },
    leftBottom: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
    right: {
        overflowX: 'hidden',
        padding: '0px',
        transition: 'width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out',
        width: '300px',
        minHeight: '100%',
        opacity: 1,
        pointerEvents: 'inherit',
        borderLeft: `1px solid ${theme.palette.swatches.grey.grey200}`,
        [theme.breakpoints.down('xs')]: {
            minHeight: 'unset',
            maxHeight: '40%',
            borderTop: `1px solid ${theme.palette.swatches.grey.grey600}`,
            width: 'calc(100% - 1px)',
        },
    },
    input: {
        'width': '100%',
        'padding': `${theme.spacing(1)}px ${theme.spacing(2)}px`,
        '&:before': {
            borderBottom: `1px solid rgba(255,255,255,0.2)`,
        },
    },
    listUl: { margin: 0 },
    listLi: {
        display: 'flex',
        justifyContent: 'space-between',
        height: '40px',
        padding: '0px 8px 0px 0px',
        listStyleType: 'none',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        transition: 'background 0.2s ease-out, box-shadow 0.2s ease-out',
        zIndex: 20000,
    },
    deleteButton: {
        'width': '40px',
        'height': '40px',
        'color': theme.palette.swatches.grey.grey300,
        'transition': 'color 0.2s ease-out',
        '&:hover': {
            color: theme.palette.swatches.red.red500,
        },
    },
}))

const LabelsTree = (props) => {
    const { columns, setColumns } = props
    const c = useStyles()
    const theme = useTheme()

    const [filterString, setFilterString] = useState('')

    const [selected, setSelected] = useState({
        filter: null,
        filterKey: null,
    })

    const firstResult = useSelector((state) => {
        const r = state.getIn(['results', 0])
        if (typeof r.toJS === 'function') return r.toJS()
        return r
    })

    const addRemoveColumn = (col, isAdd) => {
        if (isAdd) {
            if (!columns.includes(col)) setColumns(columns.concat([col]))
        } else {
            const idx = columns.indexOf(col)
            if (idx >= 0) setColumns(arrayRemove(columns, idx))
        }
    }

    return (
        <div className={c.LabelsTree}>
            <div className={c.left}>
                <div className={c.leftTop}>
                    <Input
                        className={c.input}
                        placeholder={'Find Filter'}
                        startAdornment={
                            <InputAdornment position="start">
                                <FilterListIcon />
                            </InputAdornment>
                        }
                        onInput={(e) => {
                            setFilterString(e.target.value)
                        }}
                    />
                </div>
                <div className={c.leftBottom}>
                    <TreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                    >
                        {makeTree(
                            firstResult?._source,
                            columns,
                            filterString,
                            setSelected,
                            addRemoveColumn
                        )}
                    </TreeView>
                </div>
            </div>
            <div className={c.right}>
                <List
                    values={columns}
                    onChange={({ oldIndex, newIndex }) =>
                        setColumns(arrayMove(columns, oldIndex, newIndex))
                    }
                    renderList={({ children, props, isDragged }) => (
                        <ul
                            className={c.listUl}
                            {...props}
                            style={{
                                padding: 0,
                                cursor: isDragged ? 'grabbing' : undefined,
                            }}
                        >
                            {children}
                        </ul>
                    )}
                    renderItem={({ value, props, isDragged, isSelected }) => (
                        <li
                            className={c.listLi}
                            {...props}
                            style={{
                                ...props.style,
                                cursor: isDragged ? 'grabbing' : 'grab',
                                boxShadow:
                                    isDragged || isSelected
                                        ? '0px 2px 4px 0px rgba(0,0,0,0.2)'
                                        : '0px 2px 4px 0px rgba(0,0,0,0)',
                                backgroundColor:
                                    isDragged || isSelected
                                        ? theme.palette.swatches.blue.blue100
                                        : theme.palette.swatches.grey.grey100,
                            }}
                        >
                            <div style={{ display: 'flex' }}>
                                <DragIndicatorIcon
                                    style={{
                                        margin: '9px 2px',
                                        color: theme.palette.swatches.grey.grey300,
                                    }}
                                />
                                <span style={{ lineHeight: '40px', marginLeft: '1px' }}>
                                    {value}
                                </span>
                            </div>
                            <div>
                                <Tooltip title="Remove Label" arrow placement="right">
                                    <IconButton
                                        className={c.deleteButton}
                                        aria-label={`remove label ${value}`}
                                        size="small"
                                        onClick={() => {
                                            addRemoveColumn(value, false)
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </li>
                    )}
                />
            </div>
        </div>
    )
}

LabelsTree.propTypes = {}

export default LabelsTree
