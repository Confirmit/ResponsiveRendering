import Grid3DMobileInnerQuestionView from "./grid-3d-mobile-inner-question-view";

export default class Grid3DMobileInnerNumericListQuestionView extends Grid3DMobileInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerInputNode(answer.code).on('input', event => {
                this._onAnswerValueChange(answer.code, event.target.value);
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherNodeValueChange(answer, event.target.value);
                });
            }
        });
    }

    _updateAnswerNodes({values = []}) {
        if(values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            const answerInput = this._getAnswerInputNode(answer.code);
            const value = this._question.values[answer.code] || '';
            if (answerInput.val() !== value) {
                answerInput.val(value);
            }
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

    _onAnswerValueChange(answerCode, answerValue) {
        this._question.setValue(answerCode, answerValue);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._parentQuestion.setOtherValue(answer.code, otherValue);
    }
}