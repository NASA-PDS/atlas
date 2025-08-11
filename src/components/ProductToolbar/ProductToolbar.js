import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { makeStyles, withStyles } from '@mui/material/styles'

import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import Tooltip from '@mui/material/Tooltip'

import GetAppIcon from '@material-ui/icons/GetApp'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart'
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart'

import {
    checkItemInResults,
    checkItemInCart,
    addToCart,
    removeFromCart,
    setModal,
    setSnackBarText,
} from '../../core/redux/actions/actions.js'
import { getIn, getPDSUrl, getFilename } from '../../core/utils.js'
import { ES_PATHS } from '../../core/constants.js'

import { streamDownloadFile } from '../../core/downloaders/ZipStream.js'

const CenterTooltip = withStyles((theme) => ({
    tooltip: {
        textAlign: 'center',
    },
}))(Tooltip)

const toolbarHeight = 32

const useStyles = makeStyles((theme) => ({
    ProductToolbar: {
        height: `${toolbarHeight}px`,
        width: '100%',
        boxSizing: 'border-box',
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0,
        zIndex: 2,
        transition: 'opacity 0.2s ease-out',
        [theme.breakpoints.down('md')]: {
            'opacity': '1 !important',
            '& .ProductToolbarInner': {
                display: 'flex !important',
                background: `${theme.palette.swatches.grey.grey800} !important`,
            },
        },
    },
    noHover: {
        opacity: '1',
    },
    toolbarActive: {
        opacity: '1 !important',
    },
    toolbarCarted: {
        'opacity': '1 !important',
        'background': 'transparent',
        '& .ProductToolbarInner': {
            display: 'none',
        },
        '& .ProductToolbarInCart': {
            opacity: '1',
        },
    },
    inner: {
        display: 'flex',
        justifyContent: 'space-between',
        background: theme.palette.accent.main,
        width: '100%',
    },
    noHoverInner: {
        background: 'unset',
    },
    inCart: {
        pointerEvents: 'none',
        color: theme.palette.swatches.red.red500,
        position: 'absolute',
        top: 0,
        right: 0,
        height: 21,
        width: 21,
        padding: '5px',
        opacity: 0,
    },
    checkbox: {
        'padding': '5px',
        'color': theme.palette.swatches.grey.grey50,
        'transition': 'background 0.2s ease-out, color 0.2s ease-out',
        '&:hover': {
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
        },
    },
    noHoverCheckbox: {
        'color': theme.palette.swatches.grey.grey300,
        '&:hover': {
            background: 'rgba(0,0,0,0.05)',
            color: theme.palette.swatches.grey.grey800,
        },
    },
    checkboxChecked: {
        'background': theme.palette.swatches.red.red500,
        'color': `${theme.palette.text.secondary} !important`,
        '&:hover': {
            background: `${theme.palette.swatches.red.red500} !important`,
        },
    },
    button1: {
        'height': `${toolbarHeight}px`,
        'width': `${toolbarHeight}px`,
        'color': theme.palette.swatches.grey.grey50,
        'transition': 'background 0.2s ease-out, color 0.2s ease-out',
        '&:hover': {
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
        },
    },
    noHoverButton: {
        'color': theme.palette.swatches.grey.grey300,
        '&:hover': {
            background: 'rgba(0,0,0,0.05)',
            color: theme.palette.swatches.grey.grey800,
        },
    },
    isInCartButton: {
        color: theme.palette.swatches.red.red500,
    },
    noHoverButtonCart: {
        'color': theme.palette.swatches.grey.grey50,
        '&:hover': {
            background: theme.palette.swatches.red.red500,
            color: theme.palette.swatches.grey.grey0,
        },
    },
}))

const ProductToolbar = (props) => {
    const { result, noHover, isCart, cartIndex } = props
    const c = useStyles()

    const dispatch = useDispatch()

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })

    const s = getIn(result, '_source', {})

    let release_id = getIn(s, ES_PATHS.release_id)

    let uri = getIn(s, ES_PATHS.source)

    let cartIdx = cartIndex != null ? cartIndex : null
    const isInCart = isCart
        ? true
        : cart.filter((c, idx) => {
              if (uri === getIn(c, 'item.uri', 'unset')) {
                  cartIdx = idx
                  return true
              }
          }).length > 0

    if (isCart && isInCart) {
        uri = getIn(result, 'item.uri', null)
        release_id = getIn(result, 'item.release_id', null)
    }

    const keysChecked = useSelector((state) => state.getIn(['resultKeysChecked'])).toJS()
    const isChecked = isCart ? result.checked || false : keysChecked.includes(result.result_key)

    return (
        <div
            className={clsx(c.ProductToolbar, {
                ProductToolbar: !isChecked,
                [c.noHover]: noHover,
                [c.toolbarActive]: isChecked,
                [c.toolbarCarted]: !isChecked && isInCart && !noHover,
            })}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <div
                className={clsx(c.inner, 'ProductToolbarInner', {
                    [c.noHoverInner]: noHover,
                })}
            >
                <Checkbox
                    className={clsx(c.checkbox, {
                        [c.noHoverCheckbox]: noHover,
                        [c.checkboxChecked]: isChecked,
                    })}
                    checked={isChecked || false}
                    onClick={(e) => {
                        isCart
                            ? dispatch(checkItemInCart(cartIdx))
                            : dispatch(checkItemInResults(result.result_key))
                    }}
                />
                {uri != null && result.type !== 'query' && result.type !== 'directory' ? (
                    <CenterTooltip
                        title={`Download ${getFilename(uri)}`}
                        placement="top"
                        enterDelay={400}
                        arrow
                    >
                        <IconButton
                            className={clsx(c.button1, {
                                [c.noHoverButton]: noHover,
                            })}
                            aria-label="download product"
                            size="small"
                            onClick={() => {
                                if (uri != null) {
                                    streamDownloadFile(getPDSUrl(uri, release_id), getFilename(uri))
                                }
                            }}
                        >
                            <GetAppIcon />
                        </IconButton>
                    </CenterTooltip>
                ) : null}
                <Tooltip
                    title={isInCart ? 'Remove from Cart' : 'Add to Cart'}
                    placement="top-end"
                    enterDelay={400}
                    arrow
                >
                    <IconButton
                        className={clsx(c.button1, {
                            [c.noHoverButton]: noHover,
                            [c.isInCartButton]: isInCart,
                            [c.noHoverButtonCart]: noHover && isInCart,
                        })}
                        aria-label={isInCart ? 'remove from cart' : 'add to cart'}
                        size="small"
                        onClick={() => {
                            if (!isInCart) {
                                const related = getIn(s, ES_PATHS.related)
                                related.src = related.src || {}
                                related.src.size = getIn(s, ES_PATHS.archive.size)
                                related.src.uri = getIn(s, ES_PATHS.uri)

                                dispatch(
                                    addToCart('image', {
                                        uri: getIn(s, ES_PATHS.source),
                                        related: related,
                                        release_id: getIn(s, ES_PATHS.release_id),
                                    })
                                )
                                dispatch(setSnackBarText('Added to Cart!', 'success'))
                            } else if (cartIdx != null) {
                                if (isCart)
                                    dispatch(
                                        setModal('removeFromCart', {
                                            type: 'single',
                                            index: cartIdx,
                                        })
                                    )
                                else {
                                    dispatch(removeFromCart(cartIdx))
                                    dispatch(setSnackBarText('Removed to Cart!', 'success'))
                                }
                            }
                        }}
                    >
                        {isInCart ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />}
                    </IconButton>
                </Tooltip>
            </div>
            {!isCart && <ShoppingCartIcon className={clsx(c.inCart, 'ProductToolbarInCart')} />}
        </div>
    )
}

export default ProductToolbar
