import QuestionView from "./base/question-view";
import $ from 'jquery';
import AnswerErrorManager from "../error/answer-error-manager";
import Utils from "../../utils";

export default class MultiGridQuestionView extends QuestionView {
    constructor(question) {
        super(question);

        // console.log('multi grid init');
        // setTimeout(() => { window.Confirmit.debug = true }, 0 );

        this._answerErrorManager = new AnswerErrorManager();


        this._attachHandlersToDOM();
    }

    _getQuestionNode(questionCode) {
        return $(`#${questionCode}`);
    }

    _getAnswerNode(questionCode, answerCode) {
        return $(`#${questionCode}_${answerCode}`);
    }

    _getQuestionAnswerOtherNode(questionCode, answerCode) {
         return $(`#${questionCode}_${answerCode}_other`);
    }

    _getAnswerOtherNode(answerCode) {
        return $(`#${this.id}_${answerCode}_other`);
    }

    _getOtherNodes(answerCode) {
        return $(`.cf-grid-answer__other[name=${this.id}_${answerCode}_other]`);
    }

    _attachHandlersToDOM() {
        const attachItemClickHandler = (question, answer) => {
            this._getAnswerNode(question.id, answer.code).on('click', this._onAnswerNodeClick.bind(this, question, answer));
        };

        this._question.innerQuestions.forEach(question => {
            question.answers.forEach(answer => attachItemClickHandler(question, answer));
        });

        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            this._getAnswerOtherNode(answer.code).on('input', event => { this._onAnswerOtherNodeValueChange(answer, event.target.value) });

            this._question.innerQuestions.forEach(question => {
                this._getQuestionAnswerOtherNode(question.id, answer.code)
                    .on('click', e => e.stopPropagation())
                    .on('input', event => { this._onQuestionAnswerOtherNodeValueChange(question, answer, event.target.value) });
            });
        });
    }

    _updateQuestionAnswerNodes({ questions = {} }) {
        Object.entries(questions).forEach(([questionId, { values = [] }]) => {
            if (values.length === 0) {
                return;
            }

            this._getQuestionNode(questionId).find('.cf-grid-answer__scale-item').removeClass('cf-grid-answer__scale-item--selected');

            this._question.getInnerQuestion(questionId).values.forEach(value => {
                this._getAnswerNode(questionId, value).addClass('cf-grid-answer__scale-item--selected');
            });
        });
    }

    _updateAnswerOtherNodes({ otherValues = [] }) {
        otherValues.forEach(answerCode => {
            const otherValue = this._question.otherValues[answerCode];
            this._setOtherNodeValue(answerCode, otherValue);
        });
    }

    _setOtherNodeValue(answerCode, otherValue) {
        otherValue = otherValue || '';

        const otherNodes = this._getOtherNodes(answerCode).filter((index, node) => $(node).val() !== otherValue);
        otherNodes.val(otherValue);
    }

    _showErrors(validationResult)
    {
        super._showErrors(validationResult);
        this._showAnswerOtherAnswer(validationResult);
        this._showInnerQuestionErrors(validationResult);
    }

    _showAnswerOtherAnswer(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const answer = this._question.getAnswer(answerValidationResult.answerCode);
            if (!answer.isOther) {
                return;
            }

            this._answerErrorManager.showErrors(answerValidationResult, this._getAnswerOtherNode(answer.code));

            this._question.innerQuestions.forEach(question => {
                if(!question.values.includes(answer.code)) {
                    return;
                }
                const target = this._getQuestionAnswerOtherNode(question.id, answer.code);
                this._answerErrorManager.showErrors(answerValidationResult, target);
            });
        });
    }

    _showInnerQuestionErrors(validationResult) {
        validationResult.questionValidationResults.forEach(questionValidationResult => {
            const target = this._getQuestionNode(questionValidationResult.questionId).find('.cf-grid-answer__text');
            this._answerErrorManager.showErrors(questionValidationResult, target);
        });
    }

    _hideErrors() {
        super._hideErrors();
        this._answerErrorManager.removeAllErrors();
    }

    _onModelValueChange({changes}) {
        this._updateQuestionAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _onAnswerNodeClick(question, answer) {
        const currentState = this._question.getInnerQuestion(question.id).values.includes(answer.code);
        this._question.getInnerQuestion(question.id).setValue(answer.code, !currentState);
    }

    _onAnswerOtherNodeValueChange(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }

    _onQuestionAnswerOtherNodeValueChange(question, answer, value) {
        if(!Utils.isEmpty(value)) {
            this._question.getInnerQuestion(question.id).setValue(answer.code, true);
        }

        this._question.setOtherValue(answer.code, value);
    }
}