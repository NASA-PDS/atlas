import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import ReactMarkdown from 'react-markdown'

import { setModal } from '../../../../core/redux/actions/actions.js'

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

const useStyles = makeStyles((theme) => ({
    AdvancedFilterModal: {
        margin: theme.headHeights[1],
        height: `calc(100% - ${theme.headHeights[1] * 2}px)`,
    },
    contents: {
        background: theme.palette.primary.main,
        width: '480px',
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
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
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
}))

const AdvancedFilterModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'advancedFilter'])
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
            className={c.AdvancedFilterModal}
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
                        {modal?.filter?.display_name || modal?.filterKey} Advanced Filter Help
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
                <ReactMarkdown>
                    {[
                        `Atlas' Advanced Filtering uses Elasticsearch's Query String (Apache's Lucene) query syntax:  \n`,
                        `https://www.elastic.co/guide/en/elasticsearch/reference/7.10/query-dsl-query-string-query.html#query-string-syntax  \n`,
                        `#### Shortcuts`,
                        `Submit Query: *ctrl/cmd + enter*  \n`,
                        `Autocomplete: *ctrl/cmd + shift*`,
                    ].join('\n')}
                </ReactMarkdown>
            </DialogContent>
        </Dialog>
    )
}

AdvancedFilterModal.propTypes = {}

export default AdvancedFilterModal
