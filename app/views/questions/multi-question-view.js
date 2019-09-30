import MultiQuestionViewBase from './multi-question-view-base';

export default class MultiQuestionView extends MultiQuestionViewBase {
    /**
     * @param {MultiQuestion} question
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
        return this._question.values;
    }

    /**
     * @param {Answer} answer
     * @protected
     * @override
     */
    _selectAnswer(answer) {
        this._question.setValue(answer.code, true);
    }

    /**
     * @param {Answer} answer
     * @protected
     * @override
     */
    _unselectAnswer(answer) {
        this._question.setValue(answer.code, false);
    }
}