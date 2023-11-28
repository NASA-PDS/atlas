import L from 'leaflet'
import 'leaflet-draw'
import Wkt from 'wicket'

import { store } from '../../core/redux/store/store'
import { setMapSearchBoundary } from '../../core/redux/actions/actions.js'

/**
 * @class AstroDrawControl
 * @aka L.Control.AstroDrawControl
 * @extends L.Control
 * @classdesc
 * Class that extends from the class L.Control.Draw and handles the back-end when a user draws on the leaflet map.
 * Since this class inherits L.Control, it is added to the AstroMap in the same way as other controls, like the zoom control.
 *
 * @example
 *
 * // add a feature group to the map
 * let drawnItems = new L.FeatureGroup();
 * map.addLayer(drawnItems);
 *
 * // add draw control to map
 * let drawControl = new AstroDrawControl({
 *   edit: {
 *      featureGroup: drawnItems
 *   }
 * }).addTo(map);
 */
export default L.Control.AstroDrawControl = L.Control.Draw.extend({
    options: {
        draw: {
            rectangle: {
                shapeOptions: {
                    color: '#62c6f5',
                    opacity: 1,
                    fillColor: 'black',
                    weight: 2,
                },
            },
            polygon: false,
            circlemarker: false,
            polyline: false,
            circle: false,
            marker: false,
            edit: false,
        },
        edit: false,
    },

    /**
     * @function AstroDrawControl.prototype.onAdd
     * @description Adds the draw control to the map provided. Creates an on-draw and on-click event
     *              that allows users to draw polygons onto the leaflet map.
     * @param  {AstroMap} map - The AstroMap to add the control to.
     * @return {Object} The div-container the control is in.
     */
    onAdd: function (map) {
        this._map = map
        let container = L.DomUtil.create('div', 'leaflet-draw'),
            addedTopClass = false,
            topClassName = 'leaflet-draw-toolbar-top',
            toolbarContainer

        for (let toolbarId in this._toolbars) {
            if (this._toolbars.hasOwnProperty(toolbarId)) {
                toolbarContainer = this._toolbars[toolbarId].addToolbar(map)

                if (toolbarContainer) {
                    if (!addedTopClass) {
                        if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
                            L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName)
                        }
                        addedTopClass = true
                    }

                    container.appendChild(toolbarContainer)
                }
            }
        }

        this.wktTextBox = L.DomUtil.get('wktTextBox')
        this.wkt = new Wkt.Wkt()
        this.myLayer = L.Proj.geoJson().addTo(map)

        this.wktButton = L.DomUtil.get('wktButton')
        L.DomEvent.on(this.wktButton, 'click', this.mapWKTString, this)

        map.on('draw:created', this.onDraw, this)

        // map.on("projChange", this.reprojectFeature, this);

        return container
    },
    // When the control gets added to the map
    onAddControl: function () {
        /*
        const drawPolygon = document.getElementsByClassName('leaflet-draw-draw-polygon')[0]
        if (drawPolygon)
            drawPolygon.innerHTML = [
                `<svg style="width:24px; height:24px; padding: 3px; transform: scale(0.75);" viewBox="0 0 28 28">`,
                `<path stroke="currentColor" fill="none" d="M3.5 12.5L14 4.25L24.5 12.5L20.75 23.75H7.25L3.5 12.5Z" stroke-width="3"></path>`,
                `</svg>`,
            ].join('\n')
        */
        const drawRectangle = document.getElementsByClassName('leaflet-draw-draw-rectangle')[0]
        if (drawRectangle)
            drawRectangle.innerHTML = [
                `<svg style="width:24px; height:24px; padding: 3px; transform: scale(0.7);" viewBox="0 0 24 24">`,
                `<path stroke="currentColor" fill="none" d="M3,3V21H21V3Z" stroke-width="3"></path>`,
                `</svg>`,
            ].join('\n')

        document.getElementsByClassName('leaflet-draw-edit-edit')[0].remove()

        /*
        const drawCircleMarker = document.getElementsByClassName(
            'leaflet-draw-draw-circlemarker'
        )[0]
        if (drawCircleMarker)
            drawCircleMarker.innerHTML = [
                `<svg style="width:24px; height:24px; padding: 3px; transform: scale(0.75);" viewBox="0 0 24 24">`,
                `<path fill="currentColor" d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"></path>`,
                `</svg>`,
            ].join('\n')

        const drawEdit = document.getElementsByClassName('leaflet-draw-edit-edit')[0]
        if (drawEdit)
            drawEdit.innerHTML = [
                `<svg style="width:24px; height:24px; padding: 3px; transform: scale(0.75);" viewBox="0 0 24 24">`,
                `<path fill="currentColor" d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z"></path>`,
                `</svg>`,
            ].join('\n')
        */

        const drawRemove = document.getElementsByClassName('leaflet-draw-edit-remove')[0]
        if (drawRemove) {
            drawRemove.innerHTML = 'CLEAR BOUNDARY'
            drawRemove.addEventListener('click', (e) => {
                // Hacky but works
                const cancelButton = document.querySelector(
                    '.leaflet-draw-actions.leaflet-draw-actions-bottom li:last-child a'
                )
                if (cancelButton) cancelButton.click()

                store.dispatch(setMapSearchBoundary())
            })
        }
    },
    /**
     * @function AstroDrawControl.prototype.onDraw
     * @description Is called when a user draws a shape using the on map drawing features.
     * @param  {DomEvent} e  - On draw.
     */
    onDraw: function (e) {
        this.shapesToWKT(e)

        let geojson = e.layer.toGeoJSON()
        geojson = geojson['geometry']

        store.dispatch(setMapSearchBoundary(geojson))
    },
    /**
     * @function AstroDrawControl.prototype.shapesToWKT
     * @description Converts the shaped drawn into a Well-Known text string and inserts it into
     *              the Well-Known text box.
     * @param  {DomEvent} e  - On draw.
     */
    shapesToWKT: function (e) {
        this.myLayer.clearLayers()
        this.options.edit['featureGroup'].clearLayers()

        this.options.edit['featureGroup'].addLayer(e.layer)
        let geoJson = e.layer.toGeoJSON()
        geoJson = geoJson['geometry']

        this.wkt.read(JSON.stringify(geoJson))
        this.wktTextBox.value = this.wkt.write()
    },

    /**
     * @function AstroDrawControl.prototype.mapWKTString
     * @description  Is called when a user clicks the draw button below the AstroMap.
     *               Will take the Well-Known text string and draw the shape onto the map.
     *               If the Well-Known text string is invalid an error will show in the text box.
     * @param  {DomEvent} e  - On Click of Well-Known text button.
     */
    mapWKTString: function (e) {
        this.myLayer.clearLayers()
        this.options.edit['featureGroup'].clearLayers()

        let wktValue = this.wktTextBox.value

        try {
            this.wkt.read(wktValue)
        } catch (err) {
            alert('Invalid Well Known Text String')
            return
        }

        let geoJson = this.wkt.toJson()

        let geojsonFeature = {
            type: 'Feature',
            geometry: geoJson,
        }

        this.myLayer.addData(geojsonFeature)
    },

    // reprojectFeature: function(e) {

    // }
})
