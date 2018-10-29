import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";

export default class Grid3DDesktopInnerMultiQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));
        });
    }

    _isSelected(answer) {
        return this._question.values.includes(answer.code);
    }

    _onAnswerNodeClick(answer) {
        const newValue = !this._isSelected(answer);
        this._question.setValue(answer.code, newValue);
    }

    _onModelValueChange({changes}) {
        if (changes.values === undefined && changes.values.length === 0) {
            return;
        }

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass('cf-grid-multi-answer--selected');
        });

        this._question.values.forEach(answerCode => {
            this._getAnswerNode(answerCode).addClass('cf-grid-multi-answer--selected');
        });
    }
}