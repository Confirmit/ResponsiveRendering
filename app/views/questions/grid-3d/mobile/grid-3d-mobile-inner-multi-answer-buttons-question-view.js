import Grid3DMobileInnerMultiQuestionView from "./grid-3d-mobile-inner-multi-question-view";

export default class Grid3DMobileInnerMultiAnswerButtonsQuestionView extends Grid3DMobileInnerMultiQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._selectedAnswerCssClass = 'cf-answer-button--selected';
    }

    _getTargetNodeForAnswerError(answerCode){
        return this._getAnswerNode(answerCode);
    }
}