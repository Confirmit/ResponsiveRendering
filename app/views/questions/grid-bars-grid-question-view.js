import FloatingLabels from '../controls/floating-labels.js';
import GridQuestionView from "./grid-question-view";
import $ from 'jquery';

export default class GridBarsGridQuestionView extends GridQuestionView {
    /**
     * @param {GridRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._scaleGroupCssClass = 'cf-gb-grid-answer__control';
        this._selectedScaleCssClass = 'cf-gb-grid-answer__scale-item--selected';
        this._selectedNonScoredItemClass = 'cf-gb-grid-answer__na-item--selected';

        this._initFloatingLabels();
    }

    get _scales() {
        return this._question.scaleItems.concat(this._question.nonScaleItems);
    }

    _getScaleTextNode(answerCode, scaleCode) {
        return $(`#${this._question.id}_${answerCode}_${scaleCode}_text`);
    }

    _initFloatingLabels() {
        const panel = this._container.find('.cf-gb-grid-answer--first .cf-label-panel');
        const lastItem = this._container.find('.cf-gb-grid-answer:last-child .cf-gb-grid-answer__scale').last();
        new FloatingLabels(panel, lastItem, this._settings.mobileThreshold);
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0)
            return;

        values.forEach(answerCode => {
            this._scales.forEach(scale => {
                this._clearScaleNode(answerCode, scale.code);
            });
            this._clearScaleItemStyles(answerCode);

            const scaleCode = this._question.values[answerCode];
            if (scaleCode === undefined) {
                this._getScaleNode(answerCode, this._scales[0].code)
                    .attr('tabindex', '0');
            } else {
                this._selectScaleNode(answerCode, scaleCode);
            }
        });
    }

    _attachHandlersToDOM() {
        super._attachHandlersToDOM();

        const mouseOver = (answerCode, scaleCode) => {
            if (this._question.values[answerCode])
                return; // don't handle if already answered

            this._clearHoverItemStyles(answerCode);
            this._setHoverItemStyles(answerCode, scaleCode);
        };

        const mouseOut = (answerCode) => {
            if (this._question.values[answerCode])
                return; // don't handle if already answered

            this._clearHoverItemStyles(answerCode);
        };

        this._question.answers.forEach(answer => {
            this._question.scaleItems.forEach(scale => {
                this._getScaleNode(answer.code, scale.code)
                    .on('mouseover', () => mouseOver(answer.code, scale.code))
                    .on('mouseout', () => mouseOut(answer.code));
            });
        });
    }

    _selectScaleNode(answerCode, scaleCode) {
        const itemInScale = this._question.scaleItems.find(item => item.code === scaleCode) !== undefined;
        const itemNodeClass = itemInScale ? this._selectedScaleItemClass : this._selectedNonScoredItemClass;
        this._getScaleNode(answerCode, scaleCode)
            .addClass(itemNodeClass)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');

        if (itemInScale) {
            const scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
            if (scaleIndex !== -1) {
                this._setBarItemStyles(answerCode, scaleIndex, this._selectedScaleCssClass, 'cf-gb-grid-answer__scale-text--selected');
            }
        }
    }

    _setHoverItemStyles(answerCode, scaleCode) {
        const scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
        if (scaleIndex !== -1) {
            this._setBarItemStyles(answerCode, scaleIndex, 'cf-gb-grid-answer__scale-item--hover', 'cf-gb-grid-answer__scale-text--hover');
        }
        // do not handle for NA-items
    }

    _setBarItemStyles(answerCode, scaleIndex, itemStyle, textStyle) {
        this._question.scaleItems.forEach((item, index) => {
            if (index <= scaleIndex) {
                this._getScaleNode(answerCode, item.code)
                    .addClass(itemStyle)
                    .css('opacity', (index + 2) / (this._question.scaleItems.length + 1));
                this._getScaleTextNode(answerCode, item.code).addClass(textStyle);
            }
        });
    }

    _clearScaleItemStyles(answerCode) {
        const answerNode = this._getAnswerNode(answerCode);

        answerNode.find('.cf-gb-grid-answer__scale-item')
            .removeClass(this._selectedScaleCssClass)
            .removeClass('cf-gb-grid-answer__scale-item--hover')
            .css('opacity', '');

        answerNode.find('.cf-gb-grid-answer__na-item')
            .removeClass(this._selectedNonScoredItemClass);

        answerNode.find('.cf-gb-grid-answer__scale-text')
            .removeClass('cf-gb-grid-answer__scale-text--selected')
            .removeClass('cf-gb-grid-answer__scale-text--hover');
    }

    _clearHoverItemStyles(answerCode) {
        const container = this._getAnswerNode(answerCode);

        container.find('.cf-gb-grid-answer__scale-item')
            .removeClass('cf-gb-grid-answer__scale-item--hover')
            .css('opacity', '');

        container.find('.cf-gb-grid-answer__scale-text')
            .removeClass('cf-gb-grid-answer__scale-text--hover');
    }
}