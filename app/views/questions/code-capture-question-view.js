import QuestionView from './base/question-view';

export default class CodeCaptureQuestionView extends QuestionView {
    constructor(question) {
        super(question);

        this._input = this._getQuestionInputNode();
        this._input.on('input', event => this._question.setValue(event.target.value));

        this._captureButton = this._container.find('.cf-code-capture__capture-button');
        this._captureButton.on('click', this._capture.bind(this));
    }

    /* this method have to be implemented in view, due to native app override */
    _capture() {
        this._input.focus();
    }

    _onModelValueChange() {
        const value = this._question.value || '';
        if (this._input.val() !== value) {
            this._input.val(value);
        }
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._input.attr('aria-invalid', true);
    }

    _hideErrors() {
        super._hideErrors();
        this._input.attr('aria-invalid', false);
    }
}