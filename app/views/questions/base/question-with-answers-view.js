import QuestionView from './question-view.js';
import $ from 'jquery';
import ErrorBlockManager from "../../error/error-block-manager";

export default class QuestionWithAnswersView extends QuestionView {
    /**
     * @param {QuestionWithAnswers} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        super(question, settings);

        this._answerErrorBlockManager = new ErrorBlockManager();
    }

    get answers() {
        return this._question.answers;
    }

    _getAnswerErrorBlockId(answerCode) {
        return `${this._question.id}_${answerCode}_error`
    }

    _getAnswerOtherErrorBlockId(answerCode) {
        return `${this._question.id}_${answerCode}_other_error`
    }

    _getAnswerNodeId(answerCode) {
        return `${this._question.id}_${answerCode}`;
    }

    _getAnswerInputNodeId(answerCode) {
        return `${this._question.id}_${answerCode}_input`;
    }

    _getAnswerTextNodeId(answerCode) {
        return `${this._question.id}_${answerCode}_text`;
    }

    _getAnswerOtherNodeId(answerCode) {
        return `${this._question.id}_${answerCode}_other`;
    }

    _getScaleNodeId(answerCode, scaleCode) {
        return `${this._question.id}_${answerCode}_${scaleCode}`;
    }

    _getAnswerNode(answerCode) {
        return $('#' + this._getAnswerNodeId(answerCode));
    }

    _getAnswerInputNode(answerCode) {
        return $('#' + this._getAnswerInputNodeId(answerCode));
    }

    _getAnswerTextNode(answerCode) {
        return $('#' + this._getAnswerTextNodeId(answerCode));
    }

    _getAnswerOtherNode(answerCode) {
        return $('#' + this._getAnswerOtherNodeId(answerCode));
    }

    _getScaleNode(answerCode, scaleCode) {
        return $('#' + this._getScaleNodeId(answerCode, scaleCode));
    }

    _showErrors(validationResult) {
        this._showQuestionErrors(validationResult);
        this._showAnswerErrors(validationResult);
    }

    _showQuestionErrors(validationResult) {
        super._showErrors(validationResult);
    }

    /**
     * @param {QuestionValidationResult} validationResult
     * @protected
     */
    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.filter(result => !result.isValid).forEach(result => this._showAnswerError(result));
    }

    /**
     * @param {AnswerValidationResult} validationResult
     * @protected
     */
    _showAnswerError(validationResult) {
        const answer = this._question.getAnswer(validationResult.answerCode);
        const target = answer.isOther
            ? this._getAnswerOtherNode(validationResult.answerCode)
            : this._getAnswerTextNode(validationResult.answerCode);
        const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
        const errors = validationResult.errors.map(error => error.message);
        this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
    }

    _hideErrors() {
        super._hideErrors();
        this._answerErrorBlockManager.removeAllErrors();
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