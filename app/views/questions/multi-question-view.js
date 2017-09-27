import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from './../../utils.js';

export default class MultiQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._attachControlToDOM();
    }

    _attachControlToDOM()
    {
        this.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', () => this._onAnswerNodeClick(answer));
            if(answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._container.find('.cf-multi-answer').removeClass('cf-multi-answer--selected');
        this._question.values.forEach(answerCode => {
            this._getAnswerNode(answerCode).addClass('cf-multi-answer--selected');
        });
    }

    _isSelected(answer) {
        return this._question.values.includes(answer.code);
    }

    _onAnswerNodeClick(answer) {
        const newValue = !this._isSelected(answer);
        this._question.setValue(answer.code, newValue);

        if (newValue && answer.isOther){
            const otherInput = this._getAnswerOtherNode(answer.code);
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if(!Utils.isEmpty(otherValue)) {
            this._question.setValue(answer.code, true);
        }

        this._question.setOtherValue(answer.code, otherValue);
    }
}