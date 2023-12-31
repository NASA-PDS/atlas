import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { setModal, setFilterType, resetFilters } from '../../../../core/redux/actions/actions.js'

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
    AdvancedFilterReturnModal: {
        margin: theme.headHeights[1],
    },
    contents: {
        background: theme.palette.primary.main,
        width: '575px',
        borderRadius: 0,
    },
    contentsMobile: {
        background: theme.palette.primary.main,
        height: '100%',
    },
    heading: {
        position: 'relative',
        boxSizing: 'border-box',
        padding: `0 ${theme.spacing(2)}px 0 ${theme.spacing(4)}px`,
    },
    title: {
        width: '100%',
        padding: `${theme.spacing(2.5)}px 0`,
        margin: `${theme.spacing(3)}px 0px ${theme.spacing(1)}px 0px`,
        fontSize: theme.typography.pxToRem(20),
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '32px',
    },
    closeIcon: {
        padding: theme.spacing(1.5),
        width: theme.headHeights[2],
        height: theme.headHeights[2],
        position: 'absolute',
        top: '0px',
        right: '0px',
    },
    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    content: {
        'padding': `0px ${theme.spacing(8)}px ${theme.spacing(2)}px ${theme.spacing(8)}px`,
        'height': `calc(100% - ${theme.headHeights[2]}px)`,
        '& > div': {
            display: 'flex',
            justifyContent: 'space-between',
            margin: `${theme.spacing(6)}px 0px ${theme.spacing(3)}px 0px`,
        },
        '& > p': {
            marginTop: '0px',
            fontSize: '16px',
        },
    },
    proceed: {
        color: theme.palette.text.secondary,
    },
}))

const getBasicFiltersFromAdvanced = (activeFilters, advancedFiltersExpression, atlasMapping) => {
    console.log(activeFilters, advancedFiltersExpression, atlasMapping)

    // First turn the expression into basic filter states
    // { common.target: { atlas: true } }
    const advancedStates = {}
    const depthTraversalExpression = (node) => {
        if (node.field) {
            advancedStates[node.field] = advancedStates[node.field] || {}
            advancedStates[node.field][node.term] = true
        }
        if (node.left) {
            depthTraversalExpression(node.left)
        }
        if (node.right) {
            depthTraversalExpression(node.right)
        }
    }
    depthTraversalExpression(advancedFiltersExpression)
    console.log(advancedStates)

    // Now cross that with atlasMapping to build new filters
    const desiredFilters = {}
    Object.keys(advancedStates).forEach((key) => {
        let filter = atlasMapping.groups
        const splitKey = key.split('.')
        for (let i = 0; i < splitKey.length; i++) {
            filter = filter?.[splitKey[i]]
            if (filter == null) return
            if (i < splitKey.length - 1) filter = filter.filters
        }

        if (filter.facets == null) return
        filter.facets.forEach((f) => {
            if (f.field === key) f.state = advancedStates[key]
        })
        desiredFilters[splitKey[splitKey.length - 1]] = filter
    })
    console.log(desiredFilters)
}

const AdvancedFilterReturnModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'advancedFilterReturn'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })
    const open = modal !== false
    const handleClose = () => {
        // close modal
        dispatch(setModal(false))
    }
    const handleProceed = () => {
        dispatch(setFilterType('basic', true))
        dispatch(resetFilters())
        handleClose()
    }

    const activeFilters = useSelector((state) => {
        const m = state.getIn(['activeFilters'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })
    const advancedFiltersExpression = useSelector((state) => {
        const m = state.getIn(['advancedFiltersExpression'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })
    const atlasMapping = useSelector((state) => {
        return state.getIn(['mappings', 'atlas'])
    })

    if (open) {
        if (advancedFiltersExpression.isError != true) {
            // This needs to be complicated to be useful
            //getBasicFiltersFromAdvanced(activeFilters, advancedFiltersExpression, atlasMapping)
        } else {
        }
    }

    return (
        <Dialog
            className={c.AdvancedFilterReturnModal}
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            PaperProps={{
                className: isMobile ? c.contentsMobile : c.contents,
            }}
        >
            <DialogTitle className={c.heading}>
                <div className={c.title}>Advanced Search Warning</div>
                <IconButton
                    className={c.closeIcon}
                    title="Close"
                    aria-label="close"
                    onClick={handleClose}
                >
                    <CloseSharpIcon fontSize="inherit" />
                </IconButton>
            </DialogTitle>
            <DialogContent className={c.content}>
                <p>
                    The provided advanced search query contains search parameters that cannot be
                    converted to a basic search query at this time.
                </p>
                <p>
                    If you proceed, your search results will differ from those provided in advanced
                    search.
                </p>
                <div>
                    <Button
                        className={c.proceed}
                        variant="contained"
                        size="small"
                        onClick={handleProceed}
                    >
                        Proceed to Basic Filters
                    </Button>
                    <Button
                        className={c.continue}
                        variant="outlined"
                        size="small"
                        onClick={handleClose}
                    >
                        Continue Using Advanced Filters
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

AdvancedFilterReturnModal.propTypes = {}

export default AdvancedFilterReturnModal
