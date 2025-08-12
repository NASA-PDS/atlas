import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

import {
    sAKeys,
    sASubscribe,
    sAGet,
} from '../../../../../../core/redux/actions/subscribableActions.js'
import { HASH_PATHS, ES_PATHS, AVAILABLE_URI_SIZES } from '../../../../../../core/constants'
import { getIn, getPDSUrl } from '../../../../../../core/utils'

// Kind of ugly but works
// CartoCosmos MapContainer looks at this too
// (Jokingly, the clusterGroup is "global")
window.clusterGroup = null
window.footprintsLayer = null
window.geoGridLayer = null
const targetPath = '_source.gather.common.target'
const geoLocPath = '_source.gather.common.geo_location'
const geoFptPath = '_source.gather.common.geo_footprint'
let hoverInfo = null
let gridHoverInfo = null

const MapListener = (props) => {
    const { parentClass, firstOpen } = props

    const navigate = useNavigate()

    const results = useSelector((state) => {
        const r = state.getIn(['results'])
        if (typeof r.toJS === 'function') return r.toJS()
        return r
    })
    const geoGrid = useSelector((state) => {
        return state.getIn(['geoGrid'])
    }).toJS()

    const updateMarker = (result) => {
        if (!window.CartoCosmosMap) return

        if (window.circleMarker) window.CartoCosmosMap.removeLayer(window.circleMarker)
        if (result) {
            const pos = getIn(result, geoLocPath)
            if (pos) {
                let target = window.CartoCosmosMap._target || 'None'
                target = target.toLowerCase()
                const targetList = getIn(result, targetPath) || []
                if (targetList.includes(target)) {
                    const lng = pos[1]
                    const lat = pos[0]
                    window.circleMarker = L.circleMarker([lat, lng], {
                        radius: 5,
                        color: 'white',
                        weight: '2',
                        fillColor: '#1c67e3',
                        fillOpacity: 1,
                    })
                    window.CartoCosmosMap.addLayer(window.circleMarker)
                    window.circleMarker.bringToFront()
                }
            }
        }
    }
    const updateClusters = (mapTarget) => {
        // Add cluster results to Map
        if (window.CartoCosmosMap && firstOpen) {
            if (window.clusterGroup != null) window.CartoCosmosMap.removeLayer(window.clusterGroup)
            window.clusterGroup = L.markerClusterGroup({ maxClusterRadius: 40 })
            const icon = L.divIcon({
                className: 'carto-result-div-icon',
                html: "<div style='width:12px;height:12px;border-radius:50%;border: 3px solid black;background:#ffd400;transition:background 0.2s ease-in;' class='marker-pin'></div>",
                iconSize: [12, 12],
                iconAnchor: [6, 6],
            })

            mapTarget = mapTarget.toLowerCase()
            results.forEach((r) => {
                const pos = getIn(r, geoLocPath)
                if (pos) {
                    const targetList = getIn(r, targetPath) || []
                    if (targetList.includes(mapTarget)) {
                        const lng = pos[0]
                        const lat = pos[1]
                        const marker = L.marker([lat, lng], { icon: icon })
                            .on('click', handleClick)
                            .on('mouseover', handleHover)
                            .on('mouseout', handleLeave)
                        marker.data = r
                        window.clusterGroup.addLayer(marker)
                    }
                }
            })
            if (window.clusterGroupOn === true)
                window.CartoCosmosMap.addLayer(window.footprintsLayer)
        }
    }
    const updateFootprints = (mapTarget) => {
        // Add cluster results to Map
        if (window.CartoCosmosMap && firstOpen) {
            if (window.footprintsLayer != null)
                window.CartoCosmosMap.removeLayer(window.footprintsLayer)

            const geojson = {
                type: 'FeatureCollection',
                features: [],
            }
            results.forEach((r) => {
                const fpt = getIn(r, geoFptPath)
                if (fpt) {
                    geojson.features.push({
                        type: 'Feature',
                        properties: {
                            uri: getIn(r._source, ES_PATHS.source),
                            pds_archive: {
                                file_name: getIn(r._source, ES_PATHS.file_name),
                            },
                            gather: {
                                pds_archive: {
                                    related: { browse: { uri: getIn(r._source, ES_PATHS.thumb) } },
                                },
                            },
                        },
                        geometry: {
                            type: 'Polygon',
                            coordinates: fpt.coordinates,
                        },
                    })
                }
            })

            let leafletLayerObject = {
                style: function (feature) {
                    return {
                        color: '#f64137',
                        weight: '2',
                        fillColor: 'black',
                        fillOpacity: 0.05,
                    }
                },
                onEachFeature: function (feature, layer) {
                    layer.on('mouseover', function (e) {
                        layer.setStyle({ fillOpacity: 0.15, weight: '3' })
                        handleHover(e)
                    })
                    layer.on('mouseout', function (e) {
                        layer.setStyle({ fillOpacity: 0.05, weight: '2' })
                        if (gridHoverInfo) gridHoverInfo.remove()
                        handleLeave()
                    })
                    layer.on('click', handleClick)
                },
            }

            window.footprintsLayer = L.geoJson(geojson, leafletLayerObject)

            if (window.footprintsLayerOn === true)
                window.CartoCosmosMap.addLayer(window.footprintsLayer)
        }
    }

    const updateGeoGrid = () => {
        // Add geo grid to Map
        if (window.CartoCosmosMap && geoGrid && firstOpen) {
            if (window.geoGridLayer != null) window.CartoCosmosMap.removeLayer(window.geoGridLayer)

            const geojson = {
                type: 'FeatureCollection',
                features: [],
            }
            let maxCount = 0
            geoGrid.forEach((g) => {
                if (g.doc_count > maxCount && g.key[0] != 's') maxCount = g.doc_count
            })
            geoGrid.forEach((g) => {
                // bbox is [minlat, minlon, maxlat, maxlon]
                geojson.features.push({
                    type: 'Feature',
                    properties: { count: g.doc_count, percent: g.doc_count / maxCount },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [
                                [g.bbox[1], g.bbox[2]],
                                [g.bbox[3], g.bbox[2]],
                                [g.bbox[3], g.bbox[0]],
                                [g.bbox[1], g.bbox[0]],
                            ],
                        ],
                    },
                })
            })

            let leafletLayerObject = {
                style: function (feature) {
                    return {
                        color: '#f64137',
                        weight: '0',
                        fillColor: 'black',
                        fillOpacity: feature.properties.percent,
                    }
                },
                onEachFeature: function (feature, layer) {
                    layer.on('mouseover', function (e) {
                        layer.setStyle({ weight: '2' })
                        gridHoverInfo = document.createElement('div')
                        gridHoverInfo.textContent = feature.properties.count
                        gridHoverInfo.style.background = '#f7f7f7'
                        gridHoverInfo.style.height = '20px'
                        gridHoverInfo.style.lineHeight = '20px'
                        gridHoverInfo.style.position = 'fixed'
                        gridHoverInfo.style.top = `${e.originalEvent.y - 10}px`
                        gridHoverInfo.style.left = `${e.originalEvent.x + 30}px`
                        gridHoverInfo.style.padding = '0px 10px'
                        gridHoverInfo.style.textAlign = 'center'
                        gridHoverInfo.style.color = 'black'
                        gridHoverInfo.style.boxShadow = '0px 1px 3px 0px rgba(0,0,0,0.2)'
                        gridHoverInfo.style.borderRadius = '2px'
                        gridHoverInfo.style.zIndex = 99999
                        document.body.appendChild(gridHoverInfo)
                    })
                    layer.on('mouseout', function () {
                        layer.setStyle({ weight: '0' })
                        if (gridHoverInfo) gridHoverInfo.remove()
                    })
                },
            }

            window.geoGridLayer = L.geoJson(geojson, leafletLayerObject)

            if (window.geoGridLayerOn === true) window.CartoCosmosMap.addLayer(window.geoGridLayer)
        }
    }

    const handleClick = (e) => {
        const s = e.target.data
            ? getIn(e.target, 'data._source')
            : getIn(e.target, 'feature.properties')
        setTimeout(() => {
            navigate(`${HASH_PATHS.record}?uri=${getIn(s, ES_PATHS.source)}`)
        }, 200)
    }
    const handleHover = (e) => {
        const parentDiv = document.getElementsByClassName(parentClass)[0]
        if (!parentDiv) return

        const s = e.target.data
            ? getIn(e.target, 'data._source')
            : getIn(e.target, 'feature.properties')

        handleLeave()

        if (e.target._icon) e.target._icon.children[0].style.background = 'red'

        if (hoverInfo == null) {
            hoverInfo = document.createElement('div')
            hoverInfo.id = '_MapListener_hover_info'
        }

        const release_id = getIn(s, ES_PATHS.release_id)

        const thumb_id = getIn(s, ES_PATHS.thumb)

        const imgURL = getPDSUrl(thumb_id, release_id, AVAILABLE_URI_SIZES.sm)

        const width = 180
        /*
        let markup = [
            `<img src="${imgURL}" width="${width}" height="${width}" style="object-fit: contain;" />`,
            `<div style="padding: 4px 8px; text-align: center; overflow: hidden; text-overflow: ellipsis;">`,
            getIn(s, 'pds_archive.file_name'),
            '</div>',
        ].join('\n')
        hoverInfo.innerHTML = markup
        */

        hoverInfo.replaceChildren();

        const hoverInfoImg = document.createElement('img')
        hoverInfoImg.src = imgURL
        hoverInfoImg.width = width
        hoverInfoImg.height = width
        hoverInfoImg.style.objectFit = 'contain'
        hoverInfo.appendChild(hoverInfoImg)

        const hoverInfoDiv = document.createElement('div')
        hoverInfoDiv.style.padding = '4px 8px'
        hoverInfoDiv.style.textAlign = 'center'
        hoverInfoDiv.style.overflow = 'hidden'
        hoverInfoDiv.style.textOverflow = 'ellipsis'
        hoverInfoDiv.textContent = getIn(s, 'gather.pds_archive.file_name')
        hoverInfo.appendChild(hoverInfoDiv)

        hoverInfo.style.position = 'absolute'
        hoverInfo.style.width = `${width}px`
        hoverInfo.style.height = `${width + 27}px`
        hoverInfo.style.display = 'flex'
        hoverInfo.style.flexFlow = 'column'
        hoverInfo.style.background = '#000000'
        hoverInfo.style.color = '#fdfdfd'
        hoverInfo.style.fontSize = '16px'
        hoverInfo.style.boxShadow = '0px 2px 2px 0px rgba(0,0,0,0.2)'
        hoverInfo.style.borderRadius = '2px'
        hoverInfo.style.zIndex = 9001
        hoverInfo.style.opacity = 1
        hoverInfo.style.pointerEvents = 'none'
        hoverInfo.style.transition = 'opacity 0.2s ease-in'
        hoverInfo.style.transform = 'translateX(-50%)'
        hoverInfo.style.left = `${e.containerPoint.x + 0}px`
        hoverInfo.style.top = `${e.containerPoint.y - width + 6}px`

        parentDiv.appendChild(hoverInfo)
    }
    const handleLeave = (e) => {
        if (e) e.target._icon.children[0].style.background = '#ffd400'

        if (hoverInfo) {
            hoverInfo.style.opacity = 0
        }
    }

    useEffect(() => {
        sASubscribe(sAKeys.HOVERED_RESULT, 'MapListener_Hover', updateMarker)
        sASubscribe(sAKeys.MAP_TARGET, 'MapListener_Cluster', updateClusters)
        sASubscribe(sAKeys.MAP_TARGET, 'MapListener_Cluster', updateFootprints)
        sASubscribe(sAKeys.MAP_TARGET, 'MapListener_GeoGrid', updateGeoGrid)
    })

    useEffect(() => {
        updateClusters(sAGet(sAKeys.MAP_TARGET))
    }, [results, firstOpen])
    useEffect(() => {
        updateFootprints(sAGet(sAKeys.MAP_TARGET))
    }, [results, firstOpen])
    useEffect(() => {
        updateGeoGrid()
    }, [geoGrid, firstOpen])

    return null
}

MapListener.propTypes = {
    parentClass: PropTypes.string,
}

export default MapListener
