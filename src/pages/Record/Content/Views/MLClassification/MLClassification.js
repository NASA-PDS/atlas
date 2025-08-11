import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import { makeStyles, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { getIn, getPDSUrl, getRedirectedUrl, prettify } from '../../../../../core/utils.js'
import { getDataByURI, setData } from '../../../../../core/redux/actions/actions'
import { ES_PATHS } from '../../../../../core/constants.js'

import OpenSeadragonViewer from '../../../../../components/OpenSeadragonViewer/OpenSeadragonViewer'
import MLLayers from './subcomponents/MLLayers/MLLayers'

const useStyles = makeStyles((theme) => ({
    MLClassification: {
        width: '100%',
        height: '100%',
        color: '#666',
        display: 'flex',
        background: theme.palette.swatches.grey.grey800,
        [theme.breakpoints.down('sm')]: {
            flexFlow: 'column',
        },
    },
    viewer: {
        height: '100%',
        flex: 1,
        [theme.breakpoints.down('sm')]: {
            minHeight: '60%',
            flex: 'unset',
            height: 'unset',
        },
    },
    layers: {
        width: 0,
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        background: theme.palette.swatches.grey.grey100,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            borderLeft: 'none',
            borderTop: `2px solid ${theme.palette.swatches.grey.grey200}`,
        },
        transition: 'width 0.2s ease-in-out',
    },
    layersOpen: {
        width: '300px',
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
}))

const MLClassification = (props) => {

    const { recordData } = props
    const c = useStyles()

    const dispatch = useDispatch()

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const [layersOpen, setLayersOpen] = useState(true)
    const [checkedClasses, setCheckedClasses] = useState({})
    const [confidence, setConfidence] = useState([0, 1])

    const layerColors = [
        '#FFB74D',
        '#FFF176',
        '#77EBBD',
        '#4DD0E1',
        '#C39EF2',
        '#F48FB1',
        '#cc8f33',
        '#3387cc',
    ]

    const DATA_TAG = 'mlClassification'
    const mlClassificationData = useSelector((state) => {
        return state.getIn(['data', DATA_TAG]).toJS()
    })
    const release_id = getIn(recordData, ES_PATHS.release_id)

    useEffect(() => {
        const dataURI = getIn(
            recordData,
            'gather.machine_learning.classification.related.overlay.uri'
        )
        if (Object.keys(mlClassificationData).length === 0) {
            getRedirectedUrl(getPDSUrl(dataURI, release_id))
                .then((url) => {
                    dispatch(getDataByURI(DATA_TAG, url, release_id, true))
                })
                .catch((err) => {})
        }
        // On unmount
        return () => {
            dispatch(setData(DATA_TAG, {}))
        }
    }, [])

    useEffect(() => {
        const features = mlClassificationData.features
        if (features) {
            const nextCheckedClasses = {}
            features.forEach((feature) => {
                const className = getIn(feature, 'properties.predicted_class', null)
                if (className && nextCheckedClasses[className] == null)
                    nextCheckedClasses[className] = {
                        on: true,
                        color: layerColors[Object.keys(nextCheckedClasses).length],
                    }
            })
            setCheckedClasses(nextCheckedClasses)
        }
    }, [JSON.stringify(mlClassificationData)])

    const browse_uri = getIn(recordData, ES_PATHS.browse)

    const imgURL = getPDSUrl(browse_uri, release_id)

    let features = mlClassificationData.features
    let featuresOn = []
    if (features) {
        features = features.map((feature) => {
            if (feature.geometry.type != null)
                feature.geometry.coordinates[0] = feature.properties.pixel_coordinates
            return feature
        })
    }
    if (features) {
        featuresOn = features.filter((f) => {
            const featureClass = getIn(f, 'properties.predicted_class', null)
            const featureConfidence = getIn(f, 'properties.posterior_probability', 1)
            if (
                Object.keys(checkedClasses).includes(featureClass) &&
                checkedClasses[featureClass].on === true &&
                featureConfidence >= confidence[0] &&
                featureConfidence <= confidence[1]
            ) {
                f._color = checkedClasses[featureClass].color
                return f
            }
        })
    }

    return (
        <div className={c.MLClassification}>
            <div className={c.viewer}>
                {features != null ? (
                    <OpenSeadragonViewer
                        image={{
                            src: imgURL,
                        }}
                        settings={{ defaultZoomLevel: 0.5 }}
                        onLayers={() => {
                            setLayersOpen(!layersOpen)
                        }}
                        features={featuresOn}
                    />
                ) : null}
            </div>
            <div
                className={clsx(c.layers, {
                    [c.layersOpen]: layersOpen,
                })}
            >
                <MLLayers
                    features={features}
                    classes={checkedClasses}
                    onChange={(type, state) => {
                        switch (type) {
                            case 'classes':
                                setCheckedClasses(state)
                                break
                            case 'confidence':
                                setConfidence(state)
                                break
                            default:
                        }
                    }}
                />
            </div>
        </div>
    )
}

MLClassification.propTypes = {
    recordData: PropTypes.object,
}

export default MLClassification;
