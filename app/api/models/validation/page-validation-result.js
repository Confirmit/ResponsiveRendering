/**
 * @class
 * @alias PageValidationResult
 */
export default class PageValidationResult {
    /**
     * Create instance.
     * @param {QuestionValidationResult[]} questionValidationResults - Question validation results.
     */
    constructor(questionValidationResults = []) {
        this._questionValidationResults = questionValidationResults;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._questionValidationResults.every(result => result.isValid);
    }

    /**
     * Question validation results.
     * @type {QuestionValidationResult[]}
     * @readonly
     */
    get questionValidationResults() {
        return this._questionValidationResults;
    }
}