import Grid3DMobileInnerQuestionView from "./grid-3d-mobile-inner-question-view";

export default class Grid3DMobileInnerGridQuestionView extends Grid3DMobileInnerQuestionView {
    constructor(question, innerQuestion, settings = null) {
        super(question, innerQuestion, settings);

        this._attachHandlersToDOM();
    }

    get _selectedScaleCssClass(){
        return  this._question.answerButtons ? 'cf-answer-button--selected' :  'cf-single-answer--selected';
    }

    _attachHandlersToDOM() {
        const itemClickHandler = (answer, scale) => {
            this._getScaleNode(answer.code, scale.code).on('click', this._onScaleItemClick.bind(this, answer, scale));
        };

        this._question.answers.forEach(answer => {
            this._question.scales.forEach(scale => itemClickHandler(answer, scale));

            if(answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherNodeValueChange(answer, event.target.value);
                });
            }
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

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._parentQuestion.setOtherValue(answer.code, otherValue);
    }
}