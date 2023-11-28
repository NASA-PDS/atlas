import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { prettify } from '../../../../core/utils.js'

import { setRecordViewTab } from '../../../../core/redux/actions/actions.js'

const useStyles = makeStyles((theme) => ({
    ViewTabs: {
        height: theme.headHeights[2],
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
        color: theme.palette.text.main,
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
        'color': theme.palette.text.main,
        'fontSize': theme.typography.pxToRem(14),
        'marginRight': theme.spacing(1),
        'minWidth': 88,
        '&:focus': {
            opacity: 1,
        },
    },
}))((props) => <Tab disableRipple {...props} />)

const ViewTabs = (props) => {
    const { recordViewTab, VIEW_TABS } = props
    const c = useStyles()

    const dispatch = useDispatch()

    const handleChange = (event, newTabIndex) => {
        // eslint-disable-next-line security/detect-object-injection
        dispatch(setRecordViewTab(VIEW_TABS[newTabIndex]))
    }

    return (
        <div className={c.ViewTabs}>
            <StyledTabs
                value={VIEW_TABS.indexOf(recordViewTab)}
                onChange={handleChange}
                aria-label="record view tab"
            >
                {VIEW_TABS.map((v, i) => (
                    <StyledTab label={prettify(v)} key={i} {...a11yProps(i)} />
                ))}
            </StyledTabs>
        </div>
    )
}

ViewTabs.propTypes = {
    recordViewTab: PropTypes.string.isRequired,
    VIEW_TABS: PropTypes.array.isRequired,
}

export default ViewTabs
