import React from 'react'
import { createRoot } from 'react-dom/client'

import { Provider } from 'react-redux'
import { store } from './core/redux/store/store'

import { AppRoutes } from './core/routes/routes'

import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import muiTheme from './themes/light.js'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'

import './index.css'
import { getPublicUrl } from './core/runtimeConfig'

// Import fonts so webpack processes them and includes them in the build
import interFont from './media/fonts/Inter/Inter-VariableFont_slnt-wght.ttf'
import publicSansFont from './media/fonts/Public_Sans/PublicSans-VariableFont_wght.ttf'

// Dynamically inject font faces using runtime PUBLIC_URL
// This prevents the PUBLIC_URL from being baked into the CSS at build time
const injectFontFaces = () => {
    const publicUrl = getPublicUrl()

    // Extract just the filename from the webpack-processed path
    // webpack gives us something like "/static/media/Inter-VariableFont_slnt-wght.abc123.ttf"
    // We need to replace the leading part with our runtime publicUrl
    const getRelativePath = (webpackPath) => {
        // Extract everything after /static/
        const match = webpackPath.match(/\/(static\/.+)$/)
        return match ? match[1] : webpackPath
    }

    const interPath = `${publicUrl}/${getRelativePath(interFont)}`
    const publicSansPath = `${publicUrl}/${getRelativePath(publicSansFont)}`

    const fontFaceCSS = `
        @font-face {
            font-family: Inter;
            src: url(${interPath});
        }
        @font-face {
            font-family: PublicSans;
            src: url(${publicSansPath});
        }
    `
    const style = document.createElement('style')
    style.textContent = fontFaceCSS
    document.head.insertBefore(style, document.head.firstChild)
}

// Initialize window.APP_CONFIG for development mode
// In production, this is injected by the Express server with runtime values
if (!window.APP_CONFIG) {
    window.APP_CONFIG = {
        // In development, always use empty string for PUBLIC_URL (serve from root)
        // The .env PUBLIC_URL is ignored in dev mode
        PUBLIC_URL: process.env.NODE_ENV === 'development' ? '' : process.env.PUBLIC_URL || '',
        DOMAIN: process.env.REACT_APP_DOMAIN || '',
        API_URL: process.env.REACT_APP_API_URL || '',
        ES_URL: process.env.REACT_APP_ES_URL || '',
        FOOTPRINT_URL: process.env.REACT_APP_FOOTPRINT_URL || '',
        IMAGERY_URL: process.env.REACT_APP_IMAGERY_URL || '',
        REGISTRY_URL: process.env.REACT_APP_REGISTRY_URL || '',
        DOI_URL: process.env.REACT_APP_DOI_URL || '',
    }
}

// Inject font faces with runtime PUBLIC_URL
injectFontFaces()

window.token = 'token'

const container = document.getElementById('root')
const root = createRoot(container)

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
