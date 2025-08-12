import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import {
    setModal,
    addActiveFilters,
    removeActiveFilters,
    search,
} from '../../../../core/redux/actions/actions.js'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import CloseSharpIcon from '@mui/icons-material/CloseSharp'

import { makeStyles, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import FilterTree from './subcomponents/FilterTree/FilterTree'

const useStyles = makeStyles((theme) => ({
    AddFilterModal: {
        margin: theme.headHeights[1],
        height: `calc(100% - ${theme.headHeights[1] * 2}px)`,
        [theme.breakpoints.down('xs')]: {
            margin: '6px',
            height: `calc(100% - 12px)`,
        },
    },
    contents: {
        background: theme.palette.primary.main,
        height: '100%',
        maxWidth: '1300px',
    },
    heading: {
        height: theme.headHeights[2],
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey150,
        padding: `0 ${theme.spacing(2)}px 0 ${theme.spacing(4)}px`,
    },
    title: {
        padding: `${theme.spacing(2.5)}px 0`,
        fontSize: theme.typography.pxToRem(16),
        fontWeight: 'bold',
    },
    content: {
        padding: '0px',
        height: `calc(100% - ${theme.headHeights[2]}px)`,
    },
    closeIcon: {
        padding: theme.spacing(1.5),
        height: '100%',
        margin: '4px 0px',
    },
    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    addCount: {
        padding: theme.spacing(1.5),
        fontSize: '14px',
        color: theme.palette.swatches.grey.grey800,
    },
    addSelected: {
        backgroundColor: theme.palette.primary.light,
        padding: '3px 8px',
        fontSize: '11px',
        marginRight: '3px',
    },
}))

const AddFilterModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const open = useSelector((state) => {
        return state.getIn(['modals', 'addFilter'])
    })

    const activeFilters = useSelector((state) => {
        return state.get('activeFilters').toJS()
    })

    const [stagedFiltersToAdd, setStagedFiltersToAdd] = useState({})
    const [stagedFiltersToRemove, setStagedFiltersToRemove] = useState({})

    const addStagedFilter = (id, filter) => {
        // Remove from remove if it's there
        let nextStagedFiltersToRemove = JSON.parse(JSON.stringify(stagedFiltersToRemove))
        if (nextStagedFiltersToRemove[id]) delete nextStagedFiltersToRemove[id]
        setStagedFiltersToRemove(nextStagedFiltersToRemove)

        // If it's not an already active filter, stage it to be added
        let nextStagedFiltersToAdd = JSON.parse(JSON.stringify(stagedFiltersToAdd))
        if (!activeFilters[id]) nextStagedFiltersToAdd[id] = filter
        setStagedFiltersToAdd(nextStagedFiltersToAdd)
    }

    const removeStagedFilter = (id) => {
        // Remove from add is it's there
        let nextStagedFiltersToAdd = JSON.parse(JSON.stringify(stagedFiltersToAdd))
        if (nextStagedFiltersToAdd[id]) delete nextStagedFiltersToAdd[id]
        setStagedFiltersToAdd(nextStagedFiltersToAdd)

        // If it's an already active filter, stage it to be removed
        let nextStagedFiltersToRemove = JSON.parse(JSON.stringify(stagedFiltersToRemove))
        if (activeFilters[id]) nextStagedFiltersToRemove[id] = true
        setStagedFiltersToRemove(nextStagedFiltersToRemove)
    }

    // active for the current state of the add filter modal
    // join active and stagedAdd then remove stagedRemove
    const activeFilterIds = Object.keys(activeFilters)
        .concat(Object.keys(stagedFiltersToAdd))
        .filter((x) => !Object.keys(stagedFiltersToRemove).includes(x))

    const handleClose = () => {
        // close modal
        dispatch(setModal(false))

        // clear staged filters
        setStagedFiltersToAdd({})
        setStagedFiltersToRemove({})
    }
    const handleSubmit = () => {
        // submit staged filters
        dispatch(addActiveFilters(stagedFiltersToAdd))
        dispatch(removeActiveFilters(Object.keys(stagedFiltersToRemove)))
        // search to update all facet buckets and fields (even if search results don't change)
        // and to start at page 1
        dispatch(search(0, true))

        // and then close
        handleClose()
    }

    return (
        <Dialog
            className={c.AddFilterModal}
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            PaperProps={{
                className: c.contents,
            }}
        >
            <DialogTitle className={c.heading}>
                <div className={c.flexBetween}>
                    <div className={c.title}>Select filter(s) to add to your search</div>
                    <IconButton
                        className={c.closeIcon}
                        title="Close"
                        aria-label="close"
                        onClick={handleClose}
                    >
                        <CloseSharpIcon fontSize="inherit" />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent className={c.content}>
                <FilterTree
                    activeFilterIds={activeFilterIds}
                    addStagedFilter={addStagedFilter}
                    removeStagedFilter={removeStagedFilter}
                />
            </DialogContent>
            <DialogActions>
                <Typography className={c.addCount}>{`${
                    Object.keys(stagedFiltersToAdd).length
                } new filter${
                    Object.keys(stagedFiltersToAdd).length === 1 ? '' : 's'
                } selected`}</Typography>
                <Button className={c.addSelected} variant="contained" onClick={handleSubmit}>
                    Add Selected Filters
                </Button>
            </DialogActions>
        </Dialog>
    )
}

AddFilterModal.propTypes = {}

export default AddFilterModal
