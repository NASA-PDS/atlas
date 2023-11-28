import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import {
    setModal,
    setFilterType,
    copyToClipboardAction,
} from '../../../../core/redux/actions/actions.js'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'

import AddIcon from '@material-ui/icons/Add'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import FilterList from './subcomponents/FilterList/FilterList'
import AdvancedFilter from './subcomponents/AdvancedFilter/AdvancedFilter'

import MenuButton from '../../../../components/MenuButton/MenuButton'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    FiltersPanel: {
        height: '100%',
        transition: 'width 0.4s ease-out',
        overflow: 'hidden',
        position: 'relative',
        background: theme.palette.swatches.grey.grey100,
        boxSizing: 'border-box',
        borderRight: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    contents: {
        width: '100%', //`calc(100% - ${theme.spacing(2)}px)`,
        height: '100%', //`calc(100% - ${theme.spacing(4)}px)`,
        margin: 0, //`${theme.spacing(2)}px ${theme.spacing(1)}px`,
        display: 'flex',
        flexFlow: 'column',
    },
    content: {
        overflowY: 'auto',
        flex: 1,
    },
    heading: {
        width: '100%',
        height: theme.headHeights[1],
        display: 'flex',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    title: {
        padding: '4px 0px 4px 12px',
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '34px',
        color: theme.palette.text.primary,
        whiteSpace: 'nowrap',
    },
    right: {
        display: 'flex',
    },
    addFilter: {
        'color': theme.palette.text.secondary,
        'fontSize': '11px',
        'lineHeight': '11px',
        'padding': '4px 0px',
        'margin': '7px',
        '& .MuiButton-endIcon': {
            marginTop: '-2px',
            marginLeft: '3px',
        },
    },
    buttonMore: {
        color: theme.palette.swatches.grey.grey400,
        fontSize: '21px',
        marginRight: '4px',
    },
}))

const FILTER_TYPES = {
    basic: 'Basic Filters',
    advanced: 'Advanced Filters',
}

const FiltersPanel = (props) => {
    const { mobile } = props
    const c = useStyles()
    const dispatch = useDispatch()

    const w = useSelector((state) => {
        return state.getIn(['workspace', 'main'])
    }).toJS()

    // 'basic' || 'advanced
    const filterType = useSelector((state) => {
        return state.getIn(['filterType'])
    })

    const handleMenuChange = (option) => {
        switch (option) {
            case FILTER_TYPES.advanced:
                dispatch(setFilterType('advanced'))
                break
            case FILTER_TYPES.basic:
                // Users need to go through this warning modal to return to basic filters
                dispatch(setModal('advancedFilterReturn'))
                break
            case 'Copy Query':
                dispatch(copyToClipboardAction('DSL'))
                break
            case 'Copy Python Command':
                dispatch(copyToClipboardAction('Python'))
                break
            case 'Copy CURL Command':
                dispatch(copyToClipboardAction('CURL'))
                break
            case 'Copy Fetch Command':
                dispatch(copyToClipboardAction('Fetch'))
                break
            default:
                break
        }
    }

    let width = 0
    if (mobile) width = '100%'
    else width = w.filters ? (filterType === 'basic' ? w.filtersSize : w.advancedFiltersSize) : 0

    const style = {
        width,
    }
    if (width == 0) style.border = 'unset'

    return (
        <div className={c.FiltersPanel} style={style}>
            <div className={c.contents}>
                <div className={c.heading}>
                    <div className={c.left}>
                        <div className={c.title}>{FILTER_TYPES[filterType]}</div>
                    </div>
                    <div className={c.right}>
                        {filterType === 'basic' && (
                            <Button
                                className={c.addFilter}
                                aria-label="add filter"
                                size="small"
                                onClick={() => dispatch(setModal('addFilter'))}
                                variant="contained"
                                endIcon={<AddIcon />}
                            >
                                Add
                            </Button>
                        )}
                        <div className={c.buttonMore}>
                            <MenuButton
                                options={[
                                    FILTER_TYPES.basic,
                                    FILTER_TYPES.advanced,
                                    '-',
                                    'Copy Query',
                                    'Copy Python Command',
                                    'Copy CURL Command',
                                    'Copy Fetch Command',
                                ]}
                                checkboxIndices={[0, 1]}
                                active={FILTER_TYPES[filterType]}
                                buttonComponent={<MoreVertIcon fontSize="inherit" />}
                                onChange={handleMenuChange}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className={c.content}
                    onScroll={(e) => {
                        const scrollTop = e.target.scrollTop

                        const rect = e.target.getBoundingClientRect()
                        const topEdge = rect.top
                        const bottomEdge = rect.height + rect.top

                        const pRect = e.target.parentElement.getBoundingClientRect()
                        const pTopEdge = pRect.top

                        const allStickyHeaders = e.target.querySelectorAll('.stickyHeader')
                        allStickyHeaders.forEach((element) => {
                            const sPRect = element.parentElement.getBoundingClientRect()
                            const sPTopEdge = sPRect.top
                            const sPBottomEdge = sPRect.height + sPRect.top
                            // If the sticky header parent element overlaps the panels tops
                            if (
                                element.classList.contains('Mui-expanded') &&
                                sPBottomEdge > topEdge &&
                                sPTopEdge < topEdge
                            ) {
                                element.style.position = 'absolute'
                                element.style.top = `${topEdge - pTopEdge}px`
                                element.style.width = `${sPRect.width}px`
                            } else {
                                element.style.position = 'relative'
                                element.style.top = 'unset'
                                element.style.width = 'unset'
                            }
                        })
                    }}
                >
                    {filterType === 'advanced' ? <AdvancedFilter /> : <FilterList />}
                </div>
            </div>
        </div>
    )
}

FiltersPanel.propTypes = {}

export default FiltersPanel
