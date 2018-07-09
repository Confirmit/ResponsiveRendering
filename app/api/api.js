import Page from './models/page.js';
import PageView from './../views/page-view.js'
import PageViewProxy from '../views/page-view-proxy';
import DynamicQuestionsManager from "./dynamic-questions-manager";
import DynamicQuestionsTransport from "./dynamic-questions-transport";

/**
 * @desc Root api object.
 */
export default class cfApi {
    /**
     * Create instance.
     * @param {object} rawModels.
     * @param {object} surveyInfo.
     */
    constructor(rawModels, surveyInfo) {
        this._debug = false;
        this._page = new Page(rawModels, surveyInfo);
        this._pageView = new PageView(this._page);
        this._pageViewProxy = new PageViewProxy(this._pageView);

        const transport = new DynamicQuestionsTransport();
        this._dynamicQuestionsManager = new DynamicQuestionsManager(this._page, this._pageView, transport);
    }

    /**
     * Contains current survey page object model.
     * @type {Page}
     * @readonly
     */
    get page() {
        return this._page;
    }

    /**
     * Handles custom view injection.
     * @type {object}
     * @readonly
     */
    get pageView() {
        return this._pageViewProxy;
    }

    /**
     * Get debug state.
     * @type {boolean}
     */
    get debug() {
        return this._debug;
    }

    /**
     * Set debug state.
     * @type {boolean}
     */
    set debug(value) {
        value = !!value;
        if(this._debug === value) {
            return;
        }

        this._debug = value;

        this._page.questions.filter(question => question.changeEvent !== undefined).forEach(question => {
            if(this._debug) {
                question.changeEvent.on(this._onQuestionChangeDebugHandler);
            } else {
                question.changeEvent.off(this._onQuestionChangeDebugHandler)
            }
        });
    }

    _onQuestionChangeDebugHandler({model}) {
        if(model.value !== undefined) {
            // eslint-disable-next-line no-console
            console.log(`Q(${model.id}) value: ${model.value}; other: ${model.otherValue}`);
        } else if  (model.values !== undefined) {
            const values = Object.keys(model.values).map(key => `${key}:${model.values[key]}`);
            const otherValues = Object.entries(model.otherValues).map(([key, value]) => `${key}:${value}`);
            // eslint-disable-next-line no-console
            console.log(`Q(${model.id}) values:[${values}]; others:[${otherValues}];`);
        } else if(model.innerQuestions !== undefined) {
            model.innerQuestions.forEach(question => {
                const innerValues = Object.entries(question.values).map(([key, value]) => `${key}:${value}`);
                // eslint-disable-next-line no-console
                console.log(`Q(${model.id}) inner(${question.id} values: [${innerValues}]`);
            });
            const otherValues = Object.entries(model.otherValues).map(([key, value]) => `${key}:${value}`);
            // eslint-disable-next-line no-console
            console.log(`Q(${model.id}) others:[${otherValues}];`);
        } else {
            // eslint-disable-next-line no-console
            console.log("Q(${model.id}): undefined question type is changed.");
        }

    }
}