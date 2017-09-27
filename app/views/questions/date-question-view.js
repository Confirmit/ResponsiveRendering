import QuestionView from './base/question-view.js';
import Utils from 'utils.js';

export default class DateQuestionView extends QuestionView {
    constructor(question) {
        super(question);
        this._input = this._container.find('.cf-text-box--date');

        this._attachControlHandlers();
    }

    _onModelValueChange() {
        // don't reset visual state of incomplete input type=date
        if (Utils.isEmpty(this._input.val()) && Utils.isEmpty(this._question.value))
            return;

        const value = this._question.value || '';
        if (this._input.val() !== value){
            this._input.val(value);
        }
    }

    /* Control handlers */
    _attachControlHandlers() {
        this._input.on('input', event => {
            this._question.setValue(event.target.value);
        });
    }
}
