import React, { useState, useEffect } from 'react'
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
import CloseSharpIcon from '@material-ui/icons/CloseSharp'

import { makeStyles, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import FilterHelp from '../../../../components/FilterHelp/FilterHelp'

const useStyles = makeStyles((theme) => ({
    FilterHelpModal: {
        margin: theme.headHeights[1],
        height: `calc(100% - ${theme.headHeights[1] * 2}px)`,
    },
    contents: {
        background: theme.palette.primary.main,
        height: '100%',
        width: '800px',
        borderRadius: 0,
    },
    contentsMobile: {
        background: theme.palette.primary.main,
        height: '100%',
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
    filterHelp: {},
}))

const FilterHelpModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'filterHelp'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })
    const open = modal !== false
    const handleClose = () => {
        // close modal
        dispatch(setModal(false))
    }

    return (
        <Dialog
            className={c.FilterHelpModal}
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            PaperProps={{
                className: isMobile ? c.contentsMobile : c.contents,
            }}
        >
            <DialogTitle className={c.heading}>
                <div className={c.flexBetween}>
                    <div className={c.title}>
                        {modal?.filter?.display_name || modal?.filterKey} Filter Details
                    </div>
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
                {open ? (
                    <FilterHelp
                        className={c.filterHelp}
                        filter={modal.filter}
                        filterKey={modal.filterKey}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}

FilterHelpModal.propTypes = {}

export default FilterHelpModal
