import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'

import Title from './Title/Title'
import Content from './Content/Content'

const useStyles = makeStyles((theme) => ({
    Cart: {
        width: '100%',
        height: '100%',
        color: theme.palette.text.primary,
        overflow: 'hidden',
    },
}))

const Cart = (props) => {
    const { width } = props
    const c = useStyles()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <div className={c.Cart}>
            <Title />
            <Content isMobile={isMobile} />
        </div>
    )
}

Cart.propTypes = {}

export default withWidth()(Cart)
