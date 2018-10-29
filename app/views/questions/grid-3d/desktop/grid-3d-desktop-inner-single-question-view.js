import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";

export default class Grid3DDesktopInnerSingleQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));
        });
    }

    _onAnswerNodeClick(answer) {
        this._question.setValue(answer.code);
    }

    _onModelValueChange({changes}) {
        if (changes.value === undefined) {
            return;
        }
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass('cf-grid-single-answer--selected');
        });

        this._getAnswerNode(this._question.value).addClass('cf-grid-single-answer--selected');
    }
}