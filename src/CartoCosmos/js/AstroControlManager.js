import L from 'leaflet'
import '../../external/leaflet-fullscreen/leaflet.fullscreen'

import ProjectionControl from './ProjectionControl'
import MousePositionControl from './MousePositionControl'
import AstroDrawControl from './AstroDrawControl'
import ViewCenterControl from './ViewCenterControl'

/**
 * @class AstroControlManager
 * @aka L.Class.AstroControlManager
 * @inherits L.Class
 *
 * @classdesc
 * Adds all of the needed controls to the AstroMap.
 */
export default L.AstroControlManager = L.Class.extend({
    /**
     * @function AstroControlManager.prototype.initialize
     * @description Creates all of the required controls.
     * @param {AstroMap} map - The AstroMap to add the controls to. We need to pass in the map here
     *                         because the drawnItems FeatureGroup needs it when initialized.
     */
    initialize: function (map) {
        this._controls = []

        //Top Left=====
        // Home
        this._viewCenterControl = new ViewCenterControl()
        this._controls.push(this._viewCenterControl)
        // Fullscreen
        this._fullscreenControl = new L.Control.Fullscreen()
        this._controls.push(this._fullscreenControl)
        // Draw
        let drawnItems = new L.FeatureGroup()
        map.addLayer(drawnItems)
        this._drawControl = new AstroDrawControl({
            edit: {
                featureGroup: drawnItems,
            },
        })
        this._controls.push(this._drawControl)
        // Settings

        //Bottom Left=====
        // Scale
        this._scaleControl = new L.Control.Scale({ imperial: false })
        this._scaleControl.setPosition('bottomleft')
        this._controls.push(this._scaleControl)

        //Top Right=====
        // Layers
        // Projection
        this._projControl = new ProjectionControl()
        this._projControl.setPosition('topright')
        this._controls.push(this._projControl)

        //Bottom Right=====
        // Zoom
        this._zoomControl = new L.Control.Zoom()
        this._zoomControl.setPosition('bottomright')
        this._controls.push(this._zoomControl)

        this._mouseControl = new MousePositionControl({
            numDigits: 6,
        })
        this._controls.push(this._mouseControl)
    },

    /**
     * @function AstroControlManager.prototype.addTo
     * @description Adds all of the controls to the AstroMap.
     * @param {AstroMap} map - The AstroMap to add the controls to.
     */
    addTo: function (map) {
        this._controls.forEach(function (control, index) {
            map.addControl(control)
        })

        this.onAddControls()
    },

    /**
     * @function AstroControlManager.prototype.reorderControls
     * @description Removes/adds the existing controls to the map so that the
     *              sidebar control is at the top.
     * @param {AstroMap} map - The AstroMap to add the controls to.
     */
    reorderControls: function (map) {
        this._controls.forEach(function (control, index) {
            map.removeControl(control)
        })

        this._controls.forEach(function (control, index) {
            map.addControl(control)
        })
        this.onAddControls()
    },
    onAddControls: function () {
        this._controls.forEach(function (control, index) {
            if (typeof control.onAddControl === 'function') control.onAddControl()
        })
        this.onAddControl()
    },
    // onAddControls that don't fit elsewhere
    onAddControl: function () {
        const layersToggle = document.getElementsByClassName('leaflet-control-layers-toggle')[0]
        if (layersToggle)
            layersToggle.innerHTML = [
                `<svg style="width:34px; height:34px; transform: scale(0.75);" viewBox="0 0 24 24">`,
                `<path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z"></path>`,
                `</svg>`,
            ].join('\n')
    },
})
