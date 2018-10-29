import Grid3DDesktopInnerSingleQuestionView from "./grid-3d-desktop-inner-single-question-view.js";
import Grid3DDesktopInnerMultiQuestionView from "./grid-3d-desktop-inner-multi-question-view.js";
import Grid3DDesktopInnerOpenListQuestionView from "./grid-3d-desktop-inner-open-list-question-view.js";
import Grid3DDesktopInnerNumericListQuestionView from "./grid-3d-desktop-inner-numeric-list-question-view.js";
import Grid3DDesktopInnerGridQuestionView from "./grid-3d-desktop-inner-grid-question-view.js";
import Grid3DDesktopInnerDropdownGridQuestionView from "./grid-3d-desktop-inner-dropdown-grid-question-view.js";

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
            case 'Single':
                return new Grid3DDesktopInnerSingleQuestionView(this._question, innerQuestion, this._settings);
            case 'Multi':
                return new Grid3DDesktopInnerMultiQuestionView(this._question, innerQuestion, this._settings);
            case 'OpenTextList':
                return new Grid3DDesktopInnerOpenListQuestionView(this._question, innerQuestion, this._settings);
            case 'NumericList':
                return new Grid3DDesktopInnerNumericListQuestionView(this._question, innerQuestion, this._settings);
            case 'Grid':
                if(innerQuestion.dropdown)
                    return new Grid3DDesktopInnerDropdownGridQuestionView(this._question, innerQuestion, this._settings);
                return new Grid3DDesktopInnerGridQuestionView(this._question, innerQuestion, this._settings);
            default:
                return;
        }
    }
}