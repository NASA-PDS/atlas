import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { useLocation, useHistory } from 'react-router-dom'
import { HASH_PATHS } from '../../../core/constants'

import { getIn } from '../../../core/utils'

import { makeStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'

import { removeFromCart, setModal } from '../../../core/redux/actions/actions.js'

const useStyles = makeStyles((theme) => ({
    Title: {
        display: 'flex',
        justifyContent: 'space-between',
        height: theme.headHeights[1],
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey100,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    left: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    right: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 8px 4px 4px',
    },
    back: {},
    backButton: {
        padding: 2,
        borderRadius: 0,
    },
    backIcon: {
        fontSize: 36,
        color: theme.palette.text.primary,
    },
    name: {
        margin: `0px ${theme.spacing(1)}px`,
    },
    nameTitle: {
        fontSize: 18,
        lineHeight: '39px',
        fontWeight: 'bold',
    },
    button1: {
        color: theme.palette.text.secondary,
        fontSize: '11px',
        lineHeight: '11px',
        margin: '3px 3px 3px 3px',
        background: theme.palette.accent.main,
    },
}))

const Title = (props) => {
    const { mobile } = props

    const c = useStyles()

    const history = useHistory()

    const dispatch = useDispatch()

    if (mobile) {
        return (
            <div className={c.Title}>
                <div className="left"></div>
                <div className="right"></div>
            </div>
        )
    }

    return (
        <div className={c.Title}>
            <div className={c.left}>
                <div className={c.back}>
                    <Tooltip title="Back" arrow>
                        <IconButton
                            className={c.backButton}
                            aria-label="return"
                            onClick={() => {
                                history.goBack()
                            }}
                        >
                            <ChevronLeftIcon className={c.backIcon} />
                        </IconButton>
                    </Tooltip>
                </div>
                <div className={c.name}>
                    <Typography className={c.nameTitle} variant="h2">
                        Bulk Download Cart
                    </Typography>
                </div>
            </div>
            <div className={c.right}>
                <Button
                    className={c.button1}
                    variant="contained"
                    aria-label="remove selected items button"
                    size="small"
                    onClick={() =>
                        dispatch(setModal('removeFromCart', { type: 'selected', index: 'checked' }))
                    }
                >
                    Remove Selected Items
                </Button>
                <Button
                    className={c.button1}
                    variant="outlined"
                    aria-label="empty cart button"
                    size="small"
                    onClick={() =>
                        dispatch(setModal('removeFromCart', { type: 'all', index: 'all' }))
                    }
                >
                    Empty Cart
                </Button>
            </div>
        </div>
    )
}

Title.propTypes = {
    mobile: PropTypes.bool,
}

export default Title
