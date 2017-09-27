/**
 * @class
 * @alias AnswerValidationResult
 */
export default class AnswerValidationResult {
    /**
     * Create instance.
     * @param {string} answerCode - Answer code.
     * @param {string[]} errors - Answer specific errors.
     */
    constructor(answerCode, errors = []) {
        this._answerCode = answerCode;
        this._errors = errors;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._errors.length === 0;
    }

    /**
     * Answer code.
     * @type {string}
     * @readonly
     */
    get answerCode() {
        return this._answerCode;
    }

    /**
     * Answer specific errors.
     * @type {ValidationError[]}
     * @readonly
     */
    get errors() {
        return this._errors;
    }
}