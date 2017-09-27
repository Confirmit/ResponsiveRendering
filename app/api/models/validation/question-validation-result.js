/**
 * @class
 * @alias QuestionValidationResult
 */
export default class QuestionValidationResult {
    /**
     * Create instance.
     * @param {string} questionId - Question id.
     * @param {string[]} errors - Question specific errors.
     * @param {answerValidationResults[]} answerValidationResults - Answer validation results.
     */
    constructor(questionId, errors = [], answerValidationResults = []) {
        this._questionId = questionId;
        this._errors = errors;
        this._answerValidationResults = answerValidationResults;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._errors.length === 0 && this._answerValidationResults.every(result => result.isValid);
    }

    /**
     * Question id.
     * @type {string}
     * @readonly
     */
    get questionId() {
        return this._questionId;
    }

    /**
     * Question specific errors.
     * @type {ValidationError[]}
     * @readonly
     */
    get errors() {
        return this._errors;
    }

    /**
     * Answer validation results.
     * @type {AnswerValidationResult[]}
     * @readonly
     */
    get answerValidationResults() {
        return this._answerValidationResults;
    }
}