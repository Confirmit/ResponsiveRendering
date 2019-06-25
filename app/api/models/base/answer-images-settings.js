/**
 * @desc A class for Images settings in Answers and Scales
 */
export default class AnswerImagesSetting {
    constructor(model) {
        this._defaultImageUrl = model.defaultImageUrl || null;
        this._hoverImageUrl = model.hoverImageUrl || null;
        this._selectImageUrl = model.selectImageUrl || null;
        this._width = model.width || null;
        this._height = model.height || null;
        this._appearance = model.appearance || false;
    }

    /**
     * Default state image url.
     * @type {string}
     * @readonly
     */
    get defaultImageUrl() {
        return this._defaultImageUrl;
    }

    /**
     * Hovered state image url.
     * @type {string}
     * @readonly
     */
    get hoverImageUrl() {
        return this._hoverImageUrl;
    }

    /**
     * Selected state image url.
     * @type {string}
     * @readonly
     */
    get selectImageUrl() {
        return this._selectImageUrl;
    }

    /**
     * Images width.
     * @type {string}
     * @readonly
     */
    get width() {
        return this._width;
    }

    /**
     * Images height.
     * @type {string}
     * @readonly
     */
    get height() {
        return this._height;
    }

    /**
     * Image appearance.
     * @type {string}
     * @readonly
     */
    get appearance(){
        return this._appearance;
    }
}