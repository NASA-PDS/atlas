import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles, useTheme } from '@mui/material/styles'

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

export default Cart;
