import MultiQuestionViewBase from './multi-question-view-base';
import Utils from './../../utils';

export default class CaptureOrderMultiQuestionView extends MultiQuestionViewBase {
    /**
     * @param {RankingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);
    }

    /**
     * @type {Array} list of selected answer codes
     * @protected
     * @override
     */
    _getSelectedAnswerCodes() {
        return Object.keys(this._question.values);
    }

    /**
     * @param {Answer} answer
     * @protected
     * @override
     */
    _selectAnswer(answer) {
        const maxValue = this._getSelectedAnswerCodes().length;
        this._question.setValue(answer.code, maxValue + 1);

        if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
            this._getAnswerOtherNode(answer.code).focus();
        }
    }

    /**
     * @param {Answer} answer
     * @protected
     * @override
     */
    _unselectAnswer(answer) {
        const unselectedAnswerValue = this._question.values[answer.code];

        this._question.setValue(answer.code, null);
        Object.entries(this._question.values).forEach(([code, value]) => {
            if (value > unselectedAnswerValue) {
                this._question.setValue(code, value - 1);
            }
        });
    }
}