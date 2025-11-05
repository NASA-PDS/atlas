import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { setSnackBarText } from '../../../../../core/redux/actions/actions'
import {
    getIn,
    getPDSUrl,
    getExtension,
    isObject,
    copyToClipboard,
} from '../../../../../core/utils.js'
import { ES_PATHS, IMAGE_EXTENSIONS } from '../../../../../core/constants.js'

import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Input from '@mui/material/Input'
import InputAdornment from '@mui/material/InputAdornment'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem'
import Collapse from '@mui/material/Collapse'
import { useSpring, animated } from '@react-spring/web'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

import { makeStyles, withStyles } from '@mui/styles'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import OpenSeadragonViewer from '../../../../../components/OpenSeadragonViewer/OpenSeadragonViewer'
import MenuButton from '../../../../../components/MenuButton/MenuButton'
import Highlighter from 'react-highlight-words'
import flat from 'flat'

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

const StyledTreeGroup = styled(TreeItem)(({theme}) => ({
  'minHeight': theme.headHeights[3],
  'margin': '8px 0px',
  [`& .${treeItemClasses.content}`]: {
    'minHeight': theme.headHeights[3],
    'flex': 1,
    'justifyContent': 'left',
    'alignItems': 'center',
    'background': theme.palette.swatches.grey.grey0,
    'border': `1px solid ${theme.palette.swatches.grey.grey200}`,
    'boxShadow': '0px 1px 4px 0px rgba(0,0,0,0)',
    'borderRadius': '0px',
    'padding': '0px 8px',
    'boxSizing': 'border-box',
    'width': 'auto',
    'transition': 'box-shadow 0.2s ease-in-out',
    '&:hover': {
        background: "#FFFFFF",
        boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.15)',
    },
    [`&.${treeItemClasses.selected}`]: {
      background: "#FFFFFF !important",
    }
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& svg': {
        fontSize: '24px !important',
        fill: theme.palette.accent.main,
    },
  },
  [`& .${treeItemClasses.label}`]: {
      fontSize: 14,
      lineHeight: `${theme.headHeights[3]}px`,
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 17,
    paddingLeft: 12,
    borderLeft: `1px solid ${theme.palette.swatches.grey.grey200}`,
  }
}));

const StyledTreeItem = styled(StyledTreeGroup)(({theme}) => ({
  'minHeight': theme.headHeights[3],
  [`& .${treeItemClasses.iconContainer}`]: {
    display: "none"
  },
  [`& .${treeItemClasses.label}`]: {
    paddingLeft: "8px"
  },
  [`& .${treeItemClasses.content}`]: {
    '&:hover': {
      cursor: 'default',
    },
  }
}));

// TODO: consolidate StyledTreeItem and FilterTreeLabel into single component
/*const FilterTreeLabel = styled(StyledTreeItem)(({theme}) => ({
  label: {
      'display': 'flex',
      'justifyContent': 'space-between',
      'flexWrap': 'wrap',
      'wordBreak': 'break-all',
  }
}));*/

const FilterTreeLabel = withStyles((theme) => ({
    label: {
        'display': 'flex',
        'justifyContent': 'space-between',
        'flexWrap': 'wrap',
        'wordBreak': 'break-all',
    },
    key: {
        fontSize: '14px',
        fontWeight: 'bold',
        [theme.breakpoints.down('md')]: {
            fontSize: '12px',
        },
    },
    value: {
        marginLeft: '40px',
        marginRight: '8px',
        fontSize: '14px',
        [theme.breakpoints.down('md')]: {
            fontSize: '12px',
        },
    },
    highlight: {
         fontWeight: 'bold',
    },
    more: {
        'color': '#000000',
         'position': 'absolute',
         'top': '9px',
         'right': '10px',
         'padding': '2px 10px',
         'fontSize': '11px',
         'border': 'none',
         'background': theme.palette.swatches.grey.grey150,
         '&:hover': {
            border: 'none',
             background: theme.palette.swatches.blue.blue100,
         },
    },
}))((props) => {
    const { classes, id, valueKey, value, filterString } = props
    const MAX_LENGTH = 256
    const [expanded, setExpanded] = useState(false)

    return (
        <div className={classes.FilterTreeLabel}>
            <div className={classes.label}>
                <div className={classes.key}>
                    <Highlighter
                        highlightClassName={classes.highlight}
                        searchWords={[filterString]}
                        autoEscape={true}
                        textToHighlight={String(valueKey)}
                    />
                </div>
                <div className={classes.value}>
                    <Highlighter
                        highlightClassName={classes.highlight}
                        searchWords={[filterString]}
                        autoEscape={true}
                        textToHighlight={
                            expanded
                                ? String(value)
                                : String(value).substring(0, MAX_LENGTH) +
                                  (String(value).length > MAX_LENGTH ? '...' : '')
                        }
                    />
                    {String(value).length > MAX_LENGTH && (
                        <Button
                            className={classes.more}
                            variant="outlined"
                            aria-label="expand/collapse label value"
                            size="small"
                            onClick={() => {
                                setExpanded(!expanded)
                            }}
                        >
                            {expanded ? 'less' : 'more'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
})

const makeTree = (data, filterString, classes) => {
    // We'll search with a lowercase string
    filterString = filterString.toLowerCase()

    // Checks if an element is to be filtered out or not
    // Uses recursion to support visibilities where the parent doesn't match but a child does
    const isShown = (key, obj, forceShown) => {
        if (obj == null) obj = ''
        // fromNesting signifies whether it's only shown because a child is shown
        // it's useful so that we don't assume all children are shown because one is
        let shown = { shown: true, fromNesting: false }

        if (obj.hidden === true) return { shown: false, fromNesting: false }

        // If forcing or not filtering
        // Forcing let's us show ALL children of a matched group
        if (forceShown || filterString == null || filterString.length == 0) return shown
        // check key
        if (key.toLowerCase().includes(filterString)) return shown
        // check value
        if (!isObject(obj) && String(obj).toLowerCase().includes(filterString)) return shown

        // Let's check the children too
        shown = { shown: false, fromNesting: false }
        const iter = Object.keys(obj)
        for (let i = 0; i < iter.length; i++)
            if (isObject(obj[iter[i]]))
                if (isShown(iter[i], obj[iter[i]])) shown = { shown: true, fromNesting: true }

        return shown
    }

    // Iterate this to conveniently make keys in order
    let keyI = 0
    const depthTraversal = (node, depth, forceShown) => {
        let tree = []
        let iter = Object.keys(node)
        for (let i = 0; i < iter.length; i++) {
            const shown = isShown(iter[i], node[iter[i]], forceShown)
            keyI++
            if (isObject(node[iter[i]])) {
                tree.push(
                    <StyledTreeGroup
                        itemId={`${keyI}`}
                        key={keyI}
                        label={
                            <Highlighter
                                highlightClassName={classes.highlight}
                                searchWords={[filterString]}
                                autoEscape={true}
                                textToHighlight={String(iter[i])}
                            />
                        }
                        slots={{
                          groupTransition: TransitionComponent
                        }}
                    >
                        {depthTraversal(
                            node[iter[i]],
                            depth + 1,
                            shown.shown && !shown.fromNesting
                        )}
                    </StyledTreeGroup>
                )
            } else {
                tree.push(
                    <StyledTreeItem
                        itemId={`${keyI}`}
                        key={keyI}
                        style={{
                            display: shown.shown ? 'inherit' : 'none',
                        }}
                        label={
                            <FilterTreeLabel
                                id={keyI}
                                valueKey={iter[i]}
                                value={node[iter[i]]}
                                filterString={filterString}
                            />
                        }
                        slots={{
                          groupTransition: TransitionComponent
                        }}
                    />
                )
            }
        }
        return tree
    }

    return { tree: depthTraversal(data, 0), numOfKeys: keyI }
}

const useStyles = makeStyles((theme) => ({
    ProductLabel: {
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: theme.palette.swatches.grey.grey0,
    },
    loading: {
        position: 'absolute',
        left: 'calc(50% - 20px)',
        top: 'calc(50% + 20px)',
    },
    notFound: {
        'position': 'absolute',
        'left': 'calc(50%)',
        'top': 'calc(50%)',
        '& > div': {
            transform: 'translateX(-50%) translateY(50%)',
            background: theme.palette.swatches.orange.orange500,
            padding: '8px 16px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            borderRadius: '2px',
        },
    },
    left: {
        flex: 1,
    },
    right: {
        borderLeft: `1px solid ${theme.palette.swatches.grey.grey150}`,
        width: '960px',
        background: theme.palette.swatches.grey.grey100,
        [theme.breakpoints.down('lg')]: {
            width: '660px',
        },
        [theme.breakpoints.down('md')]: {
            width: '100%',
        },
    },
    top: {
        height: `${theme.headHeights[2]}px`,
        display: 'flex',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        background: theme.palette.swatches.grey.grey0,
    },
    bottom: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: `calc(100% - ${theme.headHeights[2]}px)`,
        padding: `4px 8px`,
        boxSizing: 'border-box',
    },
    viewer: {
        height: '100%',
        flex: 1,
    },
    search: {
        flex: 1,
    },
    input: {
        width: '100%',
        'margin': `${theme.spacing(1)} 0 ${theme.spacing(2)} 0`,
        'padding': `0 0 0 ${theme.spacing(2)}`,
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey200}`,
        '&:before': {
            borderBottom: `1px solid rgba(255,255,255,0.2)`,
        },
    },
    searchCancelButton: {
        width: `${theme.headHeights[3]}px`,
        height: `${theme.headHeights[3]}px`,
        color: theme.palette.swatches.grey.grey800,
        transition: 'opacity 0.2s ease-out',
    },
    highlight: {
        fontWeight: 'bold',
    },
    buttons: {
        padding: '4px 2px 4px 0px',
    },
    button1: {
        height: 30,
        margin: '0px 3px',
        color: theme.palette.text.primary,
        border: "1px solid rgba(0, 0, 0, 0.23)",
        "&:hover": {
          border: "1px solid rgba(0, 0, 0, 0.23)",
          'background': "#0000000a",
        },
    },
    snackbar: {
        fontSize: 14,
        fontWeight: 'bold',
    },
}))

const ProductLabel = (props) => {

    const { recordData } = props

    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()

    const [filterString, setFilterString] = useState('')

    const release_id = getIn(recordData, ES_PATHS.release_id)

    const uri = getIn(recordData, ES_PATHS.uri)

    const browse_uri = getIn(recordData, ES_PATHS.browse)
    let imgURL = getPDSUrl(browse_uri, release_id)

    let type = getExtension(imgURL, true)
    if (!IMAGE_EXTENSIONS.includes(type)) {
        imgURL = getPDSUrl(uri, release_id)
        type = getExtension(imgURL, true)
    }

    const label_uri = getIn(recordData, ES_PATHS.label)
    const labelURL = getPDSUrl(label_uri, release_id)

    const label_id = getIn(recordData, ['atlas', 'label_id'], '')
    const pdsStandard = getIn(recordData, ES_PATHS.pds_standard)
    const labelDataRaw = getIn(
        recordData,
        pdsStandard === 'pds4' ? ES_PATHS.pds4_label : ES_PATHS.pds3_label,
        {}
    )
    const labelDataRawFlat = flat.flatten(labelDataRaw, { delimiter: ':' })
    const labelDataRawFlatSorted = Object.keys(labelDataRawFlat)
        .sort()
        .reduce((obj, key) => {
            obj[key] = labelDataRawFlat[key]
            return obj
        }, {})
    const labelData = flat.unflatten(labelDataRawFlatSorted, { delimiter: ':' })

    if (Object.keys(labelData).length === 0)
        return (
            <div className={c.ProductLabel}>
                <Box className={c.notFound}>
                    <div>Label Not Found</div>
                </Box>
            </div>
        )
    else {
        const labelTree = makeTree(labelData, filterString, c)
        return (
            <div className={c.ProductLabel}>
                {!isMobile && (
                    <div className={c.left}>
                        <div className={c.viewer}>
                            <OpenSeadragonViewer
                                image={{
                                    src: imgURL,
                                }}
                                settings={{ defaultZoomLevel: 0.5, showNavigator: false }}
                            />
                        </div>
                    </div>
                )}
                <div className={c.right}>
                    <div className={c.top}>
                        <div className={c.search}>
                            <Input
                                className={c.input}
                                value={filterString}
                                placeholder="Search in Label"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                }
                                endAdornment={
                                  <InputAdornment>
                                    <IconButton
                                        className={c.searchCancelButton}
                                        aria-label={`clear search`}
                                        size="small"
                                        style={{
                                            opacity: filterString.length > 0 ? '1' : '0',
                                        }}
                                        onClick={() => setFilterString('')}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                  </InputAdornment>
                                }
                                onChange={(e) => setFilterString(e.target.value)}
                            />
                        </div>

                        {!isMobile && (
                            <div className={c.buttons}>
                                <Button
                                    className={c.button1}
                                    variant="outlined"
                                    aria-label="copy label json button"
                                    size="small"
                                    onClick={() => {
                                        copyToClipboard(JSON.stringify(labelDataRaw, null, 2))
                                        dispatch(
                                            setSnackBarText(
                                                'Copied Label JSON to Clipboard!',
                                                'success'
                                            )
                                        )
                                    }}
                                >
                                    Copy Label JSON
                                </Button>
                                <Button
                                    className={c.button1}
                                    variant="outlined"
                                    aria-label="view raw label button"
                                    size="small"
                                    href={labelURL}
                                    target="_blank"
                                >
                                    View Raw Label
                                </Button>
                            </div>
                        )}
                        {isMobile && (
                            <div>
                                <MenuButton
                                    options={['Copy Label JSON', 'View Raw Label']}
                                    buttonComponent={<MoreVertIcon fontSize="inherit" />}
                                    onChange={(option, idx) => {
                                        switch (option) {
                                            case 'Copy Label JSON':
                                                copyToClipboard(JSON.stringify(labelData, null, 2))
                                                dispatch(
                                                    setSnackBarText(
                                                        'Copied Label JSON to Clipboard!',
                                                        'success'
                                                    )
                                                )
                                                break
                                            case 'View Raw Label':
                                                break
                                            default:
                                                break
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className={c.bottom}>
                        <SimpleTreeView
                            defaultExpanded={Array(labelTree.numOfKeys)
                                .fill()
                                .map((x, i) => String(i))}
                        >
                            {labelTree.tree}
                        </SimpleTreeView>
                    </div>
                </div>
            </div>
        )
    }
}

ProductLabel.propTypes = {}

export default ProductLabel;
