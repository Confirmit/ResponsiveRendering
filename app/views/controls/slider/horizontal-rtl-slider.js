import SliderBase from "./slider-base";
import KEYS from "../../helpers/keyboard-keys";

export default class HorizontalRtlSlider extends SliderBase {

    _setProgressNodeSize(progressValue) {
        this._progressNode.css('width', progressValue+'%');
    }

    _setHandleNodePosition(position) {
        this._handleNode.css('right', position);
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
        return this._noValueNode.offset().left + this._noValueNode.outerWidth();
    }

    _getTrackNodeOffset() {
        return this._trackNode.offset().left + this._trackNode.outerWidth();
    }

    _getNoValueHandleNodePosition() {
        return this._getTrackNodeOffset() - (this._getNoValueNodeOffset() + this._getHandleNodeMargin());
    }

    _getMouseEventPointerPosition(event) {
        return event.pageX;
    }

    _getTouchEventPointerPosition(event) {
        return event.changedTouches[0].pageX;
    }

    _getPointerPositionOnTheTrack(pointerPosition) {
        return this._getTrackNodeOffset() - pointerPosition;
    }

    _handleArrowsKeys(keyCode) {
        switch (keyCode) {
            case KEYS.ArrowDown:
            case KEYS.ArrowRight:
                this._moveHandleBack();
                break;
            case KEYS.ArrowUp:
            case KEYS.ArrowLeft:
                this._moveHandleForward();
                break;
        }
    }
}