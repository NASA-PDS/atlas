import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
    Help: {
        width: '100%',
    },
}))

const Help = (props) => {
    const {} = props
    const c = useStyles()

    return <div className={c.Help}>Help</div>
}

Help.propTypes = {}

export default Help
