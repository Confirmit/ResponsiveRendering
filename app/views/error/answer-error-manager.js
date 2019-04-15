import ValidationTypes from 'api/models/validation/validation-types.js';
import AnswerErrorBlock from './answer-error-block';

/**
 * @Deprecated
 */
export default class AnswerErrorManager {

    constructor(questionId) {
        this._questionId = questionId;
        this._answerErrorBlocks = [];
    }

    showErrors(answerValidationResult, answerTarget, otherAnswerTarget = answerTarget) {
        const answerErrors = [];
        const otherAnswerErrors = [];
        answerValidationResult.errors.forEach(error => {
            if(error.type === ValidationTypes.OtherRequired) {
                otherAnswerErrors.push(error.message);
            } else {
                answerErrors.push(error.message);
            }
        });

        this._showErrorBlock(this._getAnswerErrorBlockId(answerValidationResult.answerCode), answerTarget, answerErrors);
        this._showErrorBlock(this._getAnswerOtherErrorBlockId(answerValidationResult.answerCode), otherAnswerTarget, otherAnswerErrors);
    }

    removeAllErrors() {
        this._answerErrorBlocks.forEach(block => block.remove());
        this._answerErrorBlocks = [];
    }

    _getAnswerErrorBlockId(answerCode) {
        return `${this._questionId}_${answerCode}_error`;
    }

    _getAnswerOtherErrorBlockId(answerCode) {
        return `${this._questionId}_${answerCode}_other_error`;
    }

    _showErrorBlock(id, target, errors)  {
        if(errors.length === 0) {
            return;
        }

        this._createBlock(id, target).showErrors(errors);
    }

    _createBlock(id, target) {
        const block = new AnswerErrorBlock(id, target);
        this._answerErrorBlocks.push(block);
        return block;
    }
}