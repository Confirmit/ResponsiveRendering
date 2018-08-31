import QuestionErrorBlock from '../../error/question-error-block.js';
import $ from 'jquery';
import Event from "../../../event";

export default class QuestionView {
    /**
     * @param {Question} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null)
    {
        this._question = question;
        this._settings = settings;
        this._container = $(`#${this.id}`);
        this._errorBlock = new QuestionErrorBlock(this._container.find('.cf-question__error'));
        this._boundOnModelValueChange = this._onModelValueChange.bind(this);
        this._boundOnValidationComplete = this._onValidationComplete.bind(this);


        this._pending = false;
        this._pendingChangeEvent = new Event('pending: change');

        this._attachModelHandlers();
    }

    get id() {
        return this._question.id;
    }

    get pendingChangeEvent(){
        return this._pendingChangeEvent;
    }

    get pending(){
        return this._pending;
    }

    set pending(value){
        this._pending = value;
        this._pendingChangeEvent.trigger({id: this._question.id, pending:this._pending});
    }


    detachModelHandlers(){
        this._question.changeEvent.off(this._boundOnModelValueChange);
        this._question.validationCompleteEvent.off(this._boundOnValidationComplete);
    }

    _getQuestionInputNode() {
        return $(`#${this.id}_input`);
    }

    _attachModelHandlers() {
        this._question.changeEvent.on(this._boundOnModelValueChange);
        this._question.validationCompleteEvent.on(this._boundOnValidationComplete);
    }

    _onValidationComplete(validationResult) {
        this._hideErrors();
        if (validationResult.isValid === false) {
            this._showErrors(validationResult);
        }
    }

    _onModelValueChange() {}

    _showErrors(validationResult)
    {
        this._container.addClass('cf-question--error');
        this._errorBlock.showErrors(validationResult.errors.map(error => error.message));
    }

    _hideErrors()
    {
        this._container.removeClass('cf-question--error');
        this._errorBlock.hideErrors();
    }
}
