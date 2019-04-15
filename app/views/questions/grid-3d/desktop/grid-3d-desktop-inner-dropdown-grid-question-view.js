import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";
import ErrorBlockManager from "../../../error/error-block-manager";

export default class Grid3DDesktopInnerDropdownGridQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._answerErrorBlockManager = new ErrorBlockManager();

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
            const errorBlockId = this._getAnswerErrorBlockId(answerValidationResult.answerCode);
            const errors = answerValidationResult.errors.map(error => error.message);
            this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
        });
    }

    _hideErrors() {
        this._answerErrorBlockManager.removeAllErrors();
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