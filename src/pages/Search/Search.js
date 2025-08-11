import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles, useTheme } from '@mui/material/styles'
import withWidth from '@mui/material/withWidth'

import FiltersPanel from './Panels/FiltersPanel/FiltersPanel'
import SecondaryPanel from './Panels/SecondaryPanel/SecondaryPanel'
import ResultsPanel from './Panels/ResultsPanel/ResultsPanel'

import AddFilterModal from './Modals/AddFilterModal/AddFilterModal'
import FilterHelpModal from './Modals/FilterHelpModal/FilterHelpModal'
import EditColumnsModal from './Modals/EditColumnsModal/EditColumnsModal'
import AdvancedFilterModal from './Modals/AdvancedFilterModal/AdvancedFilterModal'
import AdvancedFilterReturnModal from './Modals/AdvancedFilterReturnModal/AdvancedFilterReturnModal'

const useStyles = makeStyles((theme) => ({
    Search: {
        width: '100%',
        height: '100%',
        display: 'flex',
        color: theme.palette.text.primary,
    },
    mainWorkspace: {
        padding: 0,
        height: '100%',
    },
    workspace: {
        display: 'flex',
        flex: 1,
    },
}))

const Search = (props) => {
    const { width } = props
    const c = useStyles()

    const mobileWorkspace = useSelector((state) => {
        return state.getIn(['workspace', 'mobile'])
    })

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    // If mobile
    if (isMobile) {
        let panel
        switch (mobileWorkspace) {
            case 'filters':
                panel = <FiltersPanel mobile={true} />
                break
            case 'secondary':
                panel = <SecondaryPanel mobile={true} />
                break
            default:
                panel = <ResultsPanel mobile={true} />
        }

        return (
            <div className={c.Search}>
                <div className={c.workspace}>{panel}</div>
                <AddFilterModal />
                <FilterHelpModal />
                <EditColumnsModal />
                <AdvancedFilterModal />
                <AdvancedFilterReturnModal />
            </div>
        )
    }
    return (
        <div className={c.Search}>
            <div className={`${c.mainWorkspace} ${c.workspace}`}>
                <FiltersPanel />
                <div className={c.workspace}>
                    <SecondaryPanel />
                    <ResultsPanel />
                </div>
            </div>
            <AddFilterModal />
            <FilterHelpModal />
            <EditColumnsModal />
            <AdvancedFilterModal />
            <AdvancedFilterReturnModal />
        </div>
    )
}

Search.propTypes = {}

export default withWidth()(Search)
