import QuestionErrorBlock from '../../error/question-error-block.js';
import QuestionViewBase from "./question-view-base";
import $ from 'jquery';

export default class QuestionView extends QuestionViewBase {
    /**
     * @param {Question} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        super(question, settings);

        this._container = $(`#${this._question.id}`);
        this._questionErrorBlock = new QuestionErrorBlock(this._container.find('.cf-question__error'));

        this._attachModelHandlers();
    }

    _getQuestionErrorNodeId() {
        return `${this._question.id}_error`;
    }

    _getQuestionInputNodeId() {
        return `${this._question.id}_input`;
    }

    _getQuestionErrorNode() {
        return $('#' + this._getQuestionErrorNodeId());
    }

    _getQuestionInputNode() {
        return $('#' + this._getQuestionInputNodeId());
    }

    _onValidationComplete(validationResult) {
        this._hideErrors();

        if (validationResult.isValid === false) {
            this._showErrors(validationResult);
        }
    }

    _showErrors(validationResult) {
        this._addQuestionErrorModifier();
        this._questionErrorBlock.showErrors(validationResult.errors.map(error => error.message));
    }

    _hideErrors() {
        this._removeQuestionErrorModifier();
        this._questionErrorBlock.hideErrors();
    }

    _addQuestionErrorModifier() {
        this._container.addClass('cf-question--error');
    }

    _removeQuestionErrorModifier() {
        this._container.removeClass('cf-question--error');
    }
}
