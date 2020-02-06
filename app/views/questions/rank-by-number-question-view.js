import QuestionWithAnswersView from './base/question-with-answers-view';
import ValidationTypes from '../../api/models/validation/validation-types';

export default class RankByNumberQuestionView extends QuestionWithAnswersView {
    constructor(question, settings) {
        super(question, settings);
        this._nanCode = 'NOT_A_NUMBER';

        this._attachControlHandlers();
    }

    _attachControlHandlers() {
        this.answers.forEach(answer => {
            this._getAnswerInputNode(answer.code).on('input', event => {
                this._onAnswerValueChangedHandler(answer.code, event);
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherValueChangedHandler(answer.code, event.target.value);
                });
            }
        });
    }

    _showAnswerError(validationResult) {
        const answer = this._question.getAnswer(validationResult.answerCode);
        const target = answer.isOther ? this._getAnswerOtherNode(answer.code) : this._getAnswerTextNode(validationResult.answerCode);
        const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
        const errors = validationResult.errors.map(error => error.message);
        this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);

        const otherErrors = validationResult.errors.filter(error => error.type === ValidationTypes.OtherRequired);
        if (otherErrors.length > 0) {
            this._getAnswerOtherNode(validationResult.answerCode)
                .attr('aria-errormessage', errorBlockId)
                .attr('aria-invalid', 'true');
        }
    }

    _hideErrors() {
        super._hideErrors();
        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            this._getAnswerOtherNode(answer.code)
                .removeAttr('aria-errormessage')
                .removeAttr('aria-invalid');
        });
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0) {
            return;
        }

        this._question.answers.forEach(answer => {
            const answerInput = this._getAnswerInputNode(answer.code);
            const value = this._question.values[answer.code];
            if (value === this._nanCode) {
                return;
            }
            if (answerInput.val() === value) {
                return;
            }
            answerInput.val(value);
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _onAnswerValueChangedHandler(answerCode, event) {
        let value = event.target.value;
        if (value === '' && !event.target.validity.valid) {
            value = this._nanCode;
        }
        this._question.setValue(answerCode, value);
    }

    _onAnswerOtherValueChangedHandler(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }
}