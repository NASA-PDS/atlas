import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { setSnackBarText } from '../../core/redux/actions/actions.js'

import { makeStyles } from '@material-ui/core/styles'

import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

const useStyles = makeStyles((theme) => ({
    snackbar: {
        fontSize: 14,
        fontWeight: 'bold',
    },
}))

// Just a small bit of anti-pattern so that, when the snackbar fades, it
// doesn't snap to a no text state
let afterImage = ''

const SnackBar = (props) => {
    const c = useStyles()
    const dispatch = useDispatch()

    const snackBarText = useSelector((state) => {
        return state.getIn(['snackBarText']).toJS()
    })

    const openSnackbar = snackBarText.text != false

    const handleCloseSnackbar = (e, reason) => {
        if (reason === 'clickaway') return
        dispatch(setSnackBarText(false))
    }

    afterImage = snackBarText.text || afterImage

    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            open={openSnackbar}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
        >
            <MuiAlert
                className={c.snackbar}
                elevation={6}
                variant="filled"
                onClose={handleCloseSnackbar}
                severity={snackBarText.severity || 'success'}
            >
                {snackBarText.text || afterImage}
            </MuiAlert>
        </Snackbar>
    )
}

SnackBar.propTypes = {}

export default SnackBar
