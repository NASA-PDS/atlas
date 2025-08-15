import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import CartoCosmos from '../../../../CartoCosmos/CartoCosmos'

import MapListener from './subcomponents/MapListener/MapListener'

import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    SecondaryPanel: {
        height: '100%',
        transition: 'width 0.4s ease-out',
        overflow: 'hidden',
        position: 'relative',
    },
    content: {
        width: '100%', //`calc(100% - ${theme.spacing(2)}px)`,
        height: '100%', //`calc(100% - ${theme.spacing(4)}px)`,
        margin: 0, //`${theme.spacing(2)}px ${theme.spacing(1)}px`,
        background: theme.palette.swatches.grey.grey800,
        display: 'flex',
        flexFlow: 'column',
    },
    heading: {
        width: '100%',
        height: theme.headHeights[1],
        display: 'flex',
        justifyContent: 'space-between',
        padding: '4px 12px',
        boxSizing: 'border-box',
        background: theme.palette.swatches.grey.grey700,
    },
    title: {
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '34px',
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    map: {
        'width': '100%',
        'height': '100%',
        'overflow': 'hidden',
        '& > div': {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        },
    },
}))

const SecondaryPanel = (props) => {
    const { mobile } = props
    const c = useStyles()

    const mainRef = useRef()
    const [firstOpen, setFirstOpen] = useState(false)

    const w = useSelector((state) => {
        return state.getIn(['workspace', 'main'])
    }).toJS()

    let width = 0
    if (mobile) width = '100%'
    else if (w.secondary) {
        if (w.results) width = w.secondarySize
        else width = '100%'
    }

    const style = {
        width,
    }

    // This is so that the map never loads in the background on start up
    if (width !== 0 && firstOpen === false) {
        setFirstOpen(true)
    }

    return (
        <div className={c.SecondaryPanel} style={style} ref={mainRef}>
            <MapListener parentClass={c.map} firstOpen={firstOpen} />
            <div className={c.content}>
                <div className={c.heading}>
                    <div className={c.left}>
                        <div className={c.title}>Map</div>
                    </div>
                    <div className={c.right}></div>
                </div>
                <div className={c.map}>
                    <CartoCosmos firstOpen={firstOpen} />
                </div>
            </div>
        </div>
    )
}

SecondaryPanel.propTypes = {}

export default SecondaryPanel
