import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import Checkbox from '@material-ui/core/Checkbox'

import { setFieldState } from '../../../../core/redux/actions/actions.js'
import { DISPLAY_NAME_MAPPINGS } from '../../../../core/constants.js'
import { getIn } from '../../../../core/utils.js'

const useStyles = makeStyles((theme) => ({
    ListFilter: {
        flex: '1',
    },
    list: {
        padding: 0, //Since the parent is already padded
        margin: 0,
        listStyleType: 'none',
    },
    listItem: {
        'padding': `0px ${theme.spacing(2)}px`,
        'display': 'flex',
        'height': '24px',
        'lineHeight': '24px',
        'cursor': 'pointer',
        'transition': 'background 0.2s ease-out, opacity 0.4s ease-out',
        'textOverflow': 'ellipsis',
        'whiteSpace': 'nowrap',
        'overflow': 'hidden',
        '&:hover': {
            background: theme.palette.swatches.grey.grey150,
        },
    },
    listItemZero: {
        opacity: 0.4,
    },
    checkbox: {},
    label: {
        display: 'flex',
        lineHeight: '26px',
        marginLeft: '8px',
    },
    name: {
        padding: '0px 2px',
    },
    count: {
        padding: '0px 2px',
        fontSize: 12,
        color: theme.palette.swatches.grey.grey400,
    },
    noData: {
        width: '100%',
        color: theme.palette.swatches.grey.grey600,
        textAlign: 'center',
    },
    moreResults: {
        textAlign: 'center',
        background: theme.palette.swatches.red.red500,
        color: theme.palette.swatches.grey.grey100,
        padding: '4px 0px',
    },
}))

const ListFilter = (props) => {
    const { filterKey, facetId } = props
    const c = useStyles()

    const dispatch = useDispatch()
    const facet = useSelector((state) => {
        const sel = state.getIn(['activeFilters', filterKey, 'facets', facetId])
        return sel ? sel.toJS() : {}
    })

    return (
        <div className={c.ListFilter}>
            <ul className={c.list}>
                {facet.fields ? (
                    facet.fields.map((field, idx) => (
                        <li
                            className={clsx(c.listItem, {
                                [c.listItemZero]: field.doc_count === 0,
                            })}
                            key={idx}
                            onClick={() => {
                                dispatch(
                                    setFieldState(filterKey, facetId, {
                                        [field.key]: !getIn(facet, ['state', field.key], false),
                                    })
                                )
                            }}
                        >
                            <Checkbox
                                className={c.checkbox}
                                color="default"
                                checked={getIn(facet, ['state', field.key], false)}
                                size="small"
                                title="Select"
                                aria-label="select"
                            />
                            <span className={c.label}>
                                <div className={c.name}>
                                    {DISPLAY_NAME_MAPPINGS[field.key]
                                        ? DISPLAY_NAME_MAPPINGS[field.key]
                                        : field.key}
                                </div>
                                <div className={c.count}>({field.doc_count})</div>
                            </span>
                        </li>
                    ))
                ) : (
                    <div className={c.noData}>No aggregation data</div>
                )}
                {facet?.fields?.length >= 500 && (
                    <li className={c.moreResults}>Only showing the first 500 results.</li>
                )}
            </ul>
        </div>
    )
}

ListFilter.propTypes = {
    filterKey: PropTypes.string.isRequired,
    facetId: PropTypes.number.isRequired,
}

export default ListFilter
