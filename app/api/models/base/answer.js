/**
 * @desc A class for Answer
 */
export default class Answer {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     * @param {HeadGroup|null} group - Reference to a group, if the answer is inside one.
     */
    constructor(model, group = null) {
        this._code = null;
        this._score = null;
        this._text = null;
        this._isOther = false;
        this._isExclusive = false;
        this._fieldName = null;
        this._otherFieldName = null;

        this._group = group;

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
     * Answer score.
     * @type {string}
     * @readonly
     */
    get score() {
        return this._score;
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
     * Is other answer.
     * @type {boolean}
     * @readonly
     */
    get isOther() {
        return this._isOther;
    }

    /**
     * Is exclusive answer.
     * @type {boolean}
     * @readonly
     */
    get isExclusive() {
        return this._isExclusive;
    }

    /**
     * Field name.
     * @type {string}
     * @readonly
     */
    get fieldName(){
        return this._fieldName;
    }

    /**
     * Other field name.
     * @type {string}
     * @readonly
     */
    get otherFieldName(){
        return this._otherFieldName;
    }

    /**
     * Scales array.
     * @type {Scale[]}
     * @readonly
     */
    get scales () {
        return this._scales;
    }

    /**
     * Reference to a group, if the answer is inside one.
     * @type {(HeadGroup)}
     * @readonly
     */
    get group () {
        return this._group;
    }

    /**
     * Get scale by code.
     * @param {string} code - Scale code.
     * @return {Scale}
     */
    getScale(code) {
        return this._scales.find(scale => scale.code === code);
    }

    /**
     * Get scales array by codes array.
     * @param {string[]} codes - Array of scales codes.
     * @return {Scale[]}
     */
    getScales(codes) {
        codes = codes.map(item => item.toString());
        return this._scales.filter(scale => codes.includes(scale.code));
    }

    _parseModel(model)
    {
        this._text = model.text;
        this._code = model.code;
        this._score = model.score;
        this._isExclusive = model.isExclusive;
        this._fieldName = model.fieldName;
        if(model.other){
            this._isOther = true;
            this._otherFieldName = model.other.fieldName;
        }
    }
}
