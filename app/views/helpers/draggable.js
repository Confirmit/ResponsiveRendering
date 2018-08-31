import $ from "jquery";
import Event from "../../event";

export default class Draggable {
    constructor(node, options = {}) {
        this._options = {};
        this._container = node;
        this._handle = options !== undefined && options.handle.length > 0 ? options.handle : this._container;

        this._dragStartEvent = new Event('dragStart');
        this._dragEndEvent = new Event('dragEnd');
        this._dragged = false;

        this._attachControlHandlers();
    }

    get dragEndEvent() {
        return this._dragEndEvent;
    }

    get dragStartEvent() {
        return this._dragStartEvent;
    }

    _attachControlHandlers() {
        this._handle.on('mousedown', this._handleDragStart.bind(this));
        $(window).on('mouseup', this._handleDragEnd.bind(this));
        $(window).on('resize', this._onResizeHandler.bind(this));
    }

    _getCoordinates(node) {
        const coordinates = node[0].getBoundingClientRect();
        return {
            height: coordinates.height,
            width: coordinates.width,
            x: coordinates.x !== undefined ? coordinates.x : coordinates.left,
            y: coordinates.y !== undefined ? coordinates.y : coordinates.top,
        }
    }

    _preventSelection(value) {
        const cssValue = value === true ? 'none' : '';
        $('body').css({'pointer-events': cssValue, 'user-select': cssValue});
    }

    _setPosition(x = 0, y = 0) {
        const containerCoordinates = this._getCoordinates(this._container);

        if (y < 0) {
            y = 0;
        }
        if (y > window.innerHeight - containerCoordinates.height) {
            y = window.innerHeight - containerCoordinates.height;
        }

        if (x < 0) x = 0;
        if (x > window.innerWidth - containerCoordinates.width) {
            x = window.innerWidth - containerCoordinates.width;
        }

        this._container.css({
            'top': y.toString() + 'px',
            'left': x.toString() + 'px'
        });
    }

    _onResizeHandler() {
        const containerCoordinates = this._getCoordinates(this._container);
        let x = containerCoordinates.x;
        let y = containerCoordinates.y;

        if (containerCoordinates.x + containerCoordinates.width > window.innerWidth) {
            x = window.innerWidth - containerCoordinates.width;
            y = containerCoordinates.y;
        }

        if (containerCoordinates.y + containerCoordinates.height > window.innerHeight) {
            x = containerCoordinates.x;
            y = window.innerHeight - containerCoordinates.height;
        }

        this._setPosition(x, y);
    }

    _handleDragStart(event) {
        if (event.which !== 1) {
            return;
        }

        this._dragged = true;
        const containerCoordinates = this._getCoordinates(this._container);
        const shiftX = event.pageX - containerCoordinates.x;
        const shiftY = event.pageY - containerCoordinates.y;

        this._preventSelection(true);
        $(window).on('mousemove', null, {
            shiftX,
            shiftY,
            _setPosition: this._setPosition.bind(this)
        }, this._handleDragMove);

        this._dragStartEvent.trigger(event);

    }

    _handleDragMove(event) {
        const newY = event.pageY - event.data.shiftY;
        const newX = event.pageX - event.data.shiftX;

        event.data._setPosition(newX, newY);
    }

    _handleDragEnd(event) {
        if (event.which !== 1 || this._dragged === false) {
            return;
        }

        this._preventSelection(false);
        $(window).off('mousemove', this._handleDragMove);
        this._dragged = false;

        const containerCoordinates = this._getCoordinates(this._container);
        this._dragEndEvent.trigger({x: containerCoordinates.x, y: containerCoordinates.y});
    }
}