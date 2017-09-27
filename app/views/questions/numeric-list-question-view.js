import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from 'utils.js';

export default class NumericListQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._nanCode = 'NOT_A_NUMBER';

        this._attachControlHandlers();

    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);

        if(this._question.autoSum) {
            this._updateTotalSum();
        }
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

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

    _updateTotalSum() {
        const sum = Object.values(this._question.values).reduce((prev, current) => prev + Utils.toNumber(current), 0);
        this._container.find('.cf-numeric-list-auto-sum__value').val(sum.toFixed(this._question.numeric.scale));
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

    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            this._answerErrorManager.showErrors(
                answerValidationResult,
                this._getAnswerInputNode(answerValidationResult.answerCode),
                this._getAnswerOtherNode(answerValidationResult.answerCode)
            );
        });
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
