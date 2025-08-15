import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Topbar from '../../components/Topbar'
import Toolbar from '../../components/Toolbar/Toolbar'
import SnackBar from '../../components/SnackBar/SnackBar'

import Search from '../../pages/Search/Search'
import Record from '../../pages/Record/Record'
import FileExplorer from '../../pages/FileExplorer/FileExplorer'
import Cart from '../../pages/Cart/Cart'

import InformationModal from '../../pages/Search/Modals/InformationModal/InformationModal'
import FeedbackModal from '../../pages/Search/Modals/FeedbackModal/FeedbackModal'

import { HASH_PATHS } from '../constants'
import { loadMappings } from '../redux/actions/actions.js'

import './routes.css'

export const AppRoutes = () => {
    const dispatch = useDispatch()
    // On first load, grab all the atlas index mappings
    useEffect(() => {
        dispatch(loadMappings('atlas'))
    }, [])

    return (
        <div className="Routes">
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Toolbar />
                <div className="routeMain">
                    <Topbar />
                    <div className="routeContent">
                        <Routes location>
                            <Route
                                path={HASH_PATHS.root}
                                element={ <Search /> }
                            />
                            <Route
                                path={HASH_PATHS.search}
                                element={ <Search /> }
                            />
                            <Route
                                path={HASH_PATHS.record}
                                element={ <Record /> }
                            />
                            <Route
                                path={HASH_PATHS.cart}
                                element={ <Cart /> }
                            />
                            <Route
                                path={HASH_PATHS.fileExplorer}
                                element={ <FileExplorer /> }
                            />
                        </Routes>
                    </div>
                </div>
            </Router>
            <InformationModal />
            <FeedbackModal />
            <SnackBar />
        </div>
    )
}
