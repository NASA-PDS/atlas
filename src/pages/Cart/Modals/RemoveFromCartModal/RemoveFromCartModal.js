import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { setModal, removeFromCart } from '../../../../core/redux/actions/actions.js'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseSharpIcon from '@material-ui/icons/CloseSharp'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const useStyles = makeStyles((theme) => ({
    RemoveFromCartModal: {
        margin: theme.headHeights[1],
    },
    contents: {
        background: theme.palette.primary.main,
        width: '400px',
        maxWidth: '400px',
    },
    contentsMobile: {
        background: theme.palette.primary.main,
        height: '100%',
    },
    content: {
        padding: '20px 40px 8px 40px',
        height: `calc(100% - ${theme.headHeights[2]}px)`,
        textAlign: 'center',
    },
    closeModal: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: theme.spacing(1.5),
        margin: '4px !important',
    },
    title: {
        margin: '-7px 0px 20px 0px',
        padding: '0px 2px',
        fontSize: '18px',
        fontWeight: 700,
        lineHeight: '18px',
    },
    message: {
        margin: '0px 0px 8px 0px',
        fontSize: '16px',
    },
    footer: {
        'display': 'flex',
        'justifyContent': 'center',
        '& .MuiButton-text': {
            color: theme.palette.primary.light,
        },
    },
    button1: {
        height: 30,
        margin: '7px 3px',
        background: theme.palette.primary.light,
    },
    button2: {
        height: 30,
        margin: '7px 3px',
        color: theme.palette.text.primary,
    },
}))

const RemoveFromCartModal = (props) => {
    const {} = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const dispatch = useDispatch()
    const modal = useSelector((state) => {
        const m = state.getIn(['modals', 'removeFromCart'])
        if (typeof m.toJS === 'function') return m.toJS()
        return m
    })
    const open = modal !== false
    const handleClose = () => {
        // close modal
        dispatch(setModal(false))
    }

    let title = ''
    let message = ''
    switch (modal.type) {
        case 'single':
            title = 'Remove Item'
            message = 'Are you sure you want to remove this item from your download cart?'
            break
        case 'selected':
            title = 'Remove Selected Items'
            message = 'Are you sure you want to remove the selected items from your download cart?'
            break
        case 'all':
            title = 'Empty Bulk Download Cart'
            message = 'Are you sure you want to empty your download cart?'
            break
        default:
    }

    return (
        <Dialog
            className={c.RemoveFromCartModal}
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
            PaperProps={{
                className: isMobile ? c.contentsMobile : c.contents,
            }}
        >
            <DialogContent className={c.content}>
                <Typography className={c.title} variant="h2">
                    {title}
                </Typography>
                <Typography className={c.message}>{message}</Typography>
            </DialogContent>
            <DialogActions className={c.footer}>
                <Button
                    className={c.button1}
                    variant="contained"
                    aria-label="yes button"
                    size="small"
                    onClick={() => {
                        dispatch(removeFromCart(modal.index))
                        dispatch(setModal(false))
                    }}
                >
                    Yes
                </Button>
                <Button
                    className={c.button2}
                    variant="outlined"
                    aria-label="no button"
                    size="small"
                    onClick={handleClose}
                >
                    No
                </Button>

                <IconButton
                    className={c.closeModal}
                    aria-label={`close modal`}
                    size="small"
                    onClick={handleClose}
                >
                    <CloseSharpIcon />
                </IconButton>
            </DialogActions>
        </Dialog>
    )
}

RemoveFromCartModal.propTypes = {}

export default RemoveFromCartModal
