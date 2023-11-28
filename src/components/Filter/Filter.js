import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import {
    setModal,
    removeActiveFilters,
    clearResults,
    search,
} from '../../core/redux/actions/actions.js'

import MuiAccordion from '@material-ui/core/Accordion'
import MuiAccordionSummary from '@material-ui/core/AccordionSummary'
import MuiAccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Badge from '@material-ui/core/Badge'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import SettingsIcon from '@material-ui/icons/Settings'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined'

import InputFilter from './subcomponents/InputFilter/InputFilter'
import ListFilter from './subcomponents/ListFilter/ListFilter'
import SliderRangeFilter from './subcomponents/SliderRangeFilter/SliderRangeFilter'
import InputRangeFilter from './subcomponents/InputRangeFilter/InputRangeFilter'
import DateRangeFilter from './subcomponents/DateRangeFilter/DateRangeFilter'

const Accordion = withStyles({
    root: {
        'boxShadow': 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
        'position': 'inherit',
        'overflow': 'hidden',
        'borderRadius': '0 !important',
    },
    expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles((theme) => ({
    root: {
        'borderBottom': `1px solid ${theme.palette.swatches.grey.grey200}`,
        'height': theme.headHeights[2],
        'minHeight': theme.headHeights[2],
        'flexDirection': 'row-reverse',
        'background': theme.palette.swatches.grey.grey100,
        'color': theme.palette.text.primary,
        'boxSizing': 'border-box',
        'zIndex': 2,
        'borderLeft': '2px solid rgba(0,0,0,0)',
        'borderRight': `1px solid ${theme.palette.swatches.grey.grey200}`,
        'transition': 'background 0.2s ease-out, border 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey150,
        },
        '&$expanded': {
            minHeight: theme.headHeights[2],
            background: theme.palette.swatches.grey.grey150,
            borderLeft: `4px solid ${theme.palette.swatches.yellow.yellow600}`,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expandIcon: {
        margin: '0px 0px 0px -12px',
        color: theme.palette.swatches.grey.grey700,
        overflow: 'hidden',
        padding: '9px 12px',
    },
    expanded: {},
}))(MuiAccordionSummary)

const AccordionDetails = withStyles((theme) => ({
    root: {
        padding: `${theme.spacing(2)}px 0px`,
        background: theme.palette.swatches.grey.grey0,
        boxShadow: `inset 2px 2px 3px 0px rgba(0,0,0,0.12)`,
        flexFlow: 'column',
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        borderRight: `1px solid ${theme.palette.swatches.grey.grey200}`,
        borderLeft: `4px solid ${theme.palette.swatches.yellow.yellow600}`,
    },
}))(MuiAccordionDetails)

const useStyles = makeStyles((theme) => ({
    Filter: {},
    title: {
        lineHeight: '30px',
        textTransform: 'capitalize',
        maxWidth: '190px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    header: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
    },
    headerButtons: {},
    settingsButton: {
        'fontSize': 16,
        'padding': '7px',
        'color': theme.palette.swatches.grey.grey400,
        'borderRadius': '3px',
        'transition': 'color 0.2s ease-out, background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.accent.main,
            color: theme.palette.text.secondary,
        },
    },
    settingsButtonActive: {
        background: theme.palette.accent.main,
        color: theme.palette.text.secondary,
    },
    infoButton: {
        'fontSize': 16,
        'padding': '7px',
        'color': theme.palette.swatches.grey.grey400,
        'borderRadius': '3px',
        'transition': 'color 0.2s ease-out, background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.accent.main,
            color: theme.palette.text.secondary,
        },
    },
    removeButton: {
        'fontSize': 16,
        'padding': '7px',
        'color': theme.palette.swatches.grey.grey400,
        'borderRadius': '3px',
        'transition': 'color 0.2s ease-out, background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.red.red500,
            color: theme.palette.text.secondary,
        },
    },
    list: {
        padding: theme.spacing(1),
        margin: 0,
        listStyleType: 'none',
    },
    countBadge: {
        '& .MuiBadge-badge': {
            background: theme.palette.swatches.red.red500,
            color: theme.palette.text.secondary,
            right: -12,
            top: 15,
            border: `2px solid ${theme.palette.swatches.grey.grey100}`,
            padding: '0px 4px 0px 3px',
        },
    },
}))

const getSubFilters = (filter, filterKey, settingsActive) => {
    let subFilters = []

    filter.facets.forEach((facet, i) => {
        switch (facet.component) {
            case 'text':
                subFilters.push(
                    <InputFilter
                        key={i}
                        facetId={i}
                        filterKey={filterKey}
                        alone={false}
                        settingsActive={settingsActive}
                    />
                )
                break
            case 'number':
                subFilters.push(
                    <InputFilter
                        key={i}
                        facetId={i}
                        filterKey={filterKey}
                        alone={false}
                        type="number"
                        settingsActive={settingsActive}
                    />
                )
                break
            case 'list':
                subFilters.push(
                    <ListFilter
                        key={i}
                        facetId={i}
                        filterKey={filterKey}
                        alone={filter.facets.length === 1}
                        settingsActive={settingsActive}
                    />
                )
                break
            case 'slider_range':
                subFilters.push(
                    <SliderRangeFilter
                        key={i}
                        facetId={i}
                        filterKey={filterKey}
                        alone={filter.facets.length === 1}
                        settingsActive={settingsActive}
                    />
                )
                break
            case 'input_range':
                subFilters.push(
                    <InputRangeFilter
                        key={i}
                        facetId={i}
                        filterKey={filterKey}
                        alone={filter.facets.length === 1}
                        settingsActive={settingsActive}
                    />
                )
                break
            case 'date_range':
                subFilters.push(
                    <DateRangeFilter
                        key={i}
                        facetId={i}
                        filterKey={filterKey}
                        alone={filter.facets.length === 1}
                        settingsActive={settingsActive}
                    />
                )
                break
            default:
                console.warn(`Unknown facet type ${facet.component}.`)
                break
        }
    })
    return subFilters
}

const Filter = (props) => {
    const { filterKey, filter, onExpand, expanded } = props
    const c = useStyles()

    const dispatch = useDispatch()

    const [settingsActive, setSettingsActive] = useState(false)

    const subFilters = getSubFilters(filter, filterKey, settingsActive)

    // Hide delete button?
    let permanent = filterKey[0] === '_' ? true : false

    const handleSettings = (e) => {
        // stop expand/collapse
        e.stopPropagation()
        if (expanded) setSettingsActive(!settingsActive)
    }
    const handleInfo = (e) => {
        // stop expand/collapse
        e.stopPropagation()

        dispatch(
            setModal('filterHelp', {
                filter,
                filterKey,
            })
        )
    }
    const handleRemove = (e) => {
        // stop expand/collapse
        e.stopPropagation()

        dispatch(removeActiveFilters(filterKey))
        dispatch(clearResults())
        dispatch(search(0, true))
    }

    const filterName = filter.display_name || filterKey

    // Turns a:b:c into ::c
    let friendlyFilterName = filterName
    if (friendlyFilterName.includes(':'))
        friendlyFilterName = `${friendlyFilterName.replace(/[^:]/g, '')}${friendlyFilterName
            .split(':')
            .slice(-1)}`

    let count = 0
    if (filter.facets)
        filter.facets.forEach((f) => {
            if (f.state)
                Object.keys(f.state).forEach((key) => {
                    if (f.state[key] != false && f.state[key] != '' && f.state[key] != null) count++
                })
        })

    return (
        <div className={c.Filter}>
            <Accordion expanded={expanded}>
                <AccordionSummary
                    className="stickyHeader"
                    expandIcon={<ExpandMoreIcon />}
                    onClick={onExpand}
                    role=""
                >
                    <div className={c.header}>
                        <Badge className={c.countBadge} badgeContent={count}>
                            <Tooltip title={filterKey} arrow placement="right">
                                <Typography className={c.title}>{friendlyFilterName}</Typography>
                            </Tooltip>
                        </Badge>
                        <div className={c.headerButtons}>
                            {expanded && (
                                <Tooltip title="Settings" arrow>
                                    <IconButton
                                        className={clsx(c.settingsButton, {
                                            [c.settingsButtonActive]: settingsActive,
                                        })}
                                        aria-label={`show settings for ${filterName} filter`}
                                        size="small"
                                        onClick={handleSettings}
                                    >
                                        <SettingsIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="Info" arrow>
                                <IconButton
                                    className={c.infoButton}
                                    aria-label={`information about ${filterName} filter`}
                                    size="small"
                                    onClick={handleInfo}
                                >
                                    <InfoOutlinedIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                            {!permanent ? (
                                <Tooltip title="Remove" arrow>
                                    <IconButton
                                        className={c.removeButton}
                                        aria-label={`remove ${filterName} filter`}
                                        size="small"
                                        onClick={handleRemove}
                                    >
                                        <DeleteOutlinedIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>{subFilters}</AccordionDetails>
            </Accordion>
        </div>
    )
}

Filter.propTypes = {
    filter: PropTypes.object.isRequired,
    filterKey: PropTypes.string.isRequired,
    onExpand: PropTypes.func.isRequired,
    expanded: PropTypes.bool,
}

export default Filter
