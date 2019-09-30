import Carousel from '../controls/carousel.js';
import CarouselItem from '../controls/carousel-item.js';
import Utils from "../../utils";
import $ from "jquery";
import QuestionView from "./base/question-view";
import ErrorBlockManager from "../error/error-block-manager";

export default class CarouselMultiGridQuestionView extends QuestionView {
    constructor(question) {
        super(question);

        this._carouselItems = this._question.innerQuestions.map(question => new CarouselItem(question.id, question.values.length > 0));
        this._carousel = new Carousel(this._container.find('.cf-carousel'), this._carouselItems);
        this._moveToFirstError = true;
        this._answerErrorBlockManager = new ErrorBlockManager();

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        const attachItemClickHandler = (question, answer) => {
            this._getAnswerNode(question.id, answer.code).on('click', this._onAnswerNodeClick.bind(this, question, answer));
        };

        this._question.innerQuestions.forEach(question => {
            question.answers.forEach(answer => attachItemClickHandler(question, answer));
        });

        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            this._question.innerQuestions.forEach(question => {
                this._getQuestionAnswerOtherNode(question.id, answer.code)
                    .on('click', e => e.stopPropagation())
                    .on('input', event => {
                        this._onQuestionAnswerOtherNodeValueChange(question, answer, event.target.value)
                    });
            });
        });
    }

    _getQuestionErrorBlockId(questionCode) {
        return $(`${questionCode}_error`);
    }

    _getQuestionNode(questionCode) {
        return this._container.find(`#${questionCode}`);
    }

    _getAnswerNode(questionCode, answerCode) {
        return this._container.find(`#${questionCode}_${answerCode}`);
    }

    _getQuestionAnswerOtherNode(questionCode, answerCode) {
        return this._container.find(`#${questionCode}_${answerCode}_other`);
    }

    _getOtherNodes(answerCode) {
        return this._container.find(this._question.innerQuestions.map(question => `#${question.id}_${answerCode}_other`).join(','));
    }

    _getCarouselItem(questionId) {
        return this._carouselItems.find(item => item.id === questionId);
    }

    _updateQuestionAnswerNodes({questions = {}}) {
        Object.entries(questions).forEach(([questionId, {values = []}]) => {
            if (values.length === 0) {
                return;
            }

            this._carousel.currentContentNode.find('.cf-answer-button').removeClass('cf-answer-button--selected');

            this._question.getInnerQuestion(questionId).values.forEach(value => {
                const answerNode = this._getAnswerNode(questionId, value);
                answerNode.addClass('cf-answer-button--selected');
            });
        });
    }

    _updateAnswerOtherNodes({otherValues = []}) {
        otherValues.forEach(answerCode => {
            const otherValue = this._question.otherValues[answerCode];
            this._setOtherNodeValue(answerCode, otherValue);
        });
    }

    _updateCarouselPaging() {
        this._question.innerQuestions.forEach(question => {
            let carouselItem = this._getCarouselItem(question.id);
            let selecterAnswersWithOther = this._question.answers.filter(answer => answer.isOther && question.values.includes(answer.code));
            if(selecterAnswersWithOther.length !== 0) {
                carouselItem.isComplete = selecterAnswersWithOther.every(answer => this._question.otherValues[answer.code] !== undefined);
            } else {
                carouselItem.isComplete = question.values.length !== 0;
            }
        });
    }

    _setOtherNodeValue(answerCode, otherValue) {
        otherValue = otherValue || '';

        const otherNodes = this._getOtherNodes(answerCode).filter((index, node) => $(node).val() !== otherValue);
        otherNodes.val(otherValue);
    }

    _hideErrors() {
        super._hideErrors();
        this._carouselItems.forEach(item => item.isError = false);
        this._answerErrorBlockManager.removeAllErrors();
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);

        const questionWithError = validationResult.questionValidationResults.some(result => !result.isValid);
        const answerWithError = validationResult.answerValidationResults.some(result => !result.isValid);
        if (questionWithError || answerWithError) {
            this._showInnerQuestionErrors(validationResult);
            this._showAnswerOtherError(validationResult);
            this._showFirstQuestionError();
        }
    }

    _showFirstQuestionError() {
        const currentItemHasError = this._carousel.currentItem.isError;
        if (!currentItemHasError && this._moveToFirstError) {
            let index = this._carouselItems.findIndex(item => item.isError);
            if (index !== -1) {
                this._carousel.moveToItemByIndex(index);
            }
        }

        this._moveToFirstError = false;
    }

    _showInnerQuestionErrors(validationResult) {
        validationResult.questionValidationResults.forEach(questionValidationResult => {
            let item = this._getCarouselItem(questionValidationResult.questionId);
            item.isError = !questionValidationResult.isValid;

            const target = this._getQuestionNode(questionValidationResult.questionId);
            const errorBlockId = this._getQuestionErrorBlockId(questionValidationResult.questionId);
            const errors = questionValidationResult.errors.map(error => error.message);
            this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
        });
    }

    _showAnswerOtherError(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const answer = this._question.getAnswer(answerValidationResult.answerCode);
            if (!answer.isOther) {
                return;
            }

            this._question.innerQuestions.forEach(question => {
                if(!question.values.includes(answer.code)) {
                    return;
                }

                let item = this._getCarouselItem(question.id);
                item.isError = true;

                const target = this._getQuestionNode(question.id);
                const errorBlockId = this._getQuestionErrorBlockId(question.id);
                const errors = answerValidationResult.errors.map(error => error.message);
                this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
            });
        });
    }

    _onModelValueChange({changes}) {
        this._updateQuestionAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
        this._updateCarouselPaging();
    }

    _onAnswerNodeClick(question, answer) {
        const currentState = this._question.getInnerQuestion(question.id).values.includes(answer.code);
        this._question.getInnerQuestion(question.id).setValue(answer.code, !currentState);

        const otherInput = this._getQuestionAnswerOtherNode(question.id, answer.code);
        if (answer.isOther && Utils.isEmpty(otherInput.val())) {
            otherInput.focus();
        }
    }


    _onQuestionAnswerOtherNodeValueChange(question, answer, value) {
        if (!Utils.isEmpty(value)) {
            this._question.getInnerQuestion(question.id).setValue(answer.code, true);
        }

        this._question.setOtherValue(answer.code, value);
    }
}