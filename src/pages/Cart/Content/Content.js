import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'

import CartView from './CartView/CartView'
import Panel from './Panel/Panel'
import MobileDownloadBar from './MobileDownloadBar/MobileDownloadBar'
import RemoveFromCartModal from '../Modals/RemoveFromCartModal/RemoveFromCartModal'

const useStyles = makeStyles((theme) => ({
    Content: {
        width: '100%',
        height: `calc(100% - ${theme.headHeights[1]}px)`,
        display: 'flex',
    },
}))

const Content = (props) => {
    const { isMobile } = props
    const c = useStyles()

    return (
        <div className={c.Content}>
            <CartView />
            {isMobile ? <MobileDownloadBar /> : <Panel />}
            <RemoveFromCartModal />
        </div>
    )
}

Content.propTypes = {}

export default Content
