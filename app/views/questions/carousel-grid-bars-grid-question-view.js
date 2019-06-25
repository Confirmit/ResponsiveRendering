import GridQuestionView from "./grid-question-view";
import questionHelper from 'views/helpers/question-helper.js';
import Carousel from "../controls/carousel";
import CarouselItem from '../controls/carousel-item.js';
import Utils from '../../utils.js';
import $ from "jquery";

export default class CarouselGridBarsGridQuestionView extends GridQuestionView {
    /**
     * @param {GridRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._carouselItems = this._question.answers.map(answer => new CarouselItem(this._getCarouselItemId(answer.code)));
        this._carousel = new Carousel(this._container.find('.cf-carousel'), this._carouselItems);
        this._moveToFirstError = true;

        this._scaleGroupClass = 'cf-gb-single';
        this._scaleClass = 'cf-gb-single__scale-item';
        this._scaleTextClass = 'cf-gb-single__scale-text';
        this._nonScoredScaleClass = 'cf-gb-single__na-item';
        this._selectedScaleClass = 'cf-gb-single__scale-item--selected';
        this._selectedScaleTextClass = 'cf-gb-single__scale-text--selected';
        this._selectedNonScoredClass = 'cf-gb-single__na-item--selected';
        this._hoverScaleClass = 'cf-gb-single__scale-item--hover';
        this._hoverScaleTextClass = 'cf-gb-single__scale-text--hover';
    }

    _getCarouselItemId(answerCode) {
        return `${this._question.id}_${answerCode}`;
    }

    _getScaleTextNode(answerCode, scaleCode) {
        return $(`#${this._question.id}_${answerCode}_${scaleCode}_text`);
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

    _clearScaleNode(answerCode, scaleCode) {
        this._getScaleNode(answerCode, scaleCode)
            .removeClass(this._selectedScaleClass)
            .removeClass(this._selectedNonScoredClass)
            .attr('aria-checked', 'false')
            .attr('tabindex', '-1');
    }

    _selectScaleNode(answerCode, scaleCode) {
        const itemInScale = this._question.scaleItems.find(item => item.code === scaleCode) !== undefined;
        const itemNodeClass = itemInScale ? this._selectedScaleClass : this._selectedNonScoredClass;
        this._getScaleNode(answerCode, scaleCode)
            .addClass(itemNodeClass)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');

        if (itemInScale) {
            const scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
            if (scaleIndex !== -1) {
                this._setBarItemStyles(answerCode, scaleIndex, this._selectedScaleClass, this._selectedScaleTextClass);
            }
        }
    }

    _setHoverItemStyles(answerCode, scaleCode) {
        const scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
        if (scaleIndex !== -1) {
            this._setBarItemStyles(answerCode, scaleIndex, this._hoverScaleClass, this._hoverScaleTextClass);
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

        answerNode.find('.' + this._scaleClass)
            .removeClass(this._selectedScaleClass)
            .removeClass(this._hoverScaleClass)
            .css('opacity', '');

        answerNode.find('.' + this._nonScoredScaleClass)
            .removeClass(this._selectedNonScoredClass);

        answerNode.find('.' + this._scaleTextClass)
            .removeClass(this._selectedScaleTextClass)
            .removeClass(this._hoverScaleTextClass);
    }

    _clearHoverItemStyles(answerCode) {
        const answerNode = this._getAnswerNode(answerCode);

        answerNode.find('.' + this._scaleClass)
            .removeClass(this._hoverScaleClass)
            .css('opacity', '');

        answerNode.find('.' + this._scaleTextClass)
            .removeClass(this._hoverScaleTextClass);
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

    _updateCarouselComplete() {
        Object.keys(this._question.values).forEach(answerCode => {
            const carouselItem = this._carouselItems.find(item => item.id === this._getCarouselItemId(answerCode));
            const answer = this._question.answers.find(answer => answer.code === answerCode);
            if (answer.isOther) {
                carouselItem.isComplete = this._question.values[answerCode] !== undefined && this._question.otherValues[answerCode] !== undefined;
            } else {
                carouselItem.isComplete = this._question.values[answerCode] !== undefined;
            }
        });
    }

    _selectScale(answer, scale) {
        this._question.setValue(answer.code, scale.code);

        if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
            this._getAnswerOtherNode(answer.code).focus();
        }
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);

        if (validationResult.answerValidationResults.length > 0) {
            let currentPageValidationResult = validationResult.answerValidationResults.find(result => this._getCarouselItemId(result.answerCode) === this._carousel.currentItem.id);
            const answersWithError = validationResult.answerValidationResults.map(result => this._getCarouselItemId(result.answerCode));
            this._carouselItems.forEach(item => item.isError = answersWithError.includes(item.id));
            if (!currentPageValidationResult && this._moveToFirstError) {
                let index = this._carouselItems.findIndex(item => item.isError);
                if (index !== -1) {
                    this._carousel.moveToItemByIndex(index);
                }
            }

            if (currentPageValidationResult) {
                const currentPageOtherError = currentPageValidationResult.errors.find(error => error.type === 'OtherRequired');
                if (currentPageOtherError) {
                    // have to wait transition end; don't want to subscribe on transitionend event.
                    setTimeout(() => this._getAnswerOtherNode(this._carousel.currentItem.id).focus(), 500);
                }
            }

            this._moveToFirstError = false;
        } else {
            this._moveToFirstError = true;
        }
    }

    _hideErrors() {
        super._hideErrors();
        this._carouselItems.forEach(item => item.isError = false);
    }

    _onModelValueChange({changes}) {
        super._onModelValueChange({changes});

        const currentItemIsCompleteBefore = this._carousel.currentItem.isComplete;
        this._updateCarouselComplete();
        const otherIsChanged = changes.otherValues !== undefined;
        const answerCompleteStatusChanged = this._carousel.currentItem.isComplete === true && this._carousel.currentItem.isComplete !== currentItemIsCompleteBefore;
        if (answerCompleteStatusChanged && !otherIsChanged) {
            this._carousel.moveNext();
        }
    }

    _onScaleNodeClick(event, answer, scale) {
        this._selectScale(answer, scale);
    }

    _onAnswerOtherValueKeyPress(event, answer) {
        super._onAnswerOtherValueKeyPress(event, answer);
        if (event.keyCode === 13 && questionHelper.isAnswerComplete(this._question, answer)) {
            this._carousel.moveNext();
        }
    }
}