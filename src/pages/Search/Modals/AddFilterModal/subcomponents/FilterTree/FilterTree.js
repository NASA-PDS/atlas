import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { makeStyles, withStyles } from '@mui/styles'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Input from '@mui/material/Input'
import InputAdornment from '@mui/material/InputAdornment'
import { useSpring, animated } from '@react-spring/web'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseSharpIcon from '@mui/icons-material/CloseSharp'

import Highlighter from 'react-highlight-words'

import { isObject } from '../../../../../../core/utils'
import FilterHelp from '../../../../../../components/FilterHelp/FilterHelp'

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
        textTransform: 'uppercase',
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
        fontSize: 14,
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
        'textTransform': 'uppercase',
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

const FilterTreeLabel = withStyles((theme) => ({
    FilterTreeLabel: {
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
        fontSize: '14px',
        textTransform: 'none',
    },
    labelBefore: {
        opacity: 0.9,
    },
    labelAfter: {
        fontWeight: 'bold',
    },
}))((props) => {
    const { classes, id, label, active, onCheck, onInfoClick, filterString } = props

    // Let's split on the last ':' to highlight the relevant portion
    let labelBefore = null
    let labelAfter = label
    const lastIndex = label.lastIndexOf(':')
    if (lastIndex != -1) {
        labelBefore = label.slice(0, lastIndex) + ':'
        labelAfter = label.slice(lastIndex + 1)
    }

    return (
        <div className={classes.FilterTreeLabel}>
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
                {labelBefore != null && (
                    <span className={classes.labelBefore}>
                        <Highlighter
                            searchWords={[filterString]}
                            autoEscape={true}
                            textToHighlight={String(labelBefore)}
                        />
                    </span>
                )}
                <span className={classes.labelAfter}>
                    <Highlighter
                        searchWords={[filterString]}
                        autoEscape={true}
                        textToHighlight={String(labelAfter)}
                    />
                </span>
            </span>
        </div>
    )
})

let shownExpandedIds = []
// Makes the addFilter tree and does so with respect to the filterString (which subsets the tree)
const makeTree = (
    mapping,
    activeFilterIds,
    filterString,
    addStagedFilter,
    removeStagedFilter,
    setSelected,
    toggleExpanded
) => {
    // We'll search with a lowercase string
    filterString = filterString.toLowerCase()

    // Checks if an element is to be filtered out or not
    // Uses recursion to support visibilities where the parent doesn't match but a child does
    const isShown = (key, obj, forceShown) => {
        // fromNesting signifies whether it's only shown because a child is shown
        // it's useful so that we don't assume all children are shown because one is
        let shown = { shown: true, fromNesting: false }

        if (obj.hidden === true) return { shown: false, fromNesting: false }

        // If forcing or not filtering
        // Forcing let's us show ALL children of a matched group
        if (forceShown || filterString == null || filterString.length == 0) return shown
        // check key
        if (key.toLowerCase().includes(filterString)) return shown
        // check display_name
        if (
            obj.display_name &&
            typeof obj.display_name === 'string' &&
            obj.display_name.toLowerCase().includes(filterString)
        )
            return shown
        // check display_subname
        if (
            obj.display_subname &&
            typeof obj.display_subname === 'string' &&
            obj.display_subname.toLowerCase().includes(filterString)
        )
            return shown
        // check tags
        if (obj.tags && obj.tags.length > 0)
            for (const tag of obj.tags)
                if (typeof tag === 'string' && tag.toLowerCase().includes(filterString))
                    return shown
        // check description
        if (
            obj.description &&
            typeof obj.description === 'string' &&
            obj.description.toLowerCase().includes(filterString)
        )
            return shown

        // Let's check the children too
        shown = { shown: false, fromNesting: false }
        const iter = Object.keys(obj)
        for (let i = 0; i < iter.length; i++)
            if (isObject(obj[iter[i]]))
                if (isShown(iter[i], obj[iter[i]]).shown) shown = { shown: true, fromNesting: true }

        return shown
    }

    const groupIds = []

    // Iterate this to conveniently make keys in order
    let keyI = 0
    // A depth first traversal through the facet json tree to construct the react elements
    const depthTraversal = (node, type, depth, path, forceShown) => {
        let tree = []
        let iter = Object.keys(node)
        //console.log(type, node)
        for (let i = 0; i < iter.length; i++) {
            const shown = isShown(iter[i], node[iter[i]], forceShown)
            let nextPath = `${path}${path.length > 0 ? '.' : ''}${iter[i]}`
            nextPath = nextPath.replace(/.groups/g, '')

            if (node[iter[i]].facets != null) {
                keyI++
                tree.push(
                    <StyledTreeItem
                        itemId={`${keyI}`}
                        key={keyI}
                        style={{
                            display: shown.shown ? 'inherit' : 'none',
                        }}
                        label={
                            <FilterTreeLabel
                                id={iter[i]}
                                label={node[iter[i]].display_name || iter[i]}
                                active={activeFilterIds.includes(nextPath)}
                                filterString={filterString}
                                onCheck={() => {
                                    if (!activeFilterIds.includes(nextPath))
                                        addStagedFilter(nextPath, node[iter[i]])
                                    else removeStagedFilter(nextPath)
                                }}
                                onInfoClick={() => {
                                    setSelected({
                                        filter: node[iter[i]],
                                        filterKey: nextPath,
                                    })
                                }}
                            />
                        }
                    />
                )
            } else if (type === 'groups') {
                keyI++
                if (shown.shown) groupIds.push(keyI + '')
                tree.push(
                    <StyledTreeGroup
                        itemId={`${keyI}`}
                        key={keyI}
                        label={
                            <Highlighter
                                searchWords={[filterString]}
                                autoEscape={true}
                                textToHighlight={String(node[iter[i]].display_name || iter[i])}
                            />
                        }
                        style={{ display: shown.shown ? 'inherit' : 'none' }}
                        onClick={(function (kI) {
                            return function () {
                                toggleExpanded(kI)
                            }
                        })(keyI)}
                    >
                        {depthTraversal(
                            node[iter[i]],
                            'group',
                            depth + 1,
                            nextPath,
                            shown.shown && !shown.fromNesting
                        )}
                    </StyledTreeGroup>
                )
            } else if (type === 'group') {
                if (iter[i] === 'groups') {
                    tree.push(
                        depthTraversal(node[iter[i]], 'groups', depth + 1, nextPath, forceShown)
                    )
                } else if (iter[i] === 'filters') {
                    tree.push(
                        depthTraversal(node[iter[i]], 'filters', depth + 1, nextPath, forceShown)
                    )
                }
            }
        }
        return tree
    }

    if (mapping?.groups == null) return []
    const returnValue = depthTraversal(mapping.groups, 'groups', 0, '')
    shownExpandedIds = groupIds
    return returnValue
}

const useStyles = makeStyles((theme) => ({
    FilterTree: {
        display: 'flex',
        height: '100%',
    },
    left: {
        flexGrow: 1,
        overflow: 'hidden',
        width: '800px',
        display: 'flex',
        flexFlow: 'column',
    },
    tree: {
        flex: 1,
        overflowX: 'hidden',
        padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
    },
    helpOpenLeft: {
        transition: 'width 0.2s ease-out',
    },
    right: {
        width: '0px',
        opacity: 0,
        pointerEvents: 'none',
        overflowX: 'hidden',
        padding: '0px',
        transition: 'width 0.2s ease-out, opacity 0.2s ease-out, padding 0.2s ease-out',
    },
    helpOpenRight: {
        width: '500px',
        minHeight: '100%',
        opacity: 1,
        pointerEvents: 'inherit',
        position: 'relative',
        borderLeft: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    filter: {
        display: 'flex',
    },
    input: {
        'width': '100%',
        'margin': `${theme.spacing(1)} 0 ${theme.spacing(2)} 0`,
        'padding': `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey200}`,
        '&:before': {
            borderBottom: `1px solid rgba(255,255,255,0.2)`,
        },
    },
    clearInput: {
        'color': theme.palette.text.primary,
        'fontSize': '11px',
        'lineHeight': '11px',
        'padding': '4px 7px',
        'margin': '7px',
        'height': '21px',
        'position': 'absolute',
        'right': 0,
        'transition': 'opacity 0.2s ease-in-out',
        '& .MuiButton-endIcon': {
            marginTop: '-2px',
            marginLeft: '3px',
        },
    },
    clearInputHidden: {
        opacity: 0,
        pointerEvents: 'none',
    },
}))

let filterStringTimeout

const FilterTree = (props) => {
    const { activeFilterIds, addStagedFilter, removeStagedFilter } = props
    const c = useStyles()

    const filterRef = useRef()
    const [filterString, setFilterString] = useState('')
    const [expandeds, setExpandeds] = useState([])

    const atlasMapping = useSelector((state) => {
        return state.getIn(['mappings', 'atlas'])
    })

    const [selected, setSelected] = useState({
        filter: null,
        filterKey: null,
    })

    const isHelpOpen = selected && selected.filter && selected.filterKey

    const toggleExpanded = (keyI) => {
        const nextExpandeds = JSON.parse(JSON.stringify(expandeds))
        keyI = keyI + ''
        const idx = nextExpandeds.indexOf(keyI)
        if (idx === -1) {
            nextExpandeds.push(keyI)
        } else {
            nextExpandeds.splice(idx, 1)
        }
        setExpandeds(nextExpandeds)
    }

    let finalExpandeds = expandeds
    if (filterString != null && filterString.length > 0) finalExpandeds = shownExpandedIds

    return (
        <div className={c.FilterTree}>
            <div
                className={clsx(c.left, {
                    [c.helpOpenLeft]: isHelpOpen,
                })}
            >
                <div className={c.filter}>
                    <Input
                        className={c.input}
                        ref={filterRef}
                        placeholder={'Find Filter'}
                        startAdornment={
                            <InputAdornment position="start">
                                <FilterListIcon />
                            </InputAdornment>
                        }
                        onInput={(e) => {
                            const val = e.target.value
                            clearTimeout(filterStringTimeout)
                            filterStringTimeout = setTimeout(() => {
                                setFilterString(val)
                            }, 400)
                        }}
                    />
                    <Button
                        className={clsx(c.clearInput, {
                            [c.clearInputHidden]: filterString === '',
                        })}
                        aria-label="clear filter"
                        size="small"
                        onClick={() => {
                            if (filterRef?.current) {
                                filterRef.current.querySelector('input').value = ''
                                setFilterString('')
                            }
                        }}
                        endIcon={<CloseSharpIcon />}
                    >
                        Clear
                    </Button>
                </div>
                <SimpleTreeView
                    className={c.tree}
                    expanded={finalExpandeds}
                >
                    {makeTree(
                        atlasMapping,
                        activeFilterIds,
                        filterString,
                        addStagedFilter,
                        removeStagedFilter,
                        setSelected,
                        toggleExpanded
                    )}
                </SimpleTreeView>
            </div>
            <div
                className={clsx(c.right, {
                    [c.helpOpenRight]: isHelpOpen,
                })}
            >
                {isHelpOpen ? (
                    <FilterHelp
                        className={c.filterHelp}
                        filter={selected.filter}
                        filterKey={selected.filterKey}
                        onClose={() => {
                            setSelected({
                                filter: null,
                                filterKey: null,
                            })
                        }}
                    />
                ) : null}
            </div>
        </div>
    )
}

FilterTree.propTypes = {}

export default FilterTree
