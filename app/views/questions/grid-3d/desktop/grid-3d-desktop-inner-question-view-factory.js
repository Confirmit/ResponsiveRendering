import Grid3DDesktopInnerSingleQuestionView from "./grid-3d-desktop-inner-single-question-view.js";
import Grid3DDesktopInnerSingleAnswerButtonsQuestionView from "./grid-3d-desktop-inner-single-answer-buttons-question-view";
import Grid3DDesktopInnerMultiQuestionView from "./grid-3d-desktop-inner-multi-question-view.js";
import Grid3DDesktopInnerMultiAnswerButtonsQuestionView from "./grid-3d-desktop-inner-multi-answer-buttons-question-view";
import Grid3DDesktopInnerOpenListQuestionView from "./grid-3d-desktop-inner-open-list-question-view.js";
import Grid3DDesktopInnerNumericListQuestionView from "./grid-3d-desktop-inner-numeric-list-question-view.js";
import Grid3DDesktopInnerGridQuestionView from "./grid-3d-desktop-inner-grid-question-view.js";
import Grid3DDesktopInnerDropdownGridQuestionView from "./grid-3d-desktop-inner-dropdown-grid-question-view.js";
import QuestionTypes from 'api/question-types.js';

/**
 * @desc Question view factory
 */
export default class Grid3DDesktopInnerQuestionViewFactory {

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
                    return new Grid3DDesktopInnerSingleAnswerButtonsQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DDesktopInnerSingleQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.Multi:
                if(innerQuestion.answerButtons)
                    return new Grid3DDesktopInnerMultiAnswerButtonsQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DDesktopInnerMultiQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.OpenTextList:
                return new Grid3DDesktopInnerOpenListQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.NumericList:
                return new Grid3DDesktopInnerNumericListQuestionView(this._question, innerQuestion, this._settings);
            case QuestionTypes.Grid:
                if(innerQuestion.dropdown)
                    return new Grid3DDesktopInnerDropdownGridQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DDesktopInnerGridQuestionView(this._question, innerQuestion, this._settings);
            default:
                return;
        }
    }
}