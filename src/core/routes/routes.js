import { useEffect } from 'react'
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
            <Router>
                <Toolbar />
                <div className="routeMain">
                    <Topbar />
                    <Routes location>
                        <Route
                            path={HASH_PATHS.root}
                            element={() => {
                                return (
                                    <div className="routeContent">
                                        <Search />
                                    </div>
                                )
                            }}
                        />
                        <Route
                            path={HASH_PATHS.search}
                            element={() => {
                                return (
                                    <div className="routeContent">
                                        <Search />
                                    </div>
                                )
                            }}
                        />
                        <Route
                            path={HASH_PATHS.record}
                            element={() => {
                                return (
                                    <div className="routeContent">
                                        <Record />
                                    </div>
                                )
                            }}
                        />
                        <Route
                            path={HASH_PATHS.cart}
                            element={() => {
                                return (
                                    <div className="routeContent">
                                        <Cart />
                                    </div>
                                )
                            }}
                        />
                        <Route
                            path={HASH_PATHS.fileExplorer}
                            element={() => {
                                return (
                                    <div className="routeContent">
                                        <FileExplorer />
                                    </div>
                                )
                            }}
                        />
                    </Routes>
                </div>
            </Router>
            <InformationModal />
            <FeedbackModal />
            <SnackBar />
        </div>
    )
}
