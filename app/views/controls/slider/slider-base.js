import Event from 'event.js';
import KEYS from "../../helpers/keyboard-keys";
import Utils from 'utils.js';
import $ from 'jquery';

// TODO: could be good to hide handle before init, or add common functionality into base question view to hide content before init.
export default class SliderBase {
    /**
     * @param sliderNodeId {string} - slider node id
     * @param values {Object[]} - array of values
     * @param value {Object} - current slider value
     * @param textValueHandler {function} - (sliderValue) => { return "text representation of slider value" }
     * @param isProgressSlider {boolean} is slider have progress indication on track
     * @param readOnly {boolean} is slider has to be in read only mode
     */
    constructor(sliderNodeId, values = [], value = null, textValueHandler = null, isProgressSlider = false, readOnly = false) {
        this._values = values;
        this._valueIndex = -1;
        this._trackIntervals = [];
        this._trackPageUpPageDownStep = 1;
        this._isSliding = false;
        this._isProgressSlider = isProgressSlider;
        this._readOnly = readOnly;

        this._textValueHandler = textValueHandler;

        this._changeEvent = new Event('slider:change');

        this._sliderNode = $(`#${sliderNodeId}`);
        this._handleNode = this._sliderNode.find('.cf-slider__handle');
        this._noValueNode = this._sliderNode.find('.cf-slider__no-value');
        this._trackNode = this._sliderNode.find('.cf-slider__track-area');
        this._progressNode = this._sliderNode.find('.cf-slider__track-highlight');

        this._sliderNodeSlidingModifierClass = 'cf-slider--sliding';
        this._handleNodeNoValueModifierClass = 'cf-slider__handle--no-value';

        this._init(value);
    }

    /**
     * Get slider value
     * @return {Object|null} current slider value
     */
    get value() {
        return this._values[this._valueIndex] || null;
    }

    /**
     * Set slider value
     * @param newValue
     */
    set value(newValue) {
        this._setValueIndex(this._values.findIndex(value => value === newValue));
    }

    /**
     * Fires after slider values is changed
     * @return {Event}
     */
    get changeEvent() {
        return this._changeEvent;
    }

    /**
     * Set slider value silently without triggering change event
     * @param newValue
     */
    setValueSilently(newValue) {
        this._setValueIndex(this._values.findIndex(value => value === newValue), true);
    }

    /**
     * Detach slider control from DOM
     */
    detachFromDOM() {
        this._trackNode.off('click', this._onTrackClick);
        this._noValueNode.off('click', this._onNoValueNodeClick);

        this._handleNode.off('mousedown', this._onHandleMouseDown);
        $(document).off('mousemove', this._onDocumentMouseMove);
        $(document).off('mouseup', this._onDocumentMouseUp);

        this._handleNode.off('touchstart', this._onHandleTouchStart);
        $(document).off('touchmove', this._onDocumentTouchMove);
        $(document).off('touchend', this._onDocumentTouchEnd);

        this._handleNode.off('keydown', this._onHandleKeyPress);
    }

    _init(value) {
        this._calculateTrackIntervals();
        this._calculateTrackPageUpPageDownStep();
        this._attachToDOM();

        this.value = value;

        if (this._valueIndex === -1) {
            this._syncHandlePositionToIndexValue();
            this._syncProgressToIndexValue();
            this._updateNoValueCSSAttribute();
        }
    }

    // TODO: make an optimization for a large number of values, when interval less than one pixel.
    _calculateTrackIntervals() {
        const intervalSize = 100 / (this._values.length);
        for (let i = 0; i < this._values.length; i++) {
            let startInterval = Utils.round(i * intervalSize, 2);
            let endInterval = Utils.round((i + 1) * intervalSize, 2);

            this._trackIntervals.push([startInterval, endInterval]);
        }
    }

    _calculateTrackPageUpPageDownStep() {
        if (this._values.length < 10) {
            this._trackPageUpPageDownStep = 1;
        }
        this._trackPageUpPageDownStep = Math.round(this._values.length / 5);
    }

    _attachToDOM() {
        // click
        this._onTrackClick = this._onTrackClick.bind(this);
        this._onNoValueNodeClick = this._onNoValueNodeClick.bind(this);
        this._trackNode.on('click', this._onTrackClick);
        this._noValueNode.on('click', this._onNoValueNodeClick);

        // mouse
        this._onHandleMouseDown = this._onHandleMouseDown.bind(this);
        this._onDocumentMouseMove = this._onDocumentMouseMove.bind(this);
        this._onDocumentMouseUp = this._onDocumentMouseUp.bind(this);

        this._handleNode.on('mousedown', this._onHandleMouseDown);
        $(document).on('mousemove', this._onDocumentMouseMove);
        $(document).on('mouseup', this._onDocumentMouseUp);

        // touch
        this._onHandleTouchStart = this._onHandleTouchStart.bind(this);
        this._onDocumentTouchMove = this._onDocumentTouchMove.bind(this);
        this._onDocumentTouchEnd = this._onDocumentTouchEnd.bind(this);

        this._handleNode.on('touchstart', this._onHandleTouchStart);
        $(document).on('touchmove', this._onDocumentTouchMove);
        $(document).on('touchend', this._onDocumentTouchEnd);

        //keyboard
        this._onHandleKeyPress = this._onHandleKeyPress.bind(this);
        this._handleNode.on('keydown', this._onHandleKeyPress);
    }

    _getValueIndexByTrackValue(trackValue) {
        const search = (minIndex, maxIndex) => {
            if(minIndex > maxIndex) {
                return -1;
            }
            const midIndex = Math.floor((minIndex + maxIndex) / 2);
            const interval = this._trackIntervals[midIndex];
            if(trackValue < interval[0]) {
                return search(minIndex, midIndex - 1);
            }
            if(trackValue > interval[1]) {
                return search(midIndex + 1, maxIndex);
            }
            return midIndex;
        };

        return search(0, this._trackIntervals.length - 1);
    }

    _setValueIndex(value, isSilent = false) {
        if (this._valueIndex === value || this._readOnly) {
            return;
        }

        this._valueIndex = value;

        this._syncHandlePositionToIndexValue();
        this._syncProgressToIndexValue();
        this._updateNoValueCSSAttribute();
        this._updateAccessibilityState();

        if(!isSilent) {
            this._changeEvent.trigger();
        }
    }

    // track value in percent
    _getTrackValue(absoluteValue) {
        if (absoluteValue < 0) {
            absoluteValue = 0;
        }

        if (absoluteValue > this._getTrackNodeSize()) {
            absoluteValue = this._getTrackNodeSize();
        }

        return Math.floor((absoluteValue / this._getTrackNodeSize()) * 100);
    }

    _getTrackValueByInterval(interval) {
        return Utils.floor(((interval[0] + interval[1]) / 2), 2);
    }

    // eslint-disable-next-line no-unused-vars
    _setProgressNodeSize(progressValue) {
        throw "Not implemented exception";
    }

    // eslint-disable-next-line no-unused-vars
    _setHandleNodePosition(position) {
        throw "Not implemented exception";
    }

    _getTrackNodeSize() {
        throw "Not implemented exception";
    }

    _getHandleNodeSize() {
        throw "Not implemented exception";
    }

    _getHandleNodeMargin() {
        throw "Not implemented exception";
    }

    _getNoValueNodeOffset() {
        throw "Not implemented exception";
    }

    _getTrackNodeOffset() {
        throw "Not implemented exception";
    }

    _getNoValueHandleNodePosition() {
        throw "Not implemented exception";
    }

    // eslint-disable-next-line no-unused-vars
    _getMouseEventPointerPosition(event) {
        throw "Not implemented exception";
    }

    // eslint-disable-next-line no-unused-vars
    _getTouchEventPointerPosition(event) {
        throw "Not implemented exception";
    }

    // eslint-disable-next-line no-unused-vars
    _getPointerPositionOnTheTrack(pointerPosition) {
        throw "Not implemented exception";
    }

    _moveHandleNode(trackValue) {
        this._setHandleNodePosition(`${trackValue}%`);
    }

    _moveHandleNodeByAbsoluteValue(absoluteTrackValue) {
        this._setHandleNodePosition(`${absoluteTrackValue}px`);
    }

    _moveHandleToNoValuePosition() {
        this._moveHandleNodeByAbsoluteValue(this._getNoValueHandleNodePosition());
    }

    _moveHandleBack() {
        if (this._valueIndex > -1) {
            this._setValueIndex(this._valueIndex - 1);
        }
    }

    _moveHandleForward() {
        if (this._valueIndex < this._values.length - 1) {
            this._setValueIndex(this._valueIndex + 1)
        }
    }

    _setProgress(trackValue) {
        this._setProgressNodeSize(trackValue);
    }

    _syncHandlePositionToIndexValue() {
        if (this._valueIndex === -1) {
            this._moveHandleToNoValuePosition();
            return;
        }

        const interval = this._trackIntervals[this._valueIndex];
        const trackValue = this._getTrackValueByInterval(interval);

        this._moveHandleNode(trackValue);
    }

    _syncProgressToIndexValue() {
        if(!this._isProgressSlider) {
            return;
        }

        if (this._valueIndex === -1) {
            this._setProgress(0);
            return;
        }

        const interval = this._trackIntervals[this._valueIndex];
        const trackValue = this._getTrackValueByInterval(interval);

        this._setProgress(trackValue);
    }

    _updateNoValueCSSAttribute() {
        this._toggleHandleNodeNoValueCSSModifier(this._valueIndex === -1);
    }

    _updateAccessibilityState() {
        let textValue = null;
        if (this._textValueHandler !== null) {
            textValue = this._textValueHandler(this.value);
        } else if (this._valueIndex > -1) {
            textValue = this.value;
        }
        this._handleNode.attr('aria-valuetext', textValue);
        this._handleNode.attr('aria-valuenow', this._valueIndex);
    }

    _toggleHandleNodeNoValueCSSModifier(add) {
        if (add) {
            this._handleNode.addClass(this._handleNodeNoValueModifierClass);
        } else {
            this._handleNode.removeClass(this._handleNodeNoValueModifierClass);
        }
    }

    _handleCommonKeys(keyCode) {
        let newIndex = this._valueIndex;
        switch (keyCode) {
            case KEYS.Home:
                newIndex = 0;
                break;
            case KEYS.End:
                newIndex = this._values.length - 1;
                break;
            case KEYS.PageUp:
                if(this._valueIndex === -1) {
                    newIndex = 0;
                } else {
                    newIndex = this._valueIndex + this._trackPageUpPageDownStep;
                    if (newIndex > this._values.length - 1) {
                        newIndex = this._values.length - 1;
                    }
                }
                break;
            case KEYS.PageDown:
                newIndex = this._valueIndex - this._trackPageUpPageDownStep;
                if (newIndex < 0) {
                    newIndex = 0;
                }
                break;
        }
        this._setValueIndex(newIndex);
    }

    // eslint-disable-next-line no-unused-vars
    _handleArrowsKeys(keyCode) {
        throw "Not implemented exception";
    }

    _onTrackClick(event) {
        const pointerPositionOnTheTrack = this._getPointerPositionOnTheTrack(this._getMouseEventPointerPosition(event));
        if (pointerPositionOnTheTrack < 0) {
            return;
        }

        const trackValue = this._getTrackValue(pointerPositionOnTheTrack);
        const index = this._getValueIndexByTrackValue(trackValue);
        this._setValueIndex(index);
    }

    _onNoValueNodeClick(event) {
        event.stopPropagation();

        this._setValueIndex(-1);
    }

    _onHandleMouseDown(event) {
        event.stopPropagation();

        this._onHandleMoveStart();
    }

    _onDocumentMouseMove(event) {
        if (!this._isSliding) {
            return;
        }

        event.preventDefault();

        const pointerPositionOnTheTrack = this._getPointerPositionOnTheTrack(this._getMouseEventPointerPosition(event));
        this._onHandleMove(pointerPositionOnTheTrack);
    }

    _onDocumentMouseUp(event) {
        if (!this._isSliding) {
            return;
        }

        event.preventDefault();

        const pointerPositionOnTheTrack = this._getPointerPositionOnTheTrack(this._getMouseEventPointerPosition(event));
        this._onHandleMoveEnd(pointerPositionOnTheTrack);
    }

    _onHandleTouchStart(event) {
        if (this._isSliding) {
            return true;
        }

        if (event.cancelable) {
            event.stopPropagation();
            event.preventDefault();
        }

        this._onHandleMoveStart();
    }

    _onDocumentTouchMove(event) {
        if (!this._isSliding) {
            return;
        }

        const pointerPositionOnTheTrack = this._getPointerPositionOnTheTrack(this._getTouchEventPointerPosition(event));
        this._onHandleMove(pointerPositionOnTheTrack);
    }

    _onDocumentTouchEnd(event) {
        if (!this._isSliding) {
            return;
        }

        event.preventDefault();

        const pointerPositionOnTheTrack = this._getPointerPositionOnTheTrack(this._getTouchEventPointerPosition(event));
        this._onHandleMoveEnd(pointerPositionOnTheTrack);
    }

    _onHandleMoveStart() {
        this._isSliding = true;
        this._sliderNode.addClass(this._sliderNodeSlidingModifierClass);
    }

    _onHandleMove(pointerPositionOnTheTrack) {
        this._toggleHandleNodeNoValueCSSModifier(pointerPositionOnTheTrack < 0);

        if (pointerPositionOnTheTrack < 0) { // Out of track
            this._setProgress(0);

            if (pointerPositionOnTheTrack < this._getNoValueHandleNodePosition()) { // beyond no value position
                this._moveHandleToNoValuePosition();
                return;
            }

            this._moveHandleNodeByAbsoluteValue(pointerPositionOnTheTrack);
            return;
        }

        const trackValue = this._getTrackValue(pointerPositionOnTheTrack);
        this._moveHandleNode(trackValue);
        this._setProgress(trackValue);
    }

    _onHandleMoveEnd(pointerPositionOnTheTrack) {
        this._isSliding = false;
        this._sliderNode.removeClass(this._sliderNodeSlidingModifierClass);

        let newValueIndex = null;
        if (pointerPositionOnTheTrack < -(this._getHandleNodeSize() / 2)) {
            newValueIndex = -1;
        } else {
            const trackValue = this._getTrackValue(pointerPositionOnTheTrack);
            newValueIndex = this._getValueIndexByTrackValue(trackValue);
        }

        if (newValueIndex === this._valueIndex) {
            this._syncHandlePositionToIndexValue();
            this._syncProgressToIndexValue();
            this._updateNoValueCSSAttribute();
        } else {
            this._setValueIndex(newValueIndex);
        }
    }

    _onHandleKeyPress(event) {
        const allowedKeys = [KEYS.ArrowUp, KEYS.ArrowLeft, KEYS.ArrowRight, KEYS.ArrowDown, KEYS.PageUp, KEYS.PageDown, KEYS.Home, KEYS.End];
        if (allowedKeys.includes(event.keyCode) === false) {
            return;
        }

        event.preventDefault();

        this._handleCommonKeys(event.keyCode);
        this._handleArrowsKeys(event.keyCode);
    }
}