import Grid3DMobileInnerSingleQuestionView from "./grid-3d-mobile-inner-single-question-view.js";
import Grid3DMobileInnerSingleAnswerButtonsQuestionView from "./grid-3d-mobile-inner-single-answer-buttons-question-view";
import Grid3DMobileInnerMultiQuestionView from "./grid-3d-mobile-inner-multi-question-view.js";
import Grid3DMobileInnerMultiAnswerButtonsQuestionView from "./grid-3d-mobile-inner-multi-answer-buttons-question-view";
import Grid3DMobileInnerOpenListQuestionView from "./grid-3d-mobile-inner-open-list-question-view";
import Grid3DMobileInnerNumericListQuestionView from "./grid-3d-mobile-inner-numeric-list-question-view";
import Grid3DMobileInnerGridQuestionView from "./grid-3d-mobile-inner-grid-question-view";
import Grid3DMobileInnerDropdownGridQuestionView from "./grid-3d-mobile-inner-dropdown-grid-question-view";
import QuestionTypes from 'api/question-types.js';

/**
 * @desc Question view factory
 */
export default class Grid3DMobileInnerQuestionViewFactory {

    constructor(question, settings) {
        this._question = question;
        this._settings = settings;
    }

    /**
     * Create question view.
     * @param {object} innerQuestion Question model.
     * @returns {object|undefined} Question view.
     */
    create(innerQuestion) {
        switch (innerQuestion.type) {
            case QuestionTypes.Single:
                if(innerQuestion.answerButtons)
                    return new Grid3DMobileInnerSingleAnswerButtonsQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DMobileInnerSingleQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.Multi:
                if(innerQuestion.answerButtons)
                    return new Grid3DMobileInnerMultiAnswerButtonsQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DMobileInnerMultiQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.OpenTextList:
                return new Grid3DMobileInnerOpenListQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.NumericList:
                return new Grid3DMobileInnerNumericListQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.Grid:
                if(innerQuestion.dropdown)
                    return new Grid3DMobileInnerDropdownGridQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DMobileInnerGridQuestionView(this._question, innerQuestion, this._settings);
            default:
                return;
        }
    }
}