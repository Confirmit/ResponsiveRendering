import Utils from "../../../../utils";
import Grid3DMobileInnerQuestionView from "./grid-3d-mobile-inner-question-view";

export default class Grid3DMobileInnerMultiQuestionView extends Grid3DMobileInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._selectedAnswerCssClass = 'cf-multi-answer--selected';
        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));

            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }

    _isSelected(answer) {
        return this._question.values.includes(answer.code);
    }

    _onModelValueChange({changes}) {
        if (changes.values === undefined && changes.values.length === 0) {
            return;
        }

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass(this._selectedAnswerCssClass);
        });

        this._question.values.forEach(answerCode => {
            this._getAnswerNode(answerCode).addClass(this._selectedAnswerCssClass);
        });
    }

    _onAnswerNodeClick(answer) {
        const newValue = !this._isSelected(answer);
        this._question.setValue(answer.code, newValue);

        if (newValue && answer.isOther) {
            const otherInput = this._getAnswerOtherNode(answer.code);
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if (!Utils.isEmpty(otherValue)) { // select answer
            this._question.setValue(answer.code, true);
        }

        this._parentQuestion.setOtherValue(answer.code, otherValue);
    }
}