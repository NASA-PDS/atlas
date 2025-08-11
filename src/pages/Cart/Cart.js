import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles, useTheme } from '@mui/material/styles'
import withWidth from '@mui/material/withWidth'

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
