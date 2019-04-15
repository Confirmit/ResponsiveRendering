import Grid3DMobileInnerQuestionView from "./grid-3d-mobile-inner-question-view";
import ValidationTypes from "../../../../api/models/validation/validation-types";

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

    _showAnswerError(validationResult) {
        const answerErrors = [];
        const otherErrors = [];
        validationResult.errors.forEach(error => {
            if (error.type === ValidationTypes.OtherRequired) {
                otherErrors.push(error.message);
            } else {
                answerErrors.push(error.message);
            }
        });

        if (answerErrors.length > 0) {
            const answerNode = this._getAnswerInputNode(validationResult.answerCode);
            const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
            this._answerErrorBlockManager.showErrors(errorBlockId, answerNode, answerErrors);
        }

        if (otherErrors.length > 0) {
            const otherNode = this._getAnswerOtherNode(validationResult.answerCode);
            const otherErrorBlockId = this._getAnswerOtherErrorBlockId(validationResult.answerCode);
            this._answerErrorBlockManager.showErrors(otherErrorBlockId, otherNode, otherErrors);
        }
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