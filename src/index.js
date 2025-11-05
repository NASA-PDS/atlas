import React from 'react'
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux'
import { store } from './core/redux/store/store'

import { AppRoutes } from './core/routes/routes'

import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import muiTheme from './themes/light.js'

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import './index.css'

window.token = 'token'

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={muiTheme}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <AppRoutes />
                </LocalizationProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    </Provider>
)
