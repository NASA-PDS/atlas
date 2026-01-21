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

// Initialize window.APP_CONFIG for development mode
// In production, this is injected by the Express server with runtime values
if (!window.APP_CONFIG) {
    window.APP_CONFIG = {
        // In development, always use empty string for PUBLIC_URL (serve from root)
        // The .env REACT_APP_PUBLIC_URL is ignored in dev mode
        PUBLIC_URL: process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_PUBLIC_URL || ''),
        DOMAIN: process.env.REACT_APP_DOMAIN || '',
        API_URL: process.env.REACT_APP_API_URL || '',
        ES_URL: process.env.REACT_APP_ES_URL || '',
        FOOTPRINT_URL: process.env.REACT_APP_FOOTPRINT_URL || '',
        IMAGERY_URL: process.env.REACT_APP_IMAGERY_URL || '',
        REGISTRY_URL: process.env.REACT_APP_REGISTRY_URL || '',
        DOI_URL: process.env.REACT_APP_DOI_URL || '',
    }
}

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
