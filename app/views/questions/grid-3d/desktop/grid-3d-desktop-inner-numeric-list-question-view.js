import AnswerErrorManager from "../../../error/answer-error-manager";
import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";

export default class Grid3DDesktopInnerNumericListQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._answerErrorManager = new AnswerErrorManager();

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('input', event => {
                this._onAnswerValueChangedHandler(answer.code, event.target.value);
            });
        });
    }

    _updateAnswerNodes({values = []}) {
        if(values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            const answerInput = this._getAnswerNode(answer.code);
            const value = this._question.values[answer.code] || '';
            if (answerInput.val() !== value) {
                answerInput.val(value);
            }
        });
    }

    _showErrors(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const target = this._getAnswerNode(answerValidationResult.answerCode);
            this._answerErrorManager.showErrors(answerValidationResult, target);
        });
    }

    _hideErrors() {
        this._answerErrorManager.removeAllErrors();
    }

    _onAnswerValueChangedHandler(answerCode, answerValue) {
        this._question.setValue(answerCode, answerValue);
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
    }

    _onValidationComplete(validationResult) {
        this._hideErrors();
        if (validationResult.isValid === false) {
            this._showErrors(validationResult);
        }
    }
}