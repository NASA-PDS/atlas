import L from 'leaflet'

/**
 * @class ViewCenterControl
 * @aka L.Control.ViewCenterControl
 * @inherits L.Control
 *
 * @classdesc Control that allows users to reposition the map to the center while maintaining current zoom level.
 */
export default L.Control.ViewCenter = L.Control.extend({
    options: {
        position: 'topleft',
    },

    /**
     * @function ViewCenterControl.prototype.onAdd
     * @description Creates new container holding the ViewCenter button
     * @param  {AstroMap} map - The map to add the control to.
     * @return {Div} Container containing the ViewCenter button.
     */
    onAdd: function (map) {
        let container = L.DomUtil.create('div', 'leaflet-bar')
        let className = 'leaflet-control-view-center'

        this._createButton(className, container, map)

        return container
    },
    onAddControl: function () {
        const fullscreen = document.getElementsByClassName('leaflet-control-fullscreen-button')[0]
        if (fullscreen)
            fullscreen.innerHTML = [
                `<svg style="width:24px; height:24px; padding: 3px; transform: scale(0.75);" viewBox="0 0 24 24">`,
                `<path fill="currentColor" d="M4.5 15H1.5V22.5H9V19.5H4.5V15ZM1.5 9H4.5V4.5H9V1.5H1.5V9ZM19.5 19.5H15V22.5H22.5V15H19.5V19.5ZM15 1.5V4.5H19.5V9H22.5V1.5H15Z"></path>`,
                `</svg>`,
            ].join('\n')
    },

    /**
     * @function ViewCenterControl.prototype._createButton
     * @description Creates new link element inside the ViewCenter container and provides onclick functionality to reposition the map view to the map's center based on its current projection.
     * @param  {String} className - The name of the element's class.
     * @param  {Div} container - The container object to put the element into.
     * @param  {AstroMap} map - The map to add the control to.
     * @return {Link} Element containing the ViewCenter link.
     */
    _createButton: function (className, container, map) {
        let link = L.DomUtil.create('a', className, container)
        link.href = '#'
        link.title = 'Home'
        link.innerHTML = [
            '<svg style="width:24px; height:24px; padding: 3px; transform: scale(0.75);" viewBox="0 0 24 24">',
            '<path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />',
            '</svg>',
        ].join('\n')

        L.DomEvent.on(
            link,
            'click',
            function () {
                map.setView(map.center(), 0)
            },
            map
        )
        return link
    },
})
