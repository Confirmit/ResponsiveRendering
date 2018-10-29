import Event from "../../../event";

export default class QuestionViewBase {
    /**
     * @param {Question} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        this._question = question;
        this._settings = settings;

        this._boundOnModelValueChange = this._onModelValueChange.bind(this);
        this._boundOnValidationComplete = this._onValidationComplete.bind(this);

        this._pending = false;
        this._pendingChangeEvent = new Event('pending: change');

        this._attachModelHandlers();
    }

    get pendingChangeEvent() {
        return this._pendingChangeEvent;
    }

    get pending() {
        return this._pending;
    }

    set pending(value) {
        this._pending = value;
        this._pendingChangeEvent.trigger({id: this._question.id, pending: this._pending});
    }

    detachModelHandlers() {
        this._question.changeEvent.off(this._boundOnModelValueChange);
        this._question.validationCompleteEvent.off(this._boundOnValidationComplete);
    }

    _attachModelHandlers() {
        this._question.changeEvent.on(this._boundOnModelValueChange);
        this._question.validationCompleteEvent.on(this._boundOnValidationComplete);
    }

    _onValidationComplete() {
    }

    _onModelValueChange() {
    }
}
