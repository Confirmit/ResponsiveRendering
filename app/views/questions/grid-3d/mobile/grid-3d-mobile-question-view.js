import QuestionViewBase from "views/questions/base/question-view-base";
import ViewFactory from './grid-3d-mobile-inner-question-view-factory';

export default class Grid3DMobileQuestionView extends QuestionViewBase {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        super(question, settings);

        this._viewFactory = new ViewFactory(question, settings);

        this._innerQuestionViews = [];
        this._createInnerQuestions();
    }

    detachModelHandlers() {
        super.detachModelHandlers();

        this._innerQuestionViews.forEach(questionView => {
           questionView.detachModelHandlers();
        });
    }

    _createInnerQuestions() {
        this._question.innerQuestions.forEach(innerQuestion => {
            const view = this._viewFactory.create(innerQuestion);
            if(view !== undefined) {
                this._innerQuestionViews.push(view);
            }
        });
    }
}