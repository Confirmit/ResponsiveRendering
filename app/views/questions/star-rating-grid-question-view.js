import FloatingLabels from '../controls/floating-labels.js';
import GridQuestionView from "./grid-question-view";

export default class StarRatingGridQuestionView extends GridQuestionView {
    /**
     * @param {GridRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._selectedScaleCssClass = 'cf-sr-grid-answer__scale-item--selected';
        this._selectedNonScoredItemCssClass = 'cf-sr-grid-answer__na-item--selected';

        this._initFloatingLabels();
    }

    get _scales() {
        return this._question.scaleItems.concat(this._question.nonScaleItems);
    }

    _clearScaleNode(answerCode, scaleCode) {
        this._getScaleNode(answerCode, scaleCode)
            .removeClass(this._selectedScaleCssClass)
            .removeClass(this._selectedNonScoredItemCssClass)
            .attr('aria-checked', 'false')
            .attr('tabindex', '-1');
    }

    _selectScaleNode(answerCode, scaleCode) {
        const itemInScale = this._question.scaleItems.find(item => item.code === scaleCode) !== undefined;
        const itemNodeClass = itemInScale ? this._selectedScaleCssClass : this._selectedNonScoredItemCssClass;
        this._getScaleNode(answerCode, scaleCode)
            .addClass(itemNodeClass)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');

        if (itemInScale) {
            const scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
            if (scaleIndex !== -1) {
                this._question.scaleItems.forEach((item, index) => {
                    if (index <= scaleIndex) {
                        this._getScaleNode(answerCode, item.code).addClass(this._selectedScaleCssClass);
                    }
                });
            }
        }
    }

    _initFloatingLabels() {
        const panel = this._container.find('.cf-sr-grid-answer--fake-for-panel .cf-label-panel');
        const lastItem = this._container.find('.cf-sr-grid-answer:last-child .cf-sr-grid-answer__scale').last();
        new FloatingLabels(panel, lastItem, this._settings.mobileThreshold);
    }
}