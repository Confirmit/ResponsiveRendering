import QuestionView from './base/question-view';

export default class EmailQuestionView extends QuestionView {
    constructor(question) {
        super(question);
        this._input = this._container.find('.cf-text-box--email');

        this._attachControlHandlers();
    }

    _attachControlHandlers() {
        this._input.on('input', event => {
            this._question.setValue(event.target.value);
        });
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._input.attr('aria-invalid', true);
    }

    _hideErrors() {
        super._hideErrors();
        this._input.attr('aria-invalid', false);
    }

    _onModelValueChange() {
        const value = this._question.value || '';

        if (this._input.val() !== value) {
            this._input.val(value);
        }
    }
}