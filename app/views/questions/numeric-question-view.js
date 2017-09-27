import QuestionView from './base/question-view.js'

export default class NumericQuestionView extends QuestionView {
    constructor(question) {
        super(question);

        this._nanCode = 'NOT_A_NUMBER';

        this._input = this._getQuestionInputNode();

        this._attachControlHandlers();
    }

    _onModelValueChange() {
        const value = this._question.value;
        if (value === this._nanCode) {
            return;
        }
        if (this._input.val() === value) {
            return;
        }
        this._input.val(value);
    }

    _attachControlHandlers() {
        this._input.on('input', this._onQuestionInputNodeValueChange.bind(this));
    }

    _onQuestionInputNodeValueChange(event) {
        let value = event.target.value;
        if(value === '' && !event.target.validity.valid) {
            value = this._nanCode;
        }
        this._question.setValue(value);
    }
}
