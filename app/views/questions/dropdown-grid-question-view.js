import QuestionWithAnswersView from './base/question-with-answers-view.js';

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

            if(answer.isOther) {
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

    _updateAnswerNodes({values = []}){
        if (values.length === 0)
            return;

        this._container.find('.cf-dropdown').val('');
        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getAnswerInputNode(answerCode).val(scaleCode);
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

    _onAnswerChangedHandler(answer, value) {
        this._question.setValue(answer.code, value);
    }

    _onAnswerOtherChangedHandler(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }
}