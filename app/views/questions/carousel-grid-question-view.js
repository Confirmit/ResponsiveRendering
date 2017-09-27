import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Carousel from './../controls/carousel.js';
import Utils from '../../utils.js';
import questionHelper from 'views/helpers/question-helper.js';

export default class CarouselGridQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._moveToFirstError = true;
        this._carousel = new Carousel(question);
        this._attachControlHandlers();
    }


    detachModelHandlers(){
        super.detachModelHandlers();
        this._carousel.detachModelHandlers();
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);

        if(validationResult.answerValidationResults.length > 0) {
            let currentPageValidationResult = validationResult.answerValidationResults.find(result => result.answerCode === this._carousel.currentAnswerCode);
            if(!currentPageValidationResult && this._moveToFirstError) {
                const answerOrder = this.answers.map(answer => answer.code);
                const answersWithError = validationResult.answerValidationResults.map(result => result.answerCode);
                const answerCode = answersWithError.sort((a, b) => answerOrder.indexOf(a) - answerOrder.indexOf(b))[0];
                this._carousel.moveToAnswer(answerCode);
                currentPageValidationResult = validationResult.answerValidationResults.find(result => result.answerCode === answerCode);
            }

            if(currentPageValidationResult) {
                const currentPageOtherError = currentPageValidationResult.errors.find(error => error.type === 'OtherRequired');
                if (currentPageOtherError) {
                    // have to wait transition end; don't want to subscribe on transitionend event.
                    setTimeout(() => this._getAnswerOtherNode(this._carousel.currentAnswerCode).focus(), 500);
                }
            }

            this._moveToFirstError = false;
        } else {
            this._moveToFirstError = true;
        }
    }

    _attachControlHandlers()
    {
        this.answers.forEach(answer => {
            this._question.scales.forEach(scale => {
                this._getScaleNode(answer.code, scale.code).click(() => this._onScaleNodeClickHandler(answer, scale));
            });

            if(answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event =>
                    this._onAnswerOtherValueChangedHandler(answer.code, event.target.value));
                this._getAnswerOtherNode(answer.code).on('keypress', event =>
                    this._onAnswerOtherValueKeyUpHandler(answer, event));
            }
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _updateAnswerNodes({values = []}){
        if (values.length === 0)
            return;

        this._container.find('.cf-answer-button').removeClass('cf-answer-button--selected');
        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getScaleNode(answerCode, scaleCode).addClass('cf-answer-button--selected');
        });
    }

    _onScaleNodeClickHandler(answer, scale) {
        this._question.setValue(answer.code, scale.code);

        if(answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
            this._getAnswerOtherNode(answer.code).focus();
            return;
        }

        this._carousel.moveNext();
    }

    _onAnswerOtherValueChangedHandler(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }

    _onAnswerOtherValueKeyUpHandler(answer, event) {
        if(event.keyCode === 13 && questionHelper.isAnswerComplete(this._question, answer)) {
            event.preventDefault();
            this._carousel.moveNext();
        }
    }
}