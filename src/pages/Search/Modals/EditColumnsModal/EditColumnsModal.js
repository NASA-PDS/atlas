import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import { setModal, setResultsTableColumns } from '../../../../core/redux/actions/actions.js'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseSharpIcon from '@material-ui/icons/CloseSharp'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import LabelsTree from './subcomponents/LabelsTree/LabelsTree'

const useStyles = makeStyles((theme) => ({
    EditColumnsModal: {
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
        maxWidth: '800px',
        overflow: 'hidden',
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
    button1: {
        color: theme.palette.text.secondary,
        fontSize: '11px',
        lineHeight: '20px',
        margin: '3px 3px',
        background: theme.palette.accent.main,
    },
    resetButton: {
        'background': theme.palette.swatches.grey.grey800,
        '&:hover': {
            background: theme.palette.swatches.black.black0,
        },
    },
    cancelButton: {
        'background': theme.palette.swatches.grey.grey800,
        '&:hover': {
            background: theme.palette.swatches.black.black0,
        },
    },
}))

const EditColumnsModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const open = useSelector((state) => {
        return state.getIn(['modals', 'editColumns'])
    })

    const resultsTable = useSelector((state) => {
        const r = state.getIn(['resultsTable'])
        if (typeof r.toJS === 'function') return r.toJS()
        return r
    })
    const [columns, setColumns] = useState(resultsTable.columns || [])

    const handleReset = () => {
        dispatch(setResultsTableColumns(resultsTable.defaultColumns))
        setColumns(resultsTable.defaultColumns)
    }
    const handleClose = () => {
        setColumns(resultsTable.columns)
        // close modal
        dispatch(setModal(false))
    }
    const handleSubmit = () => {
        dispatch(setResultsTableColumns(columns))
        // close modal
        dispatch(setModal(false))
    }

    return (
        <Dialog
            className={c.EditColumnsModal}
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
            PaperProps={{
                className: c.contents,
            }}
        >
            <DialogTitle className={c.heading}>
                <div className={c.flexBetween}>
                    <div className={c.title}>Edit Product Label Columns</div>
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
                <LabelsTree columns={columns} setColumns={setColumns} />
            </DialogContent>
            <DialogActions>
                <div>
                    <Button
                        className={clsx(c.button1, c.resetButton)}
                        variant="contained"
                        onClick={handleReset}
                    >
                        Reset to Defaults
                    </Button>
                </div>
                <div>
                    <Button
                        className={clsx(c.button1, c.cancelButton)}
                        variant="contained"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button className={c.button1} variant="contained" onClick={handleSubmit}>
                        Apply Changes
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    )
}

EditColumnsModal.propTypes = {}

export default EditColumnsModal
