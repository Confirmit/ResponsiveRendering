import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from './../../utils.js';

export default class SingleQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));

            if(answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }

    _onModelValueChange({changes}) {
        if(!this._question.value) {
            this._container.find('.cf-single-answer').removeClass('cf-single-answer--selected');
            return;
        }

        if (changes.value) {
            this._container.find('.cf-single-answer').removeClass('cf-single-answer--selected');
            this._getAnswerNode(this._question.value).addClass('cf-single-answer--selected');
        }

        if (changes.otherValue) {
            this._setOtherNodeValue(this._question.value, this._question.otherValue);
        }
    }

    _onAnswerNodeClick(answer) {
        this._question.setValue(answer.code);

        if (answer.isOther){
            const otherInput = this._getAnswerOtherNode(answer.code);
            this._question.setOtherValue(otherInput.val());
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if (!Utils.isEmpty(otherValue)) { // select answer
            this._question.setValue(answer.code);
        }

        if (this._question.value === answer.code) { // update other value for currently selected answer
            this._question.setOtherValue(otherValue);
        }
    }
}