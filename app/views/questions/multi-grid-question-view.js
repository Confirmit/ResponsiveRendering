import QuestionView from './base/question-view';
import Utils from '../../utils';
import KEYS from '../helpers/keyboard-keys';
import ErrorBlockManager from '../error/error-block-manager';
import ValidationTypes from '../../api/models/validation/validation-types';
import $ from 'jquery';

export default class MultiGridQuestionView extends QuestionView {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._currentQuestionIndex = null;
        this._currentAnswerIndex = null;

        this._selectedAnswerCssClass = 'cf-grid-answer__scale-item--selected';
        this._selectedImageAnswerCssClass = 'cf-answer-image--selected';

        this._answerErrorBlockManager = new ErrorBlockManager();

        this._attachHandlersToDOM();
    }

    get _currentQuestion() {
        return this._question.innerQuestions[this._currentQuestionIndex];
    }

    get _currentAnswer() {
        return this._question.answers[this._currentAnswerIndex];
    }

    _getInnerQuestionErrorBlockId(questionCode) {
        return `${questionCode}_error`;
    }

    _getAnswerOtherErrorBlockId(answerCode) {
        return `${this._question.id}_${answerCode}_other_error`
    }

    _getInnerQuestionAnswerErrorBlockId(innerQuestionId, answerCode) {
        return `${innerQuestionId}_${answerCode}_other_error`
    }

    _getInnerQuestionNode(questionCode) {
        return $(`#${questionCode}`);
    }

    _getInnerQuestionAnswerOtherNode(questionCode, answerCode) {
        return $(`#${questionCode}_${answerCode}_other`);
    }

    _getAnswerNode(questionCode, answerCode) {
        return $(`#${questionCode}_${answerCode}`);
    }

    _getAnswerOtherNode(answerCode) {
        return $(`#${this._question.id}_${answerCode}_other`);
    }

    _getOtherNodes(answerCode) {
        return $(`[name=${this._question.id}_${answerCode}_other]`);
    }

    _attachHandlersToDOM() {
        this._question.innerQuestions.forEach((question, questionIndex) => {
            question.answers.forEach((answer, answerIndex) => {
                this._getAnswerNode(question.id, answer.code).on('click', this._onAnswerNodeClick.bind(this, question, answer));
                this._getAnswerNode(question.id, answer.code).on('focus', this._onAnswerNodeFocus.bind(this, questionIndex, answerIndex));
            });
        });

        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            this._getAnswerOtherNode(answer.code)
                .on('keydown', e => e.stopPropagation())
                .on('input', event => {
                    this._onAnswerOtherNodeValueChange(answer, event.target.value)
                });

            this._question.innerQuestions.forEach(question => {
                this._getInnerQuestionAnswerOtherNode(question.id, answer.code)
                    .on('click', e => e.stopPropagation())
                    .on('keydown', e => e.stopPropagation())
                    .on('input', event => {
                        this._onQuestionAnswerOtherNodeValueChange(question, answer, event.target.value)
                    });
            });
        });

        if (!this._settings.disableKeyboardSupport) {
            this._container.on('keydown', this._onKeyPress.bind(this));
        }
    }

    _getSelectedAnswerClass(answer){
        return answer.imagesSettings !== null ? this._selectedImageAnswerCssClass : this._selectedAnswerCssClass;
    }

    _updateQuestionAnswerNodes({questions = {}}) {
        Object.entries(questions).forEach(([questionId, {values = []}]) => {
            if (values.length === 0) {
                return;
            }

            values.forEach(value => {
                const answer = this._question.getAnswer(value);
                const isSelected = this._question.getInnerQuestion(questionId).values.includes(value);

                this._getAnswerNode(questionId, value)
                    .toggleClass(this._getSelectedAnswerClass(answer), isSelected)
                    .attr( 'aria-checked', ()=> isSelected ? 'true' : 'false');
            });
        });
    }

    _updateAnswerOtherNodes({otherValues = []}) {
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

    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._showAnswerOtherError(validationResult);
        this._showInnerQuestionErrors(validationResult);
    }

    _showAnswerOtherError(validationResult) {
        validationResult.answerValidationResults.filter(result => !result.isValid).forEach(result => {
            const otherErrorsMessages = result.errors
                .filter(error => error.type === ValidationTypes.OtherRequired)
                .map(error => error.message);

            if (otherErrorsMessages.length === 0) {
                return;
            }

            const errorBlockId = this._getAnswerOtherErrorBlockId(result.answerCode);
            const otherNode = this._getAnswerOtherNode(result.answerCode);
            otherNode
                .attr('aria-errormessage', errorBlockId)
                .attr('aria-invalid', 'true');

            this._answerErrorBlockManager.showErrors(errorBlockId, otherNode, otherErrorsMessages);

            this._question.innerQuestions.forEach(question => {
                if (!question.values.includes(result.answerCode)) {
                    return;
                }

                const errorBlockId = this._getInnerQuestionAnswerErrorBlockId(question.id, result.answerCode);
                const otherNode = this._getInnerQuestionAnswerOtherNode(question.id, result.answerCode);
                otherNode
                    .attr('aria-errormessage', errorBlockId)
                    .attr('aria-invalid', 'true');
                this._answerErrorBlockManager.showErrors(errorBlockId, otherNode, otherErrorsMessages);
            });
        });
    }

    _showInnerQuestionErrors(validationResult) {
        validationResult.questionValidationResults.filter(result => !result.isValid).forEach(validationResult => {
            const questionNode = this._getInnerQuestionNode(validationResult.questionId);
            const questionTextNode = questionNode.find('.cf-grid-answer__text');
            const errorBlockId = this._getInnerQuestionErrorBlockId(validationResult.questionId);
            const errors = validationResult.errors.map(error => error.message);
            this._answerErrorBlockManager.showErrors(errorBlockId, questionTextNode, errors);
            questionNode.find('.cf-grid-answer__scale')
                .attr('aria-invalid', 'true')
                .attr('aria-errormessage', errorBlockId);
        });
    }

    _hideErrors() {
        super._hideErrors();

        this._answerErrorBlockManager.removeAllErrors();

        this._container.find('.cf-text-box')
            .removeAttr('aria-errormessage')
            .removeAttr('aria-invalid');

        this._container.find('.cf-grid-answer__scale')
            .removeAttr('aria-invalid')
            .removeAttr('aria-errormessage');
    }

    _toggleAnswer(question, answer) {
        const currentState = this._question.getInnerQuestion(question.id).values.includes(answer.code);
        this._question.getInnerQuestion(question.id).setValue(answer.code, !currentState);
    }

    _onModelValueChange({changes}) {
        this._updateQuestionAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _onAnswerNodeClick(question, answer) {
        this._toggleAnswer(question, answer);
    }

    _onAnswerOtherNodeValueChange(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }

    _onQuestionAnswerOtherNodeValueChange(question, answer, value) {
        if (!Utils.isEmpty(value)) {
            this._question.getInnerQuestion(question.id).setValue(answer.code, true);
        }

        this._question.setOtherValue(answer.code, value);
    }

    _onAnswerNodeFocus(questionIndex, answerIndex) {
        this._currentQuestionIndex = questionIndex;
        this._currentAnswerIndex = answerIndex;
    }

    _onKeyPress(event) {
        this._onSelectKeyPress(event);
    }

    _onSelectKeyPress(event) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentQuestion === null || this._currentAnswer === null) {
            return;
        }

        event.preventDefault();

        this._toggleAnswer(this._currentQuestion, this._currentAnswer);
    }
}