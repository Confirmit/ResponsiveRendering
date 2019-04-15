import QuestionWithAnswersView from './base/question-with-answers-view.js';

export default class DropdownSingleQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);
        this._input = this._getQuestionInputNode();
        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._getQuestionInputNode().on('change', event => this._onAnswerChanged(event.target.value));
    }

    _onModelValueChange() {
        this._getQuestionInputNode().val(this._question.value);
    }

    _onAnswerChanged(answerCode) {
        this._question.setValue(answerCode);
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._input.attr('aria-invalid', true);
    }

    _hideErrors() {
        super._hideErrors();
        this._input.attr('aria-invalid', false);
    }
}