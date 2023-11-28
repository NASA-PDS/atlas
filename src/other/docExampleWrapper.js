import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import makeStore from '../core/redux/store/store'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import { BaseProvider } from 'baseui'
import customTheme from '../core/customTheme'

import '../index.css'

const engine = new Styletron()

const store = makeStore()

const Component = props => {
    return (
        <React.Fragment>
            <StyletronProvider value={engine}>
                <BaseProvider theme={customTheme}>
                    <Provider store={store}>
                        <BrowserRouter>{props.children}</BrowserRouter>
                    </Provider>
                </BaseProvider>
            </StyletronProvider>
            ,
        </React.Fragment>
    )
}

Component.propTypes = {
    children: PropTypes.object,
}

export default Component
