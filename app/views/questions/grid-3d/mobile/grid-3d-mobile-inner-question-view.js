import QuestionViewBase from "../../base/question-view-base";
import AnswerErrorManager from "../../../error/answer-error-manager";
import QuestionErrorBlock from "../../../error/question-error-block";
import $ from "jquery";

export default class Grid3DMobileInnerQuestionView extends QuestionViewBase {
    constructor(parentQuestion, question, settings = null) {
        super(question, settings);
        this._parentQuestion = parentQuestion;

        this._parentContainer = $(`#${parentQuestion.id}`);
        this._container = this._parentContainer.find(`#mobile_${question.id}`);

        this._errorBlock = new QuestionErrorBlock(this._container.find('.cf-error-block'));

        this._answerErrorManager = new AnswerErrorManager();

        this._boundOnParentModelValueChange = this._onParentModelValueChange.bind(this);
        this._boundOnParentModelValidationComplete = this._onParentModelValidationComplete.bind(this);

        this._attachParentModelHandlers();

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
        this._errorBlock.showErrors(validationResult.errors.map(error => error.message));
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
        this._errorBlock.hideErrors();
        this._answerErrorManager.removeAllErrors();
    }

    _isAnswerInQuestionValue(answerCode) {
        switch (this._question.type) {
            case 'Single':
                return this._question.value === answerCode;
            case 'Multi':
                return this._question.values.includes(answerCode);
            case 'OpenTextList':
            case 'NumericList':
            case 'Ranking':
            case 'Grid':
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

            const target = this._getAnswerOtherNode(answerValidationResult.answerCode);
            this._answerErrorManager.showErrors(answerValidationResult, target);
        });
    }
}