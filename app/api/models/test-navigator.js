import TestNavigatorQuestion from './test-navigator-question';

/**
 * @desc Test navigator model.
 */
export default class TestNavigator {
    constructor(model) {
        this._questions = model.questions.map(question => new TestNavigatorQuestion(question));
        this._currentQuestionId =  model.currentQuestionId;
    }

    /**
     * Models of test navigator questions.
     * @type {TestNavigatorQuestion[]}
     * @readonly
     */
    get questions() {
        return this._questions;
    }

    /**
     * Model current question id.
     * @type {string}
     * @readonly
     */
    get currentQuestionId() {
        return this._currentQuestionId;
    }
}
