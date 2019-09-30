import QuestionViewBase from "../../base/question-view-base";
import QuestionErrorBlock from "../../../error/question-error-block";
import QuestionTypes from 'api/question-types.js';
import ErrorBlockManager from "../../../error/error-block-manager";
import $ from "jquery";

export default class Grid3DMobileInnerQuestionView extends QuestionViewBase {
    constructor(parentQuestion, question, settings = null) {
        super(question, settings);
        this._parentQuestion = parentQuestion;

        this._parentContainer = $(`#${this._parentQuestion.id}`);
        this._container = this._parentContainer.find(`#mobile_${this._question.id}`);

        this._questionErrorBlock = new QuestionErrorBlock(this._container.find('.cf-error-block'));

        this._answerErrorBlockManager = new ErrorBlockManager();

        this._boundOnParentModelValueChange = this._onParentModelValueChange.bind(this);
        this._boundOnParentModelValidationComplete = this._onParentModelValidationComplete.bind(this);

        this._attachParentModelHandlers();

    }

    _getAnswerErrorBlockId(answerCode) {
        return `mobile_${this._question.id}_${answerCode}_error`
    }

    _getAnswerOtherErrorBlockId(answerCode) {
        return `mobile_${this._question.id}_${answerCode}_other_error`
    }

    _getAnswerNode(answerCode) {
        return $(`#mobile_${this._question.id}_${answerCode}`);
    }

    _getAnswerInputNode(answerCode) {
        return $(`#mobile_${this._question.id}_${answerCode}_input`);
    }

    _getAnswerTextNode(answerCode) {
        return $(`#mobile_${this._question.id}_${answerCode}_text`);
    }

    _getAnswerOtherNode(answerCode) {
        return $(`#mobile_${this._question.id}_${answerCode}_other`);
    }

    _getScaleNode(answerCode, scaleCode) {
        return $(`#mobile_${this._question.id}_${answerCode}_${scaleCode}`);
    }

    _getTargetNodeForAnswerError(answerCode){
        return this._getAnswerOtherNode(answerCode);
    }

    detachModelHandlers() {
        super.detachModelHandlers();
        this._detachParentModelHandlers();
    }

    _attachParentModelHandlers() {
        this._parentQuestion.changeEvent.on(this._boundOnParentModelValueChange);
        this._parentQuestion.validationCompleteEvent.on(this._boundOnParentModelValidationComplete);
    }

    _detachParentModelHandlers() {
        this._parentQuestion.changeEvent.off(this._boundOnParentModelValueChange);
        this._parentQuestion.validationCompleteEvent.off(this._boundOnParentModelValidationComplete);
    }

    _setOtherNodeValue(answerCode, otherValue) {
        otherValue = otherValue || '';

        const otherInput = this._getAnswerOtherNode(answerCode);
        if (otherInput.val() !== otherValue) {
            otherInput.val(otherValue);
        }
    }

    _showErrors(validationResult) {
        this._showQuestionErrors(validationResult);
        this._showAnswerErrors(validationResult);
    }

    _showQuestionErrors(validationResult) {
        this._questionErrorBlock.showErrors(validationResult.errors.map(error => error.message));
    }

    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.filter(result => !result.isValid).forEach(result => this._showAnswerError(result));
    }

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
        this._questionErrorBlock.hideErrors();
        this._answerErrorBlockManager.removeAllErrors();
    }

    _isAnswerInQuestionValue(answerCode) {
        switch (this._question.type) {
            case QuestionTypes.Single:
                return this._question.value === answerCode;
            case QuestionTypes.Multi:
                return this._question.values.includes(answerCode);
            case QuestionTypes.OpenTextList:
            case QuestionTypes.NumericList:
            case QuestionTypes.Ranking:
            case QuestionTypes.Grid:
            default:
                return this._question.values[answerCode] !== undefined;
        }
    }

    _onValidationComplete(validationResult) {
        this._hideErrors();
        if (validationResult.isValid === false) {
            this._showErrors(validationResult);
        }
    }

    _onParentModelValueChange({changes}) {
        if (changes.otherValues === undefined) {
            return;
        }

        changes.otherValues.forEach(answerCode => {
            const otherValue = this._parentQuestion.otherValues[answerCode];
            this._setOtherNodeValue(answerCode, otherValue);
        });
    }

    _onParentModelValidationComplete(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const answer = this._question.getAnswer(answerValidationResult.answerCode);
            if (!answer.isOther) {
                return;
            }
            if(!this._isAnswerInQuestionValue(answer.code)) {
                return;
            }

            const target = this._getTargetNodeForAnswerError(answerValidationResult.answerCode);
            const errorBlockId = this._getAnswerOtherErrorBlockId(answerValidationResult.answerCode);
            const errors = answerValidationResult.errors.map(error => error.message);
            this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
        });
    }
}