import QuestionViewBase from "../../base/question-view-base";
import $ from "jquery";

export default class Grid3DDesktopInnerQuestionView extends QuestionViewBase {
    constructor(parentQuestion, question, settings = null) {
        super(question, settings);
        this._parentQuestion = parentQuestion;

        this._parentContainer = $(`#${parentQuestion.id}`);
        this._container = this._parentContainer.find(`.cf-grid-3d__desktop`);
    }

    _getAnswerNode(answerCode) {
        return $(`#desktop_${this._question.id}_${answerCode}`);
    }

    _getAnswerInputNode(answerCode) {
        return $(`#desktop_${this._question.id}_${answerCode}_input`);
    }

    _getAnswerTextNode(answerCode) {
        return $(`#desktop_${this._parentQuestion.id}_${answerCode}_text`);
    }

    _getAnswerOtherNode(answerCode) {
        return $(`#desktop_${this._question.id}_${answerCode}_other`);
    }

    _getScaleNode(answerCode, scaleCode) {
        return $(`#desktop_${this._question.id}_${answerCode}_${scaleCode}`);
    }
}