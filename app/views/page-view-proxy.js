import QuestionViewTypes from './question-view-types';

export default class PageViewProxy {
    constructor(pageView) {
        this._pageView = pageView;
    }

    get questionViewTypes(){
        return QuestionViewTypes;
    }

    get questionViewFactory(){
        return this._pageView.questionViewFactory;
    }

    set questionViewFactory(questionViewFactory) {
        this._pageView.questionViewFactory = questionViewFactory;
    }

    get initCompleteEvent(){
        return this._pageView.initCompleteEvent;
    }

    registerCustomQuestionView (questionId, createViewFn) {
        this._pageView.registerCustomQuestionView(questionId, createViewFn);
    }

    init() {
        this._pageView.init();
    }
}