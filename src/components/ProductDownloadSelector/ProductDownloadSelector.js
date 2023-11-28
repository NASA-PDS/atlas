import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles, withStyles } from '@material-ui/core/styles'

import { domain, endpoints, ES_PATHS } from '../../core/constants'
import { getIn, getHeader, getFilename, humanFileSize, setIn } from '../../core/utils'

import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import Checkbox from '@material-ui/core/Checkbox'

const useStyles = makeStyles((theme) => ({
    root: {},
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
}))

const ProductDownloadSelector = forwardRef((props, ref) => {
    const { hidden, forceAllSelected, onSummaryReady } = props

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
    }

    const summary = getSummary(listState)

    return (
        <div className={clsx({ [c.hidden]: hidden })}>
            <div className={c.list}>{makeSelectors(listState, onCheck)}</div>
            <div className={c.summary}>
                <div className={c.totalTitle}>Total:&nbsp;</div>
                <div className={c.total}>{summary.total} items</div>
                <div>&nbsp;|&nbsp;</div>
                <div className={c.size}>{humanFileSize(summary.size)}</div>
            </div>
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
