import FloatingLabels from '../controls/floating-labels.js';
import GridQuestionView from "./grid-question-view";

export default class HorizontalRatingGridQuestionView extends GridQuestionView {
    /**
     * @param {GridRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._scaleGroupClass = 'cf-hrs-grid-answer__control';
        this._selectedScaleItemClass = 'cf-hrs-grid-answer__scale-item--selected';
        this._selectedNonScoredItemClass = 'cf-hrs-grid-answer__na-item--selected';

        this._initFloatingLabels();
    }

    get _scales() {
        return this._question.scaleItems.concat(this._question.nonScaleItems);
    }

    _initFloatingLabels() {
        const panel = this._container.find('.cf-hrs-grid-answer--first .cf-label-panel');
        const lastItem = this._container.find('.cf-hrs-grid-answer:last-child .cf-hrs-grid-answer__scale').last();
        new FloatingLabels(panel, lastItem, this._settings.mobileThreshold);
    }

    _clearScaleNode(answerCode, scaleCode) {
        this._getScaleNode(answerCode, scaleCode)
            .removeClass(this._selectedScaleItemClass)
            .removeClass(this._selectedNonScoredItemClass)
            .attr('aria-checked', 'false')
            .attr('tabindex', '-1');
    }

    _selectScaleNode(answerCode, scaleCode) {
        const itemInScale = this._question.scaleItems.find(item => item.code === scaleCode) !== undefined;
        const itemNodeClass = itemInScale ? this._selectedScaleItemClass : this._selectedNonScoredItemClass;
        this._getScaleNode(answerCode, scaleCode)
            .addClass(itemNodeClass)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');
    }
}