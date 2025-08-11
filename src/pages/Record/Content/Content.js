import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles, useTheme } from '@mui/material/styles'

import { getIn, objectArrayIndexOfKeyWithValue } from '../../../core/utils'
import { ES_PATHS } from '../../../core/constants'
import { setRecordViewTab } from '../../../core/redux/actions/actions.js'

import ViewTabs from './ViewTabs/ViewTabs'

// View components
import Overview from './Views/Overview/Overview'
import ProductLabel from './Views/ProductLabel/ProductLabel'
import MLClassification from './Views/MLClassification/MLClassification'
import Help from './Views/Help/Help'

const VIEW_TABS = [
    { id: 'overview', component: Overview },
    { id: 'product label', component: ProductLabel },
    {
        id: 'ml classification',
        component: MLClassification,
        condition: ES_PATHS.ml_classification_related,
    },
    //{ id: 'help', component: Help },
]

const useStyles = makeStyles((theme) => ({
    Content: {
        width: '100%',
        height: `calc(100% - ${theme.headHeights[1]}px)`,
        display: 'flex',
        flexFlow: 'column',
    },
    component: {
        flex: 1,
        overflowY: 'auto',
    },
}))

const Content = (props) => {
    const { recordData, versions, activeVersion } = props
    const c = useStyles()

    const dispatch = useDispatch()
    const theme = useTheme()

    const recordViewTab = useSelector((state) => {
        return state.get('recordViewTab')
    })

    // When navigating away, reset the view tab to the overview tab
    useEffect(() => {
        return () => {
            // eslint-disable-next-line security/detect-object-injection
            dispatch(setRecordViewTab(VIEW_TABS[0].id))
        }
    }, [])

    // Find the current view component
    let ViewComponent = null
    const viewTabIndex = objectArrayIndexOfKeyWithValue(VIEW_TABS, 'id', recordViewTab)
    if (VIEW_TABS[viewTabIndex] != null) ViewComponent = VIEW_TABS[viewTabIndex].component

    return (
        <div
            className={c.Content}
            style={{
                height: `calc(100% - ${theme.headHeights[1]}px - ${
                    activeVersion != 0 && activeVersion != null && versions.length > 0 ? 29.5 : 0
                }px)`,
            }}
        >
            <ViewTabs
                recordViewTab={recordViewTab}
                VIEW_TABS={VIEW_TABS.filter(
                    (v) => v.condition == null || getIn(recordData, v.condition) != null
                ).map((v) => v.id)}
            />
            <div className={c.component}>
                <ViewComponent
                    recordData={recordData}
                    versions={versions}
                    activeVersion={activeVersion}
                />
            </div>
        </div>
    )
}

Content.propTypes = {
    recordData: PropTypes.object.isRequired,
}

export default Content
