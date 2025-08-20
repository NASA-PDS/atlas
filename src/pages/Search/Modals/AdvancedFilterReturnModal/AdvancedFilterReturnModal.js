import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { setModal, setFilterType, resetFilters } from '../../../../core/redux/actions/actions.js'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import CloseSharpIcon from '@mui/icons-material/CloseSharp'

import { makeStyles } from '@mui/styles'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

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
        padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(4)}`,
    },
    title: {
        width: '100%',
        padding: `${theme.spacing(2.5)} 0`,
        margin: `${theme.spacing(3)} 0px ${theme.spacing(1)} 0px`,
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
        'padding': `0px ${theme.spacing(8)} ${theme.spacing(2)} ${theme.spacing(8)}`,
        'height': `calc(100% - ${theme.headHeights[2]}px)`,
        '& > div': {
            display: 'flex',
            justifyContent: 'space-between',
            margin: `${theme.spacing(6)} 0px ${theme.spacing(3)} 0px`,
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
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

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
                    size="large">
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
    );
}

AdvancedFilterReturnModal.propTypes = {}

export default AdvancedFilterReturnModal
