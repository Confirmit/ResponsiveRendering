import questionHelper from 'views/helpers/question-helper.js';
import $ from 'jquery';

export default class Carousel {
    constructor(question) {
        this._question = question;
        this._currentAnswerCode = null;
        this._answersWithErrors = [];

        this._container = $(`#${this._question.id}`).find('.cf-carousel');
        this._backNavigationButton = this._container.find('.cf-carousel__navigation-button--back');
        this._nextNavigationButton = this._container.find('.cf-carousel__navigation-button--next');

        this._boundOnModelValueChange = this._onModelValueChange.bind(this);
        this._boundOnValidationComplete = this._onValidationComplete.bind(this);

        this._init();
    }

    get currentAnswerCode() {
        return this._currentAnswerCode;
    }

    moveNext() {
        if(this._currentAnswerIndex >= this._question.answers.length - 1) {
            return;
        }
        const nextAnswerCode = this._question.answers[this._currentAnswerIndex + 1].code;

        this.moveToAnswer(nextAnswerCode);
    }

    moveBack() {
        if(this._currentAnswerIndex < 1) {
            return;
        }
        const previousAnswerCode = this._question.answers[this._currentAnswerIndex - 1].code;

        this.moveToAnswer(previousAnswerCode);
    }

    moveTo(answerIndex) {
        const answerCode  = this._question.answers[answerIndex].code;
        this.moveToAnswer(answerCode);
    }

    moveToAnswer(answerCode) {
        this._currentAnswerCode = answerCode.toString();
        this._update();
    }

    detachModelHandlers(){
        this._question.changeEvent.off(this._boundOnModelValueChange);
        this._question.validationCompleteEvent.off(this._boundOnValidationComplete);
    }

    get _currentAnswerIndex() {
        return this._question.answers.findIndex(answer => answer.code === this._currentAnswerCode);
    }

    _getAnswerTextNode(answerCode) {
        return $(`#${this._question.id}_${answerCode}_carousel_text`);
    }

    _getAnswerPagingNode(answerCode) {
        return $(`#${this._question.id}_${answerCode}_carousel_paging`);
    }

    _getAnswerContentNode(answerCode) {
        return $(`#${this._question.id}_${answerCode}_carousel_content`);
    }

    _init() {
        this._currentAnswerCode = (this._question.answers.find(answer => !this._question.values[answer.code]) || this._question.answers[0]).code;

        this._backNavigationButton.click(this.moveBack.bind(this));
        this._nextNavigationButton.click(this.moveNext.bind(this));

        this._question.answers.forEach(answer => {
           this._getAnswerPagingNode(answer.code).click(() => this.moveToAnswer(answer.code));
        });

        this._attachModelHandlers();
    }

    _attachModelHandlers() {
        this._question.changeEvent.on(this._boundOnModelValueChange);
        this._question.validationCompleteEvent.on(this._boundOnValidationComplete);
    }

    _onModelValueChange(){
        this._updatePaging();
    }

    _onValidationComplete(validationResult) {
        this._answersWithErrors = validationResult.answerValidationResults.map(result => result.answerCode);
        this._update(); // needs full update to recalculate space for error block
    }

    _update() {
        this._updateText();
        this._updateNavigationButtons();
        this._updatePaging();
        this._updateContent();
    }

    _updateText() {
        this._container.find('.cf-carousel__text').removeClass('cf-carousel__text--current');

        const current = this._getAnswerTextNode(this._currentAnswerCode);
        current.addClass('cf-carousel__text--current');

        this._container.find('.cf-carousel__text-list').height(current.innerHeight());
    }

    _updateNavigationButtons() {
        const firstAnswer = this._question.answers[0];
        if(firstAnswer && firstAnswer.code === this._currentAnswerCode) {
            this._backNavigationButton.addClass('cf-carousel__navigation-button--disabled');
        } else {
            this._backNavigationButton.removeClass('cf-carousel__navigation-button--disabled');
        }

        const lastAnswer = this._question.answers[this._question.answers.length - 1];
        if(lastAnswer && lastAnswer.code === this._currentAnswerCode) {
            this._nextNavigationButton.addClass('cf-carousel__navigation-button--disabled');
        } else {
            this._nextNavigationButton.removeClass('cf-carousel__navigation-button--disabled');
        }
    }

    _updatePaging() {
        this._question.answers.forEach(answer => {
            const item = this._getAnswerPagingNode(answer.code);
            item.removeClass('cf-carousel__paging-item--complete cf-carousel__paging-item--error cf-carousel__paging-item--current');

            if (this._answersWithErrors.includes(answer.code)){
                item.addClass('cf-carousel__paging-item--error');
            }
            else if(questionHelper.isAnswerComplete(this._question, answer)) {
                item.addClass('cf-carousel__paging-item--complete');
            }

            if(answer.code === this._currentAnswerCode) {
                item.addClass('cf-carousel__paging-item--current');
            }
        });
    }

    _updateContent() {
        this._container.find('.cf-carousel__content-item').removeClass('cf-carousel__content-item--current');
        this._getAnswerContentNode(this._currentAnswerCode).addClass('cf-carousel__content-item--current');
    }
}