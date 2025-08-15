import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge'
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'

import ResultsSorter from '../../../../../../components/ResultsSorter/ResultsSorter'
import MenuButton from '../../../../../../components/MenuButton/MenuButton'

import ChippedFilters from '../ChippedFilters/ChippedFilters'

import {
    addToCart,
    checkItemInResults,
    setGridSize,
    setModal,
    setSnackBarText,
} from '../../../../../../core/redux/actions/actions.js'

const useStyles = makeStyles((theme) => ({
    Heading: {
        width: '100%',
        height: theme.headHeights[1],
        display: 'flex',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey100,
    },
    title: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '34px',
        whiteSpace: 'nowrap',
        padding: '4px 0px 4px 12px',
        color: theme.palette.text.primary,
    },
    left: {
        display: 'flex',
    },
    middle: {
        flex: 1,
        padding: '4px 12px',
    },
    right: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    rotateButton: {
        'width': theme.headHeights[1],
        'height': theme.headHeights[1],
        '& svg': {
            borderRadius: '50%',
            transform: `rotateZ(${window.atlasGlobal.imageRotation}deg)`,
            background:
                window.atlasGlobal.imageRotation === 0
                    ? 'inherit'
                    : theme.palette.swatches.grey.grey150,
            color: window.atlasGlobal.imageRotation === 0 ? 'rgba(0,0,0,0.54)' : 'black',
        },
    },
    gridSize: {
        'height': '26px',
        'background': theme.palette.swatches.grey.grey100,
        'margin': '6px 4px',
        'borderRadius': '4px',
        'border': `1px solid ${theme.palette.swatches.grey.grey200}`,
        '& > button:not(:last-child)': {
            borderRight: `1px solid ${theme.palette.swatches.grey.grey200}`,
        },
    },
    gridSizeButton: {
        'color': theme.palette.swatches.grey.grey300,
        'padding': '3px 6px 2px 6px',
        'transition': 'color 0.2s ease-out, background 0.2s ease-out',
        '&:hover': {
            color: theme.palette.text.primary,
            background: theme.palette.swatches.grey.grey150,
        },
    },
    gridSizeActive: {
        background: theme.palette.swatches.grey.grey150,
        color: theme.palette.text.primary,
    },
    button1: {
        color: theme.palette.text.secondary,
        fontSize: '11px',
        lineHeight: '11px',
        margin: '7px 3px',
        background: theme.palette.accent.main,
    },
    button2: {
        'color': theme.palette.text.secondary,
        'fontSize': '11px',
        'lineHeight': '11px',
        'margin': '7px 3px',
        'background': theme.palette.swatches.red.red500,
        '&:hover': {
            color: theme.palette.text.secondary,
            background: theme.palette.swatches.red.red400,
        },
    },
}))

const Heading = (props) => {
    const { activeView } = props

    const c = useStyles()
    const dispatch = useDispatch()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const filterType = useSelector((state) => state.getIn(['filterType']))
    const gridSize = useSelector((state) => state.getIn(['gridSize']))

    const resultKeysChecked = useSelector((state) => state.getIn(['resultKeysChecked']).toJS())

    const gridSizes = isMobile ? [92, 128, 256] : [128, 192, 256]

    const rotate90 = () => {
        window.atlasGlobal.imageRotation = (window.atlasGlobal.imageRotation + 90) % 360

        const rotateButton = document.querySelector('#ResultsPanelRotateButton svg')
        if (rotateButton) {
            rotateButton.style.transform = `rotateZ(${window.atlasGlobal.imageRotation}deg)`
            rotateButton.style.background =
                window.atlasGlobal.imageRotation === 0 ? 'inherit' : '#e7e7e7'
            rotateButton.style.color =
                window.atlasGlobal.imageRotation === 0 ? 'rgba(0,0,0,0.54)' : 'black'
        }

        const imgs = document.getElementsByClassName('ResultsPanelImage')
        for (let i = 0; i < imgs.length; i++) {
            imgs[i].style.transform = `rotateZ(${window.atlasGlobal.imageRotation}deg)`
        }
    }

    return (
        <div className={c.Heading}>
            <div className={c.left}>
                <div className={c.title}>Results</div>
            </div>
            <div className={c.middle}>{filterType === 'basic' && <ChippedFilters />}</div>
            <div className={c.right}>
                <ResultsSorter />
                {activeView === 'grid' && !isMobile && (
                    <div className={c.gridSize}>
                        <Tooltip title="Small Grid Images" arrow>
                            <IconButton
                                className={clsx(c.gridSizeButton, {
                                    [c.gridSizeActive]: gridSize === gridSizes[0],
                                })}
                                aria-label="small image size"
                                size="small"
                                onClick={() => {
                                    dispatch(setGridSize(gridSizes[0]))
                                }}
                            >
                                <PhotoSizeSelectSmallIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Medium Grid Images" arrow>
                            <IconButton
                                className={clsx(c.gridSizeButton, {
                                    [c.gridSizeActive]: gridSize === gridSizes[1],
                                })}
                                aria-label="medium image size"
                                size="small"
                                onClick={() => {
                                    dispatch(setGridSize(gridSizes[1]))
                                }}
                            >
                                <PhotoSizeSelectLargeIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Large Grid Images" arrow>
                            <IconButton
                                className={clsx(c.gridSizeButton, {
                                    [c.gridSizeActive]: gridSize === gridSizes[2],
                                })}
                                aria-label="large image size"
                                size="small"
                                onClick={() => {
                                    dispatch(setGridSize(gridSizes[2]))
                                }}
                            >
                                <PhotoSizeSelectActualIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
                {activeView === 'grid' && !isMobile && (
                    <Tooltip title="Rotate Images 90°" arrow>
                        <IconButton
                            className={c.rotateButton}
                            id="ResultsPanelRotateButton"
                            aria-label="rotate images"
                            size="small"
                            onClick={rotate90}
                        >
                            <RotateRightIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {activeView === 'table' && !isMobile && (
                    <Button
                        className={c.button1}
                        variant="contained"
                        aria-label="edits columns"
                        size="small"
                        onClick={() => dispatch(setModal('editColumns'))}
                    >
                        Edit Columns
                    </Button>
                )}
                <Tooltip
                    title={
                        resultKeysChecked.length > 0
                            ? 'Add Selected Results to Cart'
                            : 'Add All Query Results to Cart'
                    }
                    arrow
                >
                    <Button
                        className={resultKeysChecked.length > 0 ? c.button2 : c.button1}
                        variant="contained"
                        aria-label={
                            resultKeysChecked.length > 0
                                ? 'add selected results to cart'
                                : 'add all query results to cart'
                        }
                        size="small"
                        onClick={() => {
                            if (resultKeysChecked.length > 0) {
                                dispatch(addToCart('image', 'checkedResults'))
                                dispatch(
                                    setSnackBarText('Added Selected Items to Cart!', 'success')
                                )
                            } else {
                                dispatch(addToCart('query', 'lastQuery'))
                                dispatch(setSnackBarText('Added Query to Cart!', 'success'))
                            }
                        }}
                        endIcon={<AddShoppingCartIcon size="small" />}
                    >
                        {isMobile
                            ? resultKeysChecked.length > 0
                                ? 'Add Selected'
                                : 'Add All'
                            : resultKeysChecked.length > 0
                            ? 'Add Selected to Cart'
                            : 'Add All to Cart'}
                    </Button>
                </Tooltip>
                <MenuButton
                    options={
                        !isMobile
                            ? [
                                  'Add All Query Results to Cart',
                                  'Add Selected Results to Cart',
                                  '-',
                                  'Deselect All',
                              ]
                            : activeView === 'table'
                            ? [
                                  'Add All Query Results to Cart',
                                  'Add Selected Results to Cart',
                                  '-',
                                  'Deselect All',
                                  '-',
                                  'Edit Columns',
                              ]
                            : [
                                  'Add All Query Results to Cart',
                                  'Add Selected Results to Cart',
                                  '-',
                                  'Deselect All',
                                  '-',
                                  'Small Grid Images',
                                  'Medium Grid Images',
                                  'Large Grid Images',
                                  '-',
                                  'Rotate Images 90°',
                              ]
                    }
                    buttonComponent={<MoreVertIcon fontSize="inherit" />}
                    onChange={(option, idx) => {
                        switch (option) {
                            case 'Add Selected Results to Cart':
                                dispatch(addToCart('image', 'checkedResults'))
                                dispatch(setSnackBarText('Added to Cart!', 'success'))
                                break
                            case 'Add All Query Results to Cart':
                                dispatch(addToCart('query', 'lastQuery'))
                                dispatch(setSnackBarText('Added Query to Cart!', 'success'))
                                break
                            case 'Deselect All':
                                dispatch(checkItemInResults('clear'))
                                break

                            case 'Small Grid Images':
                                dispatch(setGridSize(gridSizes[0]))
                                break
                            case 'Medium Grid Images':
                                dispatch(setGridSize(gridSizes[1]))
                                break
                            case 'Large Grid Images':
                                dispatch(setGridSize(gridSizes[2]))
                                break

                            case 'Rotate Images 90°':
                                rotate90()
                                break

                            case 'Edit Columns':
                                dispatch(setModal('editColumns'))
                                break
                            default:
                                break
                        }
                    }}
                />
            </div>
        </div>
    )
}

Heading.propTypes = {}

export default Heading
