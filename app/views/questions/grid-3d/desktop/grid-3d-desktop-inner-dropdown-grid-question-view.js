import AnswerErrorManager from "../../../error/answer-error-manager";
import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";

export default class Grid3DDesktopInnerDropdownGridQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._answerErrorManager = new AnswerErrorManager();

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('change', event => {
                this._onAnswerChangedHandler(answer.code, event.target.value);
            });
        });
    }

    _updateAnswerNodes({values = []}){
        if (values.length === 0)
            return;

        values.forEach(answerCode => {
            const answerInput = this._getAnswerNode(answerCode);
            const value = this._question.values[answerCode] || '';
            answerInput.val(value);
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

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
    }

    _onAnswerChangedHandler(answerCode, scaleCode) {
        this._question.setValue(answerCode, scaleCode);
    }

    _onValidationComplete(validationResult) {
        this._hideErrors();
        if (validationResult.isValid === false) {
            this._showErrors(validationResult);
        }
    }
}