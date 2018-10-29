import HorizontalRatingGridQuestionView from './horizontal-rating-grid-question-view.js';
import $ from 'jquery';
import FloatingLabels from '../controls/floating-labels.js';

export default class GridBarsQuestionView extends HorizontalRatingGridQuestionView {
    /**
     * @param {GridRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);
    }

    _getScaleTextNode(answerCode, scaleCode) {
        return $(`#${this.id}_${answerCode}_${scaleCode}_text`);
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0)
            return;

        this._clearItemStyles();

        for (let answerCode in this._question.values) {
            let scaleCode = this._question.values[answerCode];
            this._setActiveItemStyles(answerCode, scaleCode);
        }
    }

    _initFloatingLabels() {
        const panel = this._container.find('.cf-gb-grid-answer--first .cf-label-panel');
        const lastItem = this._container.find('.cf-gb-grid-answer:last-child .cf-gb-grid-answer__scale').last();
        new FloatingLabels(panel, lastItem, this._settings.mobileThreshold);
    }

    _attachHandlersToDOM(){
        super._attachHandlersToDOM();

        const attachHoverHandler = (answerCode, scaleCode) => {
            let item = this._getScaleNode(answerCode, scaleCode);
            item
                .on('mouseover', () => mouseOver(answerCode, scaleCode))
                .on('mouseout', () => mouseOut(answerCode));
        };

        const mouseOver = (answerCode, scaleCode) => {
            if(this._question.values[answerCode])
                return; // don't handle if already answered

            this._clearHoverItemStyles(answerCode);
            this._setHoverItemStyles(answerCode, scaleCode);
        };

        const mouseOut = (answerCode) => {
            if(this._question.values[answerCode])
                return; // don't handle if already answered

            this._clearHoverItemStyles(answerCode);
        };

        this._question.answers.forEach(answer => {
            this._question.scaleItems.forEach(scale => attachHoverHandler(answer.code, scale.code));
        });
    }

    _setActiveItemStyles(answerCode, scaleCode) {
        let scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
        if(scaleIndex !== -1) {
            this._setBarItemStyles(answerCode, scaleIndex, 'cf-gb-grid-answer__scale-item--selected', 'cf-gb-grid-answer__scale-text--selected');
        }
        else {
            this._getScaleNode(answerCode, scaleCode).addClass('cf-gb-grid-answer__na-item--selected');
        }
    }

    _setHoverItemStyles(answerCode, scaleCode){
        let scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
        if(scaleIndex !== -1) {
            this._setBarItemStyles(answerCode, scaleIndex, 'cf-gb-grid-answer__scale-item--hover', 'cf-gb-grid-answer__scale-text--hover');
        }
        // do not handle for NA-items
    }

    _setBarItemStyles(answerCode, scaleIndex, itemStyle, textStyle) {
        this._question.scaleItems.forEach((item, index) => {
            if (index <= scaleIndex) {
                this._getScaleNode(answerCode, item.code)
                    .addClass(itemStyle)
                    .css('opacity', (index + 2) /  (this._question.scaleItems.length + 1));
                this._getScaleTextNode(answerCode, item.code).addClass(textStyle);
            }
        });
    }

    _clearItemStyles() {
        this._container.find('.cf-gb-grid-answer__scale-item')
            .removeClass('cf-gb-grid-answer__scale-item--selected')
            .removeClass('cf-gb-grid-answer__scale-item--hover')
            .css('opacity', '');

        this._container.find('.cf-gb-grid-answer__na-item')
            .removeClass('cf-gb-grid-answer__na-item--selected');

        this._container.find('.cf-gb-grid-answer__scale-text')
            .removeClass('cf-gb-grid-answer__scale-text--selected')
            .removeClass('cf-gb-grid-answer__scale-text--hover');
    }

    _clearHoverItemStyles(answerCode) {
        let container = this._getAnswerNode(answerCode);

        container.find('.cf-gb-grid-answer__scale-item')
            .removeClass('cf-gb-grid-answer__scale-item--hover')
            .css('opacity', '');

        container.find('.cf-gb-grid-answer__scale-text')
            .removeClass('cf-gb-grid-answer__scale-text--hover');
    }
}