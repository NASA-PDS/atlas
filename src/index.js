import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { store } from './core/redux/store/store'

import { Routes } from './core/routes/routes'

import { ThemeProvider } from '@mui/material/styles'
import muiTheme from './themes/light.js'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'

import './index.css'

window.token = 'token'

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={muiTheme}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <Routes />
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
)
