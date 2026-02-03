import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@mui/styles'

import {
    domain,
    endpoints,
    ES_PATHS,
    MAX_BULK_DOWNLOAD_COUNT,
    EMAIL_CONTACT,
} from '../../core/constants'
import { getIn, getHeader, getFilename, humanFileSize, setIn } from '../../core/utils'

import clsx from 'clsx'
import { Typography } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'

import WarningIcon from '@mui/icons-material/Warning'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
        background: theme.palette.swatches.grey.grey100,
        borderBottom: `1px solid ${theme.palette.swatches.grey.grey200}`,
    },
    title: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: theme.spacing(3),
    },
    header: {
        fontWeight: 'bold',
    },
    item: {
        'display': 'flex',
        'justifyContent': 'space-between',
        '& > div': {
            display: 'flex',
        },
        'lineHeight': '27px',
    },
    checkbox: {},
    label: {
        lineHeight: '27px',
    },
    total: {
        fontStyle: 'italic',
    },
    totalTitle: {
        fontWeight: 'bold',
    },
    size: {
        fontWeight: 'bold',
    },
    summary: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '21px',
    },
    hidden: {
        display: 'none',
    },
    sizeWarning: {
        display: 'flex',
        width: '100%',
        background: theme.palette.swatches.yellow.yellow700,
        padding: '16px 16px 16px 0px',
        boxSizing: 'border-box',
        marginTop: '16px',
        marginBottom: '8px',
        borderRadius: '3px',
        boxShadow: '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
    },
    sizeWarningIcon: {
        'width': '80px',
        'margin': 'auto',
        'textAlign': 'center',
        '& svg': {
            fontSize: '42px',
        },
    },
    sizeWarningMessage: {
        'flex': 1,
        'fontSize': '15px',
        'letterSpacing': '0.25px',
        '& a': {
            fontWeight: 'bold',
        },
    },
}))

const ProductDownloadSelector = forwardRef((props, ref) => {
    const { hidden, forceAllSelected, onSummaryReady, onSelection } = props

    const dispatch = useDispatch()

    const c = useStyles()

    const cart = useSelector((state) => {
        return state.get('cart').toJS() || []
    })
    const checkedCart = cart.filter((v) => v.checked === true)

    const startChecked = forceAllSelected ? true : false
    const [listState, setListState] = useState({
        'Source Products': {
            src: {
                name: 'Primary Product / File',
                size: 0,
                sizeComplete: false,
                total: 0,
                checked: startChecked,
            },
        },
        'Metadata Products': {
            label: {
                name: 'PDS Label',
                size: 0,
                sizeComplete: false,
                total: 0,
                checked: startChecked,
            },
        },
        'Browse Products': {
            browse: {
                name: 'Browse Image',
                size: 0,
                sizeComplete: false,
                total: 0,
                checked: startChecked,
            },
            full: {
                name: 'Full-sized Image',
                size: 0,
                sizeComplete: false,
                total: 0,
                checked: startChecked,
            },
            lg: { name: 'Large Image', size: 0, sizeComplete: false, total: 0, checked: false },
            md: { name: 'Medium Image', size: 0, sizeComplete: false, total: 0, checked: false },
            sm: { name: 'Small Image', size: 0, sizeComplete: false, total: 0, checked: false },
            xs: { name: 'Tiny Image', size: 0, sizeComplete: false, total: 0, checked: false },
            tile: { name: 'DZI Tileset', size: 0, sizeComplete: false, total: 0, checked: false },
        },
    })

    useImperativeHandle(ref, () => ({
        getSelected: () => {
            return getSelected(listState)
        },
        getSummary: () => {
            return getSummary(listState)
        },
    }))

    useEffect(() => {
        const nextListState = JSON.parse(JSON.stringify(listState))

        Object.keys(nextListState).forEach((groupName) => {
            Object.keys(nextListState[groupName]).forEach((productType) => {
                let size = 0
                let sizeComplete = true
                let total = 0
                checkedCart.forEach((c) => {
                    const related = c.item.related
                    if (related[productType]) {
                        if (related[productType].value != null) {
                            size += related[productType].value
                        } else if (related[productType].size != null) {
                            size += related[productType].size
                        } else {
                            sizeComplete = false
                        }

                        if (c.type === 'image' || c.type === 'file') {
                            total++
                        } else if (related[productType].count != null) {
                            total += related[productType].count
                        }
                    }
                })
                nextListState[groupName][productType].size = size
                nextListState[groupName][productType].sizeComplete = sizeComplete
                nextListState[groupName][productType].total = total
            })
        })
        setListState(nextListState)

        if (typeof onSummaryReady === 'function') onSummaryReady(getSummary(nextListState))
    }, [checkedCart.length])

    const onCheck = (group, name) => {
        const nextListState = JSON.parse(JSON.stringify(listState))
        setIn(
            nextListState,
            [group, name, 'checked'],
            !getIn(nextListState, [group, name, 'checked'], false)
        )
        setListState(nextListState)
        if (typeof onSelection === 'function')
            onSelection((getSelected(nextListState) || []).length)
    }

    const summary = getSummary(listState)

    return (
        <div className={clsx(c.root, { [c.hidden]: hidden })}>
            <Typography className={c.title}>
                1. Select the products to include in your download:
            </Typography>
            <div className={c.list}>{makeSelectors(listState, onCheck)}</div>
            <div className={c.summary}>
                <div className={c.totalTitle}>Total:&nbsp;</div>
                <div className={c.total}>{summary.total} items</div>
                <div>&nbsp;|&nbsp;</div>
                <div className={c.size}>{humanFileSize(summary.size)}</div>
            </div>
            {summary.total > MAX_BULK_DOWNLOAD_COUNT && (
                <div className={c.sizeWarning}>
                    <div className={c.sizeWarningIcon}>
                        <WarningIcon />
                    </div>
                    <div className={c.sizeWarningMessage}>
                        Your download exceeds {MAX_BULK_DOWNLOAD_COUNT} items and may be throttled.
                        If you need to perform a large download within a reasonable time, please
                        reach out to the PDS-IMG node at{' '}
                        <a href={`mailto:${EMAIL_CONTACT}?subject=Bulk%20Download%20Request`}>
                            {EMAIL_CONTACT}
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
})

function makeSelectors(state, onCheck) {
    const c = useStyles()

    let list = []
    Object.keys(state).forEach((groupName, idx) => {
        const sublist = []
        Object.keys(state[groupName]).forEach((productType, idx2) => {
            const p = state[groupName][productType]
            if (p.total > 0)
                sublist.push(
                    <div
                        className={c.item}
                        onClick={() => {
                            onCheck(groupName, productType)
                        }}
                        key={`${idx}.${idx2}`}
                    >
                        <div>
                            <Checkbox
                                className={c.checkbox}
                                color="default"
                                checked={p.checked}
                                size="medium"
                            />
                            <div className={c.label}>{p.name}</div>
                        </div>
                        <div>
                            <div className={c.total}>{p.total} items</div>
                            <div>&nbsp;|&nbsp;</div>
                            <div className={c.size}>{humanFileSize(p.size)}</div>
                        </div>
                    </div>
                )
        })
        if (sublist.length > 0) {
            sublist.unshift(
                <Typography className={c.header} key={idx}>
                    {groupName}
                </Typography>
            )
            list = list.concat(sublist)
        }
    })

    return list
}

function getSelected(listState) {
    const selected = []
    Object.keys(listState).forEach((groupName) => {
        Object.keys(listState[groupName]).forEach((productType) => {
            const p = listState[groupName][productType]
            if (p.checked) {
                selected.push(productType)
            }
        })
    })
    return selected
}

function getSummary(state) {
    const summary = { total: 0, size: 0 }
    Object.keys(state).forEach((groupName) => {
        Object.keys(state[groupName]).forEach((productType) => {
            const p = state[groupName][productType]
            if (p.checked) {
                summary.total += p.total
                summary.size += p.size
            }
        })
    })
    return summary
}

ProductDownloadSelector.propTypes = {}

export default ProductDownloadSelector
