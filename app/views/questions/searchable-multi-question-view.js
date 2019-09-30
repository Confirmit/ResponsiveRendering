import SearchableQuestionViewBase from "./base/searchable-question-view-base";
import Utils from "../../utils";

export default class SearchableMultiQuestionView extends SearchableQuestionViewBase {
    constructor(question, settings = null) {
        super(question, settings);

        this._selectedAnswerCssClass = 'cf-multi-answer--selected';
    }

    _getSelectedAnswerText(answer) {
        return answer.isOther && !Utils.isEmpty(this._question.otherValues[answer.code])
            ? this._question.otherValues[answer.code] : answer.text;
    }

    _renderAnswer(answer) {
        const selectedCssModifier = this._isSelected(answer) ? 'cf-multi-answer--selected' : '';
        const rtlCssModifier = Utils.getRtlCSSClassModifier(this._question, 'cf-multi-answer');

        return `
            <div class="cf-multi-answer ${rtlCssModifier} ${selectedCssModifier}" id="${this._getAnswerNodeId(answer.code)}">
                 <div class="cf-multi-answer__text" id="${this._getAnswerTextNodeId(answer.code)}">${answer.text}</div>              
            </div>
        `;
    }

    _unselectAnswer(answer) {
        this._question.setValue(answer.code, false);
    }

    _attachHandlersToDOM() {
        super._attachHandlersToDOM();

        this.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', () => this._onAnswerNodeClick(answer));
            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass(this._selectedAnswerCssClass)
        });

        this._question.values.forEach(answerCode => {
            this._getAnswerNode(answerCode).addClass(this._selectedAnswerCssClass)
        });
    }

    _isSelected(answer) {
        return this._question.values.includes(answer.code);
    }

    _toggleAnswer(answer) {
        const newValue = !this._isSelected(answer);
        this._question.setValue(answer.code, newValue);

        if (newValue && answer.isOther) {
            const otherInput = this._getAnswerOtherNode(answer.code);
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _onModelValueChange(data) {
        super._onModelValueChange(data.changes);

        this._updateAnswerNodes(data.changes);
        this._updateAnswerOtherNodes(data.changes);
    }

    _onAnswerNodeClick(answer) {
        this._toggleAnswer(answer);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if (!Utils.isEmpty(otherValue)) {
            this._question.setValue(answer.code, true);
        }

        this._question.setOtherValue(answer.code, otherValue);
    }
}