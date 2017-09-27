import QuestionView from './question-view.js';
import AnswerErrorManager from '../../error/answer-error-manager.js';
import $ from 'jquery';

export default class QuestionWithAnswersView extends QuestionView {
    constructor(question)
    {
        super(question);

        this._answerErrorManager = new AnswerErrorManager();
    }

    get answers() {
        return this._question.answers;
    }

    _getAnswerNode(answerCode) {
        return $(`#${this.id}_${answerCode}`);
    }

    _getAnswerInputNode(answerCode) {
        return $(`#${this.id}_${answerCode}_input`);
    }

    _getAnswerTextNode(answerCode) {
        return $(`#${this.id}_${answerCode}_text`);
    }

    _getAnswerOtherNode(answerCode) {
        return $(`#${this.id}_${answerCode}_other`);
    }

    _getScaleNode(answerCode, scaleCode) {
        return $(`#${this.id}_${answerCode}_${scaleCode}`);
    }

    _showErrors(validationResult)
    {
        this._showQuestionErrors(validationResult);
        this._showAnswerErrors(validationResult);
    }

    _showQuestionErrors(validationResult){
        super._showErrors(validationResult);
    }

    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const answer = this._question.getAnswer(answerValidationResult.answerCode);
            const target = answer.isOther
                ? this._getAnswerOtherNode(answerValidationResult.answerCode)
                : this._getAnswerTextNode(answerValidationResult.answerCode);
            this._answerErrorManager.showErrors(answerValidationResult, target);
        });
    }

    _hideErrors() {
        super._hideErrors();
        this._answerErrorManager.removeAllErrors();
    }

    _updateAnswerOtherNodes({otherValues = []}) {
        otherValues.forEach(answerCode => {
            const otherValue = this._question.otherValues[answerCode];
            this._setOtherNodeValue(answerCode, otherValue);
        });
    }

    _setOtherNodeValue(answerCode, otherValue) {
        otherValue = otherValue || '';

        const otherInput = this._getAnswerOtherNode(answerCode);
        if (otherInput.val() !== otherValue) {
            otherInput.val(otherValue);
        }
    }
}