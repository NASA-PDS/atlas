import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

import clsx from 'clsx'

import { linearScale } from '../../core/utils.js'

const useStyles = makeStyles((theme) => ({
    MiniHistogram: {
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
    },
    bar: {
        'background': theme.palette.swatches.grey.grey300,
        'position': 'relative',
        'border-left': '1px solid white',
        'transition': 'background 0.2s ease-out',
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    outlier: {
        'background': theme.palette.swatches.red.red500_30,
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    selected: {
        'background': theme.palette.accent.main,
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    outlierSelected: {
        'background': theme.palette.swatches.red.red500,
        '&:hover': {
            background: theme.palette.swatches.grey.grey700,
        },
    },
    noValues: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        background: theme.palette.swatches.red.red500,
        color: theme.palette.swatches.grey.grey0,
        padding: '4px 12px',
        boxShadow: '0px 2px 3px 0px rgba(0,0,0,0.3)',
    },
}))

export default function MiniHistogram(props) {
    const { buckets, height = 100, selectedRange = [], outliers = [] } = props

    const length = buckets ? buckets.length : 0
    let minY = Infinity
    let maxY = -Infinity
    if (buckets)
        buckets.forEach((b, idx) => {
            if (!outliers.includes(idx)) {
                minY = Math.min(minY, b.doc_count)
                maxY = Math.max(maxY, b.doc_count)
            }
        })

    const c = useStyles()

    return (
        <div className={c.MiniHistogram} style={{ height: `${height}px` }}>
            {buckets && buckets.length === 0 && <div className={c.noValues}>No Values Found</div>}
            {buckets &&
                buckets.map((b, idx) => {
                    const w = 100 / length
                    const h = linearScale([minY, maxY], [0, height], b.doc_count)
                    return (
                        <div
                            key={idx}
                            title={`${b.min} - ${b.max}\nHits: ${b.doc_count}${
                                outliers.includes(idx) ? '\nLikely Outlier' : ''
                            }`}
                            className={clsx(c.bar, {
                                [c.outlier]: outliers.includes(idx),
                                [c.selected]:
                                    b.min >= selectedRange[0] && b.max <= selectedRange[1],
                                [c.outlierSelected]:
                                    outliers.includes(idx) &&
                                    b.min >= selectedRange[0] &&
                                    b.max <= selectedRange[1],
                            })}
                            style={{
                                width: `${w}%`,
                                height: `${h}px`,
                                top: `${height - h}px`,
                            }}
                        ></div>
                    )
                })}
        </div>
    )
}

MiniHistogram.propTypes = {
    buckets: PropTypes.array,
    height: PropTypes.number,
    selectedRange: PropTypes.array,
    outliers: PropTypes.array,
}
