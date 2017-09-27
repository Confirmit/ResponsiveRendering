import ValidationTypes from 'api/models/validation/validation-types.js';
import AnswerErrorBlock from './answer-error-block';

export default class AnswerErrorManager {

    constructor(container) {
        this._container = container;
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

        this._showErrorBlock(answerErrors, answerTarget);
        this._showErrorBlock(otherAnswerErrors, otherAnswerTarget);
    }

    removeAllErrors() {
        this._answerErrorBlocks.forEach(block => block.remove());
        this._answerErrorBlocks = [];
    }

    _showErrorBlock(errors, target)  {
        if(errors.length === 0) {
            return;
        }

        this._createBlock(target).showErrors(errors);
    }

    _createBlock(target) {
        const block = new AnswerErrorBlock(target);
        this._answerErrorBlocks.push(block);
        return block;
    }
}