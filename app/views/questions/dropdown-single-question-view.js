import QuestionWithAnswersView from './base/question-with-answers-view.js';

export default class DropdownSingleQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._getQuestionInputNode().on('change', event => {
            this._onAnswerChanged(event.target.value);
        });
    }

    _onModelValueChange() {
        this._getQuestionInputNode().val(this._question.value);
    }

    _onAnswerChanged(answerCode) {
        this._question.setValue(answerCode);
    }
}