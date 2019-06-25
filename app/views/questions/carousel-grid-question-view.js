import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from '../../utils.js';
import questionHelper from 'views/helpers/question-helper.js';
import Carousel from "../controls/carousel";
import CarouselItem from '../controls/carousel-item.js';


export default class CarouselGridQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._moveToFirstError = true;
        this._carouselItems = this._question.answers.map(answer => new CarouselItem(this._getCarouselItemId(answer.code)));
        this._carousel = new Carousel(this._container.find('.cf-carousel'), this._carouselItems);
        this._attachControlHandlers();
    }

    _attachControlHandlers() {
        this.answers.forEach(answer => {
            this._question.scales.forEach(scale => {
                this._getScaleNode(answer.code, scale.code).click(() => this._onScaleNodeClickHandler(answer, scale));
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event =>
                    this._onAnswerOtherValueChangedHandler(answer.code, event.target.value));
                this._getAnswerOtherNode(answer.code).on('keypress', event =>
                    this._onAnswerOtherValueKeyUpHandler(answer, event));
            }
        });
    }

    _hideErrors() {
        super._hideErrors();
        this._carouselItems.forEach(item => item.isError = false);
    }

    _getCarouselItemId(answerCode) {
        return `${this._question.id}_${answerCode}`;
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

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._container.find('.cf-answer-button').removeClass('cf-answer-button--selected');
        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getScaleNode(answerCode, scaleCode).addClass('cf-answer-button--selected');
        });
    }

    _updateCarouselComplete() {
        Object.keys(this._question.values).forEach(answerCode => {
            const carouselItem = this._carouselItems.find(item => item.id === this._getCarouselItemId(answerCode));
            const answer = this._question.answers.find(answer => answer.code === answerCode);
            if(answer.isOther){
                carouselItem.isComplete = this._question.values[answerCode] !== undefined && this._question.otherValues[answerCode] !== undefined;
            } else {
                carouselItem.isComplete = this._question.values[answerCode] !== undefined;
            }
        });
    }

    _onModelValueChange({changes}) {
        const currentItemIsCompleteBefore = this._carousel.currentItem.isComplete;

        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
        this._updateCarouselComplete();

        const otherIsChanged = changes.otherValues !== undefined;
        const answerCompleteStatusChanged = this._carousel.currentItem.isComplete === true && this._carousel.currentItem.isComplete !== currentItemIsCompleteBefore;
        if(answerCompleteStatusChanged && !otherIsChanged){
            this._carousel.moveNext();
        }
    }

    _onScaleNodeClickHandler(answer, scale) {
        this._question.setValue(answer.code, scale.code);

        if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
            this._getAnswerOtherNode(answer.code).focus();
        }
    }

    _onAnswerOtherValueChangedHandler(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }

    _onAnswerOtherValueKeyUpHandler(answer, event) {
        if (event.keyCode === 13 && questionHelper.isAnswerComplete(this._question, answer)) {
            event.preventDefault();
            this._carousel.moveNext();
        }
    }
}