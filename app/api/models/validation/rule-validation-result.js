export default class RuleValidationResult {
    /**
     * Create instance.
     * @param {boolean} isValid - Is it valid.
     * @param {string[]} answers - The array of answer codes.
     * @param {object} data - Object with properties.
     */
    constructor(isValid, answers = [], data = {}) {
        this._isValid = isValid;
        this._answers = answers;
        this._data = data;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._isValid;
    }

    /**
     * The array of answer codes where found validation error.
     * @type {string[]}
     * @readonly
     */
    get answers() {
        return this._answers;
    }

    /**
     * Object with properties.
     * @type {Object}
     * @readonly
     */
    get data() {
        return this._data;
    }
}