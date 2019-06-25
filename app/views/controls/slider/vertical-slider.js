import SliderBase from "./slider-base";
import KEYS from "../../helpers/keyboard-keys";

export default class VerticalSlider extends SliderBase {

    _setProgressNodeSize(progressValue) {
        this._progressNode.css('height', progressValue+'%');
    }

    _setHandleNodePosition(position) {
        this._handleNode.css('top', position);
    }

    _getTrackNodeSize() {
        return this._trackNode.outerHeight();
    }

    _getHandleNodeSize() {
        return this._handleNode.outerHeight();
    }

    _getHandleNodeMargin() {
        return this._handleNode.outerHeight(true) - this._handleNode.outerHeight();
    }

    _getNoValueNodeOffset() {
        return this._noValueNode.offset().top;
    }

    _getTrackNodeOffset() {
        return this._trackNode.offset().top;
    }

    _getNoValueHandleNodePosition() {
        return (this._getNoValueNodeOffset() - this._getHandleNodeMargin()) - this._getTrackNodeOffset();
    }

    _getMouseEventPointerPosition(event) {
        return event.pageY;
    }

    _getTouchEventPointerPosition(event) {
        return event.changedTouches[0].pageY;
    }

    _getPointerPositionOnTheTrack(pointerPosition) {
        return pointerPosition - this._getTrackNodeOffset();
    }

    _handleArrowsKeys(keyCode) {
        switch (keyCode) {
            case KEYS.ArrowUp:
            case KEYS.ArrowLeft:
                this._moveHandleBack();
                break;
            case KEYS.ArrowDown:
            case KEYS.ArrowRight:
                this._moveHandleForward();
                break;
        }
    }
}