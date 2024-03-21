import React, { useEffect, useState } from 'react'
import OpenSeadragon from 'openseadragon'
import 'svg-overlay'
import PropTypes from 'prop-types'

import clsx from 'clsx'

import { makeStyles } from '@material-ui/core/styles'

import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import HomeIcon from '@material-ui/icons/Home'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import RotateLeftIcon from '@material-ui/icons/RotateLeft'
import RotateRightIcon from '@material-ui/icons/RotateRight'
import LayersIcon from '@material-ui/icons/Layers'

import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'

import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined'

import './OpenSeadragon.css'

const useStyles = makeStyles((theme) => ({
    OpenSeadragonViewer: {
        width: '100%',
        height: '100%',
        background: theme.palette.swatches.grey.grey800,
        position: 'relative',
    },
    OpenSeadragonContainer: {
        width: '100%',
        height: '100%',
    },
    uiOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        padding: theme.spacing(1),
        boxSizing: 'border-box',
    },
    topLeft: {
        paddingTop: theme.spacing(1),
    },
    topRight: {
        width: '37px',
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '4px',
        paddingTop: theme.spacing(2),
    },
    bottomRight: {
        paddingBottom: theme.spacing(2),
    },
    button: {
        'display': 'block !important',
        'pointerEvents': 'all',
        'background': theme.palette.swatches.grey.grey150,
        'padding': theme.spacing(1),
        'margin': theme.spacing(0, 1),
        'borderRadius': 0,
        '&:hover': {
            background: theme.palette.swatches.grey.grey200,
        },
    },
    gap: {
        marginBottom: theme.spacing(2),
    },
    joiner: {
        borderBottom: '1px solid rgba(0,0,0,0.17)',
    },
    openFailedWrapper: {
        opacity: 0,
        transition: `0.2s ease-in opacity`,
        pointerEvents: 'none',
    },
    openFailedShown: {
        pointerEvents: 'initial',
        opacity: 1,
    },
    status: {
        'position': 'absolute',

        'background': theme.palette.swatches.grey.grey800,
        'top': 0,
        'width': '100%',
        'height': '100%',
        'transition': 'all 0.2s ease-out',
        '& > div': {
            transition: 'background 0.4s ease-out',
        },
        '& > div > div': {
            transition: 'background 0.4s ease-out',
        },
    },
    statusHidden: {
        pointerEvents: 'none',
        opacity: 1,
    },
    statusPaper: {
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'transform': 'translateX(-50%) translateY(-50%)',
        'background': theme.palette.primary.main,
        'opacity': 0.75,
        '& > div': {
            padding: `${theme.spacing(4)}px ${theme.spacing(6)}px`,
        },
    },
    statusError: {
        background: theme.palette.accent.main,
        fontSize: '16px',
        color: theme.palette.text.secondary,
        paddingBottom: theme.spacing(0.5),
    },
    statusErrorTitle: {
        'display': 'flex',
        'justifyContent': 'center',
        'fontSize': '24px',
        'fontWeight': 'bold',
        'marginBottom': theme.spacing(1.5),
        '& > div': {
            marginLeft: theme.spacing(1.5),
        },
    },
    statusErrorMessage: {
        textAlign: 'center',
        margin: '0px 5%',
        maxWidth: '550px',
        color: theme.palette.swatches.grey.grey100,
    },
}))

const OpenSeadragonViewer = ({ image, settings, features, onLayers }) => {
    const [viewer, setViewer] = useState(null)
    const [openFailed, setOpenFailed] = useState(false)
    const [svgOverlay, setSvgOverlay] = useState(null)

    const c = useStyles()

    settings = settings || {}

    const InitOpenSeadragon = () => {
        viewer && viewer.destroy()
        setViewer(
            OpenSeadragon({
                id: 'openSeadragon',
                zoomInButton: 'osd-zoomin',
                zoomOutButton: 'osd-zoomout',
                homeButton: 'osd-home',
                fullPageButton: 'osd-fullscreen',
                rotateLeftButton: 'osd-rotateleft',
                rotateRightButton: 'osd-rotateright',
                animationTime: 0.5,
                blendTime: 0.4,
                constrainDuringPan: true,
                maxZoomPixelRatio: 8,
                minZoomLevel: 0.35,
                visibilityRatio: 0.95,
                zoomPerScroll: 2,
                showNavigator: true,
                showRotationControl: true,
                degrees: window.atlasGlobal.imageRotation || 0,
                navigatorPosition: 'BOTTOM_LEFT',
                navigatorSizeRatio: 0.14,
                ...settings,
            })
        )
    }
    // Make viewer
    useEffect(() => {
        InitOpenSeadragon()
        return () => {
            viewer && viewer.destroy()
        }
    }, [])

    // Update image when changed
    useEffect(() => {
        if (image && image.src && viewer) {
            setOpenFailed(false)
            viewer.removeHandler('open')
            viewer.addHandler('open', function (e) {
                const so = viewer.svgOverlay()
                setSvgOverlay(so)
                drawFeatures(so, features)
            })
            viewer.open({
                type: 'image',
                url: image.src,
                buildPyramid: false,
            })
        }
    }, [image.src, viewer])

    useEffect(() => {
        if (viewer && svgOverlay) {
            drawFeatures(viewer.svgOverlay(), features)
        }
    }, [features])

    useEffect(() => {
        // Make all the canvases pixelated
        if (viewer && viewer.canvas && viewer.canvas.childNodes) {
            viewer.canvas.childNodes.forEach((canvas) => {
                if (typeof canvas.getContext === 'function') {
                    const ctx = canvas.getContext('2d')
                    ctx.imageSmoothingEnabled = false
                }
            })
        }
        // Set open failed event
        if (viewer) {
            viewer.addHandler('open-failed', () => {
                setOpenFailed(true)
            })
        }
    }, [viewer])

    return (
        <div className={c.OpenSeadragonViewer}>
            <div id="openSeadragon" className={c.OpenSeadragonContainer}></div>
            <div className={c.uiOverlay}>
                <div className={c.topLeft}>
                    <IconButton
                        id="osd-home"
                        className={clsx(c.button, c.joiner)}
                        title="Home"
                        aria-label="image view home"
                        onClick={() => {
                            viewer.viewport.setRotation(0)
                        }}
                    >
                        <HomeIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        id="osd-fullscreen"
                        className={clsx(c.button, c.gap)}
                        title="Fullscreen"
                        aria-label="image view fullscreen"
                    >
                        <FullscreenIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        id="osd-rotateleft"
                        className={clsx(c.button, c.joiner)}
                        title="Rotate Counter-Clockwise"
                        aria-label="image view rotate counter clockwise"
                    >
                        <RotateLeftIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        id="osd-rotateright"
                        className={c.button}
                        title="Rotate Clockwise"
                        aria-label="image view rotate clockwise"
                    >
                        <RotateRightIcon fontSize="inherit" />
                    </IconButton>
                </div>
                <div className={c.topRight}>
                    {onLayers ? (
                        <IconButton
                            className={clsx(c.button, c.gap)}
                            title="Layers"
                            aria-label="image view layers"
                            onClick={onLayers}
                        >
                            <LayersIcon fontSize="inherit" />
                        </IconButton>
                    ) : null}
                </div>
                <div className={c.bottomRight}>
                    <IconButton
                        id="osd-zoomin"
                        className={clsx(c.button, c.joiner)}
                        title="Zoom In"
                        aria-label="image view zoom in"
                    >
                        <AddIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                        id="osd-zoomout"
                        className={c.button}
                        title="Zoom Out"
                        aria-label="image view zoom out"
                    >
                        <RemoveIcon fontSize="inherit" />
                    </IconButton>
                </div>
            </div>
            <div className={clsx(c.openFailedWrapper, { [c.openFailedShown]: openFailed })}>
                <div className={clsx(c.status, { [c.statusHidden]: !openFailed })}>
                    <Paper className={c.statusPaper} elevation={2}>
                        <div className={c.statusError}>
                            <div className={c.statusErrorTitle}>
                                <Tooltip title={''} arrow placement="left-end">
                                    <ErrorOutlineOutlinedIcon fontSize="large" />
                                </Tooltip>
                                <div>This product doesn't have a browse image.</div>
                            </div>
                            <div className={c.statusErrorMessage}>
                                Not all do. That's okay. You can still view the label, download the
                                source product and add it to the cart.
                            </div>
                        </div>
                    </Paper>
                </div>
            </div>
        </div>
    )
}

function drawFeatures(overlay, features) {
    if (overlay && features) {
        overlay.node().innerHTML = ''
        const imageSize = overlay._viewer.world._contentSize
        features.forEach((feature) => {
            const geom = feature.geometry
            let points
            let polygon
            if (geom) {
                switch (geom.type) {
                    case 'Polygon':
                        points = []
                        geom.coordinates[0].forEach((coord) => {
                            points.push(`${coord[0] / imageSize.x},${coord[1] / imageSize.x}`)
                        })
                        polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
                        polygon.setAttribute('points', points.join(' '))
                        polygon.setAttribute(
                            'style',
                            `fill:transparent;stroke:${feature._color};stroke-width:${
                                10 / ((imageSize.x + imageSize.y) / 2)
                            }`
                        )
                        overlay.node().appendChild(polygon)
                        break
                    default:
                        console.log(imageSize)
                        // Full image
                        points = [
                            `0,0`,
                            `1,0`,
                            `1,${imageSize.y / imageSize.x}`,
                            `0,${imageSize.y / imageSize.x}`,
                            `0,0`,
                        ]
                        polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
                        polygon.setAttribute('points', points.join(' '))
                        polygon.setAttribute(
                            'style',
                            `fill:transparent;stroke:${feature._color};stroke-width:${
                                4 / ((imageSize.x + imageSize.y) / 2)
                            }`
                        )
                        overlay.node().appendChild(polygon)
                }
            }
        })
    }
}

OpenSeadragonViewer.propTypes = {}

export default OpenSeadragonViewer
