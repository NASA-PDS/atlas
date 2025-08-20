import React from 'react'
import { useSelector } from 'react-redux'

import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles } from '@mui/styles'
import { useTheme } from '@mui/material/styles'

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

    const c = useStyles()

    const mobileWorkspace = useSelector((state) => {
        return state.getIn(['workspace', 'mobile'])
    })

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

export default Search;
