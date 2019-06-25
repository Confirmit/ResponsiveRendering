import AnswerImagesSettings from "./answer-images-settings";

/**
 * @desc A class for Scale
 */

export default class Scale {
    /**
     * @param {object} model - Group name.
     * @param {HeadGroup} group - Reference to a group, if the scale is inside one.
     */
    constructor(model, group) {
        this._code = null;
        this._text = null;
        this._imagesSettings = null;
        this._group = group || null;

        this._parseModel(model);
    }

    /**
     * Answer code.
     * @type {string}
     * @readonly
     */
    get code() {
        return this._code;
    }

    /**
     * Answer text.
     * @type {string}
     * @readonly
     */
    get text() {
        return this._text;
    }

    /**
     * Reference to a group, if the scale is inside one.
     * @type {HeadGroup}
     * @readonly
     */
    get group () {
        return this._group;
    }

    /**
     * Answer images settings
     * @type {AnswerImages}
     * @readonly
     */
    get imagesSettings(){
        return this._imagesSettings;
    }

    _parseModel(model)
    {
        this._text = model.text;
        this._code = model.code;
        if(model.imagesSettings){
            this._imagesSettings = new AnswerImagesSettings(model.imagesSettings);
        }
    }
}
