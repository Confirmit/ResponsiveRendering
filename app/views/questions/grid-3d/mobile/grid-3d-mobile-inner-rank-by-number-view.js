import Grid3DMobileInnerQuestionView from './grid-3d-mobile-inner-question-view';
import ValidationTypes from '../../../../api/models/validation/validation-types';

export default class Grid3DMobileInnerRankByNumberQuestionView  extends Grid3DMobileInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._nanCode = 'NOT_A_NUMBER';

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerInputNode(answer.code).on('input', event => {
                this._onAnswerValueChange(answer.code, event);
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherNodeValueChange(answer, event.target.value);
                });
            }
        });
    }

    _showAnswerError(validationResult) {
        const target = this._getAnswerTextNode(validationResult.answerCode);
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

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            const answerInput = this._getAnswerInputNode(answer.code);
            const value = this._question.values[answer.code] || '';
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
    }

    _onAnswerValueChange(answerCode, event) {
        let value = event.target.value;

        if (value === '' && !event.target.validity.valid) {
            value = this._nanCode;
        }
        this._question.setValue(answerCode, value);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._parentQuestion.setOtherValue(answer.code, otherValue);
    }
}