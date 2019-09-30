import QuestionWithAnswersView from './base/question-with-answers-view.js';
import ValidationTypes from "../../api/models/validation/validation-types";

export default class DropdownGridQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerInputNode(answer.code).on('change', event => {
                this._onAnswerChangedHandler(answer, event.target.value);
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherChangedHandler(answer, event.target.value);
                });
            }
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        values.forEach(answerCode => {
            const scaleCode = this._question.values[answerCode];
            this._getAnswerInputNode(answerCode).val(scaleCode);
        });
    }

    // TODO: THE SAME AS IN OPEN LIST
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
            answerNode
                .attr('aria-errormessage', errorBlockId)
                .attr('aria-invalid', 'true');
            this._answerErrorBlockManager.showErrors(errorBlockId, answerNode, answerErrors);
        }

        if (otherErrors.length > 0) {
            const otherNode = this._getAnswerOtherNode(validationResult.answerCode);
            const otherErrorBlockId = this._getAnswerOtherErrorBlockId(validationResult.answerCode);
            otherNode
                .attr('aria-errormessage', otherErrorBlockId)
                .attr('aria-invalid', 'true');
            this._answerErrorBlockManager.showErrors(otherErrorBlockId, otherNode, otherErrors);
        }
    }

    _hideErrors() {
        super._hideErrors();

        this._container.find('.cf-dropdown, .cf-text-box')
            .removeAttr('aria-errormessage')
            .removeAttr('aria-invalid');
    }

    _onAnswerChangedHandler(answer, value) {
        this._question.setValue(answer.code, value);
    }

    _onAnswerOtherChangedHandler(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }
}