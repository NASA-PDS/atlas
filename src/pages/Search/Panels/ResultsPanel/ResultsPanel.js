import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import Url from 'url-parse'

import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles'

import Paper from '@material-ui/core/Paper'

import Heading from './subcomponents/Heading/Heading'
import ResultsStatus from './subcomponents/ResultsStatus/ResultsStatus'
import GridView from './subcomponents/GridView/GridView'
import ListView from './subcomponents/ListView/ListView'
import TableView from './subcomponents/TableView/TableView'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import { search } from '../../../../core/redux/actions/actions.js'
import { abbreviateNumber } from '../../../../core/utils.js'

const useStyles = makeStyles((theme) => ({
    ResultsPanel: {
        height: '100%',
        transition: 'width 0.4s ease-out',
        overflow: 'hidden',
    },
    contents: {
        width: '100%', //`calc(100% - ${theme.spacing(2)}px)`,
        height: '100%', //`calc(100% - ${theme.spacing(4)}px)`,
        margin: 0, //`${theme.spacing(2)}px ${theme.spacing(1)}px`,
        display: 'flex',
        flexFlow: 'column',
        background: theme.palette.swatches.grey.grey150,
    },
    content: {
        width: '100%',
        height: `calc(100% - ${theme.headHeights[1] + theme.headHeights[2]}px)`,
        position: 'relative',
    },
    viewSwitch: {
        'borderRadius': 0,
        'marginRight': theme.spacing(3),
        'border': `1px solid ${theme.palette.accent.main}`,
        '& button': {
            borderRadius: 0,
            width: '36px',
            height: '100%',
            color: theme.palette.accent.main,
        },
    },
    viewActive: {
        background: `${theme.palette.accent.main} !important`,
        color: `${theme.palette.swatches.grey.grey800} !important`,
    },
    tabs: {
        width: '100%',
        height: theme.headHeights[2],
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        display: 'flex',
        justifyContent: 'space-between',
    },
    footing: {
        width: '100%',
        height: theme.headHeights[3],
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 12px',
        boxSizing: 'border-box',
        background: theme.palette.primary.main,
        display: 'none', //!!!!!!!!!!!!!
    },
    numResults: {
        lineHeight: `${theme.headHeights[2]}px`,
        padding: '0px 20px',
        color: theme.palette.swatches.grey.grey700,
    },
    maxPage: {
        marginLeft: theme.spacing(2),
        lineHeight: '24px',
        color: theme.palette.swatches.yellow.yellow700,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        bottom: '100%',
        width: '100%',
        height: '10px',
        pointerEvents: 'none',
        background:
            'linear-gradient(to bottom, rgba(18, 24, 30, 0.1) 0%, rgba(18, 24, 30, 0.5) 100%)',
    },
    addQueryCart: {
        color: theme.palette.text.secondary,
        fontSize: '11px',
        lineHeight: '11px',
        margin: '3px 10px 3px 3px',
        background: theme.palette.swatches.black.black0,
    },
}))

// HELPERS
function a11yProps(index) {
    return {
        'id': `record-view-tab-${index}`,
        'aria-controls': `record-view-tab-${index}`,
    }
}

const StyledTabs = withStyles((theme) => ({
    //height: theme.headHeights[2],
    indicator: {
        'display': 'flex',
        'justifyContent': 'center',
        'backgroundColor': 'transparent',
        'height': '5px',
        '& > span': {
            maxWidth: 124,
            width: '100%',
            backgroundColor: theme.palette.accent.main,
        },
    },
}))((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />)

const StyledTab = withStyles((theme) => ({
    root: {
        'color': theme.palette.text.primary,
        'fontSize': theme.typography.pxToRem(14),
        'marginRight': theme.spacing(1),
        'minWidth': 88,
        '&:focus': {
            opacity: 1,
        },
    },
}))((props) => <Tab disableRipple {...props} />)

// Don't rerender for this change
let firstSearch = false
// We want this evaluated only as soon as possible
const url = new Url(window.location, true)

const ResultsPanel = (props) => {
    const { mobile } = props

    const c = useStyles()
    const theme = useTheme()
    const dispatch = useDispatch()

    const activeViews = ['grid', 'list', 'table']
    const [activeView, setActiveView] = useState('grid')

    const atlasMapping = useSelector((state) => {
        return state.getIn(['mappings', 'atlas'])
    })

    useEffect(() => {
        // Runs after the first render() lifecycle
        if (!firstSearch && atlasMapping?.groups) {
            dispatch(search(null, true, null, url))
            firstSearch = true
        }
    }, [atlasMapping])

    const w = useSelector((state) => {
        return state.getIn(['workspace', 'main'])
    }).toJS()

    // 'basic' || 'advanced
    const filterType = useSelector((state) => {
        return state.getIn(['filterType'])
    })

    const results = useSelector((state) => {
        const r = state.getIn(['results'])
        if (typeof r.toJS === 'function') return r.toJS()
        return r
    })

    const paging = useSelector((state) => state.getIn(['resultsPaging'])).toJS()

    let width = 0
    if (mobile) width = '100%'
    else if (w.results)
        width = `calc(100vw - ${w.secondary ? w.secondarySize : '0%'} - ${
            w.filters ? (filterType === 'basic' ? w.filtersSize : w.advancedFiltersSize) : '0%'
        } - ${theme.headHeights[1]}px)`
    const style = {
        width,
    }

    return (
        <div className={c.ResultsPanel} style={style}>
            <div className={c.contents}>
                <Heading activeView={activeView} />
                <div className={c.tabs}>
                    <StyledTabs
                        value={activeViews.indexOf(activeView)}
                        onChange={(e, v) => {
                            setActiveView(activeViews[v])
                        }}
                        aria-label="results view tab"
                    >
                        {activeViews.map((v, i) => (
                            <StyledTab label={v} key={i} {...a11yProps(i)} />
                        ))}
                    </StyledTabs>

                    <div className={c.numResults}>
                        {results.length > 0 &&
                            `${abbreviateNumber(results.length)}
                                   of ${abbreviateNumber(paging.total)}`}
                    </div>
                </div>
                <div className={c.content}>
                    {activeView === 'grid' ? <GridView results={results} paging={paging} /> : null}
                    {activeView === 'list' ? <ListView results={results} paging={paging} /> : null}
                    {activeView === 'table' ? (
                        <TableView results={results} paging={paging} />
                    ) : null}
                    <ResultsStatus />
                </div>
                <div className={c.footing}>
                    <div className={c.left}>
                        <div
                            className={c.maxPage}
                            style={{ display: paging.page == 99 ? 'inherit' : 'none' }}
                        >
                            - You've hit the end but there's still more! Try narrowing your search
                            on the left.
                        </div>
                    </div>
                    <div className={c.right}></div>
                    <div className={c.gradient} />
                </div>
            </div>
        </div>
    )
}

ResultsPanel.propTypes = {}

export default ResultsPanel
