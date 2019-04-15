import HorizontalRatingSingleQuestionView from "./horizontal-rating-single-question-view";

export default class GridBarsSingleQuestionView extends HorizontalRatingSingleQuestionView {
    /**
     * @param {SingleQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._groupNode = this._container.find('.cf-gb-single');
    }

    _attachHandlersToDOM() {
        super._attachHandlersToDOM();

        const attachHoverHandler = (answerCode) => {
            const item = this._getAnswerNode(answerCode);
            item.on('mouseover', mouseOver.bind(this, answerCode));
            item.on('mouseout', mouseOut.bind(this, answerCode));
        };

        const mouseOver = (answerCode) => {
            if (this._question.value) {
                return;
            }

            this._clearHoverItemStyles(answerCode);
            this._setHoverItemStyles(answerCode);
        };

        const mouseOut = (answerCode) => {
            if (this._question.value) {
                return;
            }

            this._clearHoverItemStyles(answerCode);
        };

        this._question.scaleItems.forEach(item => attachHoverHandler(item.code));
    }

    _updateAnswerNodes() {
        this._clearItemStyles();
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code)
                .attr('aria-checked', 'false')
                .attr('tabindex', '-1');
        });

        if (this._question.value === null) {
            this._getAnswerNode(this.answers[0].code)
                .attr('tabindex', '0');
            return;
        }

        this._setActiveItemStyles(this._question.value);
        this._getAnswerNode(this._question.value)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');
    }

    _setHoverItemStyles(answerCode) {
        const isScored = this._question.scaleItems.some(item => item.code === answerCode);
        if (isScored) {
            this._setBarItemStyles(answerCode, 'cf-gb-single__scale-item--hover', 'cf-gb-single__scale-text--hover');
        }
    }

    _setBarItemStyles(answerCode, itemStyle, textStyle) {

        this._question.scaleItems.some((item, index) => {
            this._getAnswerNode(item.code).addClass(itemStyle).css('opacity', (index + 2) / (this._question.scaleItems.length + 1));
            this._getAnswerTextNode(item.code).addClass(textStyle);
            return item.code === answerCode;
        });
    }

    _setActiveItemStyles(answerCode) {
        const isScored = this._question.scaleItems.some(item => item.code === answerCode);
        if (isScored) {
            this._setBarItemStyles(answerCode, 'cf-gb-single__scale-item--selected', 'cf-gb-single__scale-text--selected');
        }
        else {
            this._getAnswerNode(answerCode).addClass('cf-gb-single__na-item--selected');
        }
    }

    _clearItemStyles() {
        this._container.find('.cf-gb-single__scale-item')
            .removeClass('cf-gb-single__scale-item--selected')
            .removeClass('cf-gb-single__scale-item--hover')
            .css('opacity', '');

        this._container.find('.cf-gb-single__na-item')
            .removeClass('cf-gb-single__na-item--selected');

        this._container.find('.cf-gb-single__scale-text')
            .removeClass('cf-gb-single__scale-text--selected')
            .removeClass('cf-gb-single__scale-text--hover');
    }

    _clearHoverItemStyles() {
        this._container.find('.cf-gb-single__scale-item')
            .removeClass('cf-gb-single__scale-item--hover')
            .css('opacity', '');

        this._container.find('.cf-gb-single__scale-text')
            .removeClass('cf-gb-single__scale-text--hover');
    }
}