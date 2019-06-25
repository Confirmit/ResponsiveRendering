import SliderBase from "./slider-base";
import KEYS from "../../helpers/keyboard-keys";

export default class HorizontalSlider extends SliderBase {

    _setProgressNodeSize(progressValue) {
        this._progressNode.css('width', progressValue+'%');
    }

    _setHandleNodePosition(position) {
        this._handleNode.css('left', position);
    }

    _getTrackNodeSize() {
        return this._trackNode.outerWidth();
    }

    _getHandleNodeSize() {
        return this._handleNode.outerWidth();
    }

    _getHandleNodeMargin() {
        return this._handleNode.outerWidth(true) - this._handleNode.outerWidth();
    }

    _getNoValueNodeOffset() {
        return this._noValueNode.offset().left
    }

    _getTrackNodeOffset() {
        return this._trackNode.offset().left
    }

    _getNoValueHandleNodePosition() {
        return (this._getNoValueNodeOffset() - this._getHandleNodeMargin()) - this._getTrackNodeOffset();
    }

    _getMouseEventPointerPosition(event) {
        return event.pageX;
    }

    _getTouchEventPointerPosition(event) {
        return event.changedTouches[0].pageX;
    }

    _getPointerPositionOnTheTrack(pointerPosition) {
        return pointerPosition - this._getTrackNodeOffset();
    }

    _handleArrowsKeys(keyCode) {
        switch (keyCode) {
            case KEYS.ArrowDown:
            case KEYS.ArrowLeft:
                this._moveHandleBack();
                break;
            case KEYS.ArrowUp:
            case KEYS.ArrowRight:
                this._moveHandleForward();
                break;
        }
    }
}