import Grid3DMobileInnerQuestionView from "./grid-3d-mobile-inner-question-view";

export default class Grid3DMobileInnerDropdownGridQuestionView extends Grid3DMobileInnerQuestionView {
    constructor(question, innerQuestion, settings = null) {
        super(question, innerQuestion, settings);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerInputNode(answer.code).on('change', event => {
                this._onAnswerChangedHandler(answer, event.target.value);
            });

            if(answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherNodeValueChange(answer, event.target.value);
                });
            }
        });
    }

    _updateAnswerNodes({values = []}){
        if (values.length === 0)
            return;

        values.forEach(answerCode => {
            const answerInput = this._getAnswerInputNode(answerCode);
            const value = this._question.values[answerCode] || '';
            answerInput.val(value);
        });
    }

    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            this._answerErrorManager.showErrors(
                answerValidationResult,
                this._getAnswerInputNode(answerValidationResult.answerCode),
                this._getAnswerOtherNode(answerValidationResult.answerCode)
            );
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
    }

    _onAnswerChangedHandler(answer, value) {
        this._question.setValue(answer.code, value);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._parentQuestion.setOtherValue(answer.code, otherValue);
    }
}