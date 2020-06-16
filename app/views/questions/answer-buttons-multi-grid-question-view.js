import MultiGridQuestionView from './multi-grid-question-view';
import ValidationTypes from '../../api/models/validation/validation-types';

export default class AnswerButtonsMultiGridQuestionView extends MultiGridQuestionView {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._selectedAnswerCssClass = 'cf-answer-button--selected';
    }

    _showAnswerOtherError(validationResult) {
        validationResult.answerValidationResults.filter(result => !result.isValid).forEach(result => {
            const otherErrorsMessages = result.errors
                .filter(error => error.type === ValidationTypes.OtherRequired)
                .map(error => error.message);

            if (otherErrorsMessages.length === 0) {
                return;
            }

            this._question.innerQuestions.forEach(question => {
                if (!question.values.includes(result.answerCode)) {
                    return;
                }

                const errorBlockId = this._getInnerQuestionAnswerErrorBlockId(question.id, result.answerCode);
                const questionTextNode =  this._getInnerQuestionNode(question.id).find('.cf-grid-answer__text');

                this._answerErrorBlockManager.showErrors(errorBlockId, questionTextNode, otherErrorsMessages);

                const otherNode = this._getInnerQuestionAnswerOtherNode(question.id, result.answerCode);
                otherNode
                    .addClass('cf-answer-button__other-input--error')
                    .attr('aria-errormessage', errorBlockId)
                    .attr('aria-invalid', 'true');
            });
        });
    }

    _hideErrors() {
        super._hideErrors();

        this._container.find(`.cf-answer-button__other-input--error`).removeClass('cf-answer-button__other-input--error');
    }
}