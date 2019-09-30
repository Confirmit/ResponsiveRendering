import Event from "../../event";

export default class CarouselItem {
    constructor(itemId, isComplete = false) {
        this._id = itemId;
        this._isComplete = isComplete;
        this._isError = false;
        this._changeEvent = new Event('carousel-item:changed');
    }

    get changeEvent() {
        return this._changeEvent;
    }

    get id() {
        return this._id;
    }

    get isComplete() {
        return this._isComplete;
    }

    get isError() {
        return this._isError;
    }

    set isError(value) {
        if (this._isError === value) {
            return;
        }

        this._isError = value;
        this._changeEvent.trigger({isError: value});
    }

    set isComplete(value) {
        if (this._isComplete === value) {
            return;
        }

        this._isComplete = value;
        this._changeEvent.trigger({isComplete: value});
    }
}
