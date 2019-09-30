import Grid3DMobileInnerSingleQuestionView from "./grid-3d-mobile-inner-single-question-view";

export default class Grid3DMobileInnerSingleAnswerButtonsQuestionView extends Grid3DMobileInnerSingleQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._selectedAnswerCssClass = 'cf-answer-button--selected';
    }

    _getTargetNodeForAnswerError(answerCode){
        return this._getAnswerNode(answerCode);
    }
}