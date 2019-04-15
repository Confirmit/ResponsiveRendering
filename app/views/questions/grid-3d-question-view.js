import QuestionView from './base/question-view.js';
import Grid3DDesktopQuestionView from './grid-3d/desktop/grid-3d-desktop-question-view.js';
import Grid3DMobileQuestionView from './grid-3d/mobile/grid-3d-mobile-question-view.js';

// TODO: aggregate pending event when needed.
export default class Grid3DQuestionView extends QuestionView {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._mobileView = new Grid3DMobileQuestionView(question, settings);
        this._desktopView = new Grid3DDesktopQuestionView(question, settings);
    }

    detachModelHandlers() {
        this._mobileView.detachModelHandlers();
        this._desktopView.detachModelHandlers();
    }

    _showErrors() {
        this._addQuestionErrorModifier();
    }

    _hideErrors() {
        this._removeQuestionErrorModifier();
    }
}