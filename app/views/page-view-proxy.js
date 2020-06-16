import QuestionViewTypes from './question-view-types';

export default class PageViewProxy {
    /**
     * @param {PageView} pageView - page view.
     */
    constructor(pageView) {
        this._pageView = pageView;
    }

    get questionViewTypes() {
        return QuestionViewTypes;
    }

    get questionViewFactory() {
        return this._pageView.questionViewFactory;
    }

    set questionViewFactory(questionViewFactory) {
        this._pageView.questionViewFactory = questionViewFactory;
    }

    get initCompleteEvent() {
        return this._pageView.initCompleteEvent;
    }

    /**
     * Register custom question.
     * @param {string} customQuestionGuid - Custom question guid.
     * @param {function(question: QuestionBase, customQuestionSettings: object, questionViewSettings: QuestionViewSettings): QuestionViewBase} createViewFn - view creation function.
     */
    registerCustomQuestion(customQuestionGuid, createViewFn) {
        this._pageView.registerCustomQuestion(customQuestionGuid, createViewFn);
    }

    /**
     * Register custom view.
     * @param {string} questionId - Question model id.
     * @param {function(question: QuestionBase, questionViewSettings: QuestionViewSettings): QuestionViewBase} createViewFn - view creation function.
     */
    registerCustomQuestionView(questionId, createViewFn) {
        this._pageView.registerCustomQuestionView(questionId, createViewFn);
    }

    init() {
        this._pageView.init();
    }
}