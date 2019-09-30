import Grid3DDesktopInnerQuestionView from "./grid-3d-desktop-inner-question-view";

export default class Grid3DDesktopInnerGridQuestionView extends Grid3DDesktopInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._attachHandlersToDOM();
    }

    get _selectedScaleCssClass(){
        return  this._question.answerButtons ? 'cf-answer-button--selected' : 'cf-grid-single-answer--selected';
    }

    _attachHandlersToDOM() {
        const itemClickHandler = (answer, scale) => {
            this._getScaleNode(answer.code, scale.code).on('click', this._onScaleItemClick.bind(this, answer, scale));
        };

        this._question.answers.forEach(answer => {
            this._question.scales.forEach(scale => itemClickHandler(answer, scale));
        });
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            this._question.scales.forEach(scale => {
                this._getScaleNode(answer.code, scale.code).removeClass(this._selectedScaleCssClass);
            });
        });

        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getScaleNode(answerCode, scaleCode).addClass(this._selectedScaleCssClass);
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerScaleNodes(changes);
    }

    _onScaleItemClick(answer, scale) {
        this._question.setValue(answer.code, scale.code);
    }
}