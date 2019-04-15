import HorizontalRatingSingleQuestionView from "./horizontal-rating-single-question-view";

export default class StarRatingSingleQuestionView extends HorizontalRatingSingleQuestionView {
    constructor(question, settings) {
        super(question, settings);

        this._groupNode = this._container.find('.cf-sr-single');
        this._selectedScaleItemClass = 'cf-sr-single__scale-item--selected';
        this._selectedNonScoredItemClass = 'cf-sr-single__na-item--selected';
    }

    _updateAnswerNodes() {
        super._updateAnswerNodes();

        const answerIndex = this._question.scaleItems.findIndex(item => item.code === this._question.value);
        if (answerIndex !== -1) {
            this._question.scaleItems.forEach((item, index) => {
                if (index < answerIndex) {
                    this._getAnswerNode(item.code).addClass(this._selectedScaleItemClass);
                }
            });
        }
    }
}