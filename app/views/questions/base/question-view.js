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

        this._container = $(`#${this.id}`);
        this._errorBlock = new QuestionErrorBlock(this._container.find('.cf-question__error'));

        this._attachModelHandlers();
    }

    get id() {
        return this._question.id;
    }

    _getQuestionInputNode() {
        return $(`#${this.id}_input`);
    }

    _onValidationComplete(validationResult) {
        this._hideErrors();
        if (validationResult.isValid === false) {
            this._showErrors(validationResult);
        }
    }

    _showErrors(validationResult) {
        this._container.addClass('cf-question--error');
        this._errorBlock.showErrors(validationResult.errors.map(error => error.message));
    }

    _hideErrors() {
        this._container.removeClass('cf-question--error');
        this._errorBlock.hideErrors();
    }
}
