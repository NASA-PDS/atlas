import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { makeStyles } from '@mui/styles'

import { setWorkspace } from '../../../core/redux/actions/actions.js'

const useStyles = makeStyles((theme) => ({
    Toolbar: {
        height: theme.headHeights[0],
        padding: '7px',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey700,
    },
}))

const Toolbar = (props) => {
    const { mobile } = props
    const c = useStyles()

    const dispatch = useDispatch()
    const w = useSelector((state) => {
        return state.getIn(['workspace', 'main'])
    }).toJS()
    const mW = useSelector((state) => {
        return state.getIn(['workspace', 'mobile'])
    })

    if (mobile) {
        return (
            <div className={c.Toolbar}>
                <div className="left">
                    <div className="panelMenu">
                        <ButtonGroup size="small" aria-label="small outlined button group">
                            <Button
                                onClick={() =>
                                    dispatch(
                                        setWorkspace(
                                            mW === 'filters' ? 'results' : 'filters',
                                            'mobile'
                                        )
                                    )
                                }
                            >
                                Filters
                            </Button>
                            <Button
                                onClick={() =>
                                    dispatch(
                                        setWorkspace(
                                            mW === 'secondary' ? 'results' : 'secondary',
                                            'mobile'
                                        )
                                    )
                                }
                            >
                                Secondary
                            </Button>
                            <Button onClick={() => dispatch(setWorkspace('results', 'mobile'))}>
                                Results
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div className="right"></div>
            </div>
        )
    }

    return (
        <div className={c.Toolbar}>
            <div className="left">
                <div className="panelMenu">
                    <ButtonGroup size="small" aria-label="small outlined button group">
                        <Button
                            onClick={() => dispatch(setWorkspace({ ...w, filters: !w.filters }))}
                        >
                            {w.filters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                        <Button
                            onClick={() =>
                                dispatch(
                                    setWorkspace({
                                        ...w,
                                        secondary: !w.secondary,
                                    })
                                )
                            }
                        >
                            {w.secondary ? 'Hide Secondary' : 'Show Secondary'}
                        </Button>
                        <Button
                            onClick={() => dispatch(setWorkspace({ ...w, results: !w.results }))}
                        >
                            {w.results ? 'Hide Results' : 'Show Results'}
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
            <div className="right"></div>
        </div>
    )
}

Toolbar.propTypes = {
    mobile: PropTypes.bool,
}

export default Toolbar
