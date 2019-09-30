import Grid3DDesktopInnerMultiQuestionView from "./grid-3d-desktop-inner-multi-question-view";
import Utils from "../../../../utils";

export default class Grid3DDesktopInnerMultiAnswerButtonsQuestionView extends Grid3DDesktopInnerMultiQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._selectedAnswerCssClass = 'cf-answer-button--selected';
        this._parentQuestion.changeEvent.on(({changes}) => this._onParentQuestionChange(changes));
    }

    _onParentQuestionChange({otherValues = []}) {
        otherValues.forEach(answerCode => {
            const otherValue = this._parentQuestion.otherValues[answerCode];
            this._getAnswerNode(answerCode).text(Utils.isEmpty(otherValue) ? this._question.getAnswer(answerCode).text : otherValue);
        })
    }
}