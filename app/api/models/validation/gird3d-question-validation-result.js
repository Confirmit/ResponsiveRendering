import QuestionValidationResult from "./question-validation-result";
/**
 * @class
 * @extends {QuestionValidationResult}
 */
export default class Grid3dQuestionValidationResult extends QuestionValidationResult {
    /**
     * Create instance.
     * @param {string} questionId - Question id.
     * @param {questionValidationResults[]} questionValidationResults - 3D grid inner questions validation results.
     * @param {answerValidationResults[]} answerValidationResults - Answer validation results.
     */
    constructor(questionId, questionValidationResults = [], answerValidationResults = []) {
        super(questionId, [], answerValidationResults);

        this._questionValidationResults = questionValidationResults;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._questionValidationResults.every(result => result.isValid) && this._answerValidationResults.every(result => result.isValid);
    }

    /**
     * 3D grid inner questions validation results.
     * @type {QuestionValidationResult[]}
     * @readonly
     */
    get questionValidationResults() {
        return this._questionValidationResults;
    }
}