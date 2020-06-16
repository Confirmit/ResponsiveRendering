import QuestionFactory from 'api/question-factory.js'
import PageValidationResult from 'api/models/validation/page-validation-result.js';
import SurveyInfo from './survey-info.js';
import Event from 'event.js'
import TestNavigator from './test-navigator'
import QuestionTypes from 'api/question-types.js';
import ServerVariables from './server-variables';

/**
 * @desc Represents the class for page.
 */
export default class Page {
    /**
     * @constructor
     * @param {object[]} rawQuestionModels - Models of current page questions.
     * @param {object} rawSurveyInfo - Survey level information.
     */
    constructor(rawQuestionModels, rawSurveyInfo) {
        this._surveyInfo = new SurveyInfo(rawSurveyInfo);
        this._questionFactory = new QuestionFactory(rawSurveyInfo.language, rawSurveyInfo.endpoints, rawSurveyInfo.isAccessible);
        this._questions = this._createQuestions(rawQuestionModels);

        this._validationEvent = new Event("page:validation");
        this._validationCompleteEvent = new Event("page:validation-complete");
        this._beforeNavigateEvent = new Event('page:before-navigate');
        this._navigateEvent = new Event('page:navigate');
        this._dynamicQuestionTriggerChangedEvent = new Event('page:dynamic question trigger changed');
        this._dynamicQuestionsChangeCompleteEvent = new Event('page:dynamic question change complete');

        this._testNavigator = (rawSurveyInfo.testNavigator !== null && rawSurveyInfo.testNavigator !== undefined) ? new TestNavigator(rawSurveyInfo.testNavigator) : null;
        this._serverVariables = new ServerVariables();

        this._attach();
    }

    /**
     * Test navigator model.
     * @type {TestNavigator}
     * @readonly
     * */
    get testNavigator() {
        return this._testNavigator;
    }

    /**
     * server variables collection.
     * @type {ServerVariables}
     * @readonly
     * */
    get serverVariables(){
        return this._serverVariables;
    }

    /**
     * Survey level metadata.
     * @type {SurveyInfo}
     * @readonly
     */
    get surveyInfo() {
        return this._surveyInfo;
    }

    /**
     * Fired on page validation; Use to implement custom validation logic.
     * @event validationEvent
     * @type {Event}
     * @memberOf Page
     */
    get validationEvent() {
        return this._validationEvent;
    }

    /**
     * Fired on page validation complete; Use to implement custom error handling.
     * @event validationCompleteEvent
     * @type {Event}
     * @memberOf Page
     */
    get validationCompleteEvent() {
        return this._validationCompleteEvent;
    }

    /**
     * Fired before navigation.
     * @event beforeNavigateEvent
     * @type {Event}
     * @memberOf Page
     */
    get beforeNavigateEvent() {
        return this._beforeNavigateEvent;
    }

    /**
     * Fired on navigation.
     * @event navigateEvent
     * @type {Event}
     * @memberOf Page
     */
    get navigateEvent() {
        return this._navigateEvent;
    }

    /**
     * Fired on dynamic question trigger changed.
     * @event dynamicQuestionTriggerChangedEvent
     * @type {Event}
     * @memberOf Page
     */
    get dynamicQuestionTriggerChangedEvent() {
        return this._dynamicQuestionTriggerChangedEvent;
    }

    /**
     * Fired after dynamic question trigger fire and dynamic questions are changed.
     * @event dynamicQuestionTriggerChangedEvent
     * @type {Event}
     * @memberOf Page
     */
    get dynamicQuestionsChangeCompleteEvent() {
        return this._dynamicQuestionsChangeCompleteEvent;
    }

    /**
     * Models of current page questions.
     * @type {Array}
     * @readonly
     */
    get questions() {
        return this._questions;
    }

    /**
     * Object with values representing question answer for server.
     * @type {object}
     * @readonly
     */
    get formValues() {
        let form = [];
        this._questions.forEach(question =>
            Object.entries(question.formValues).forEach(([name, value]) => {
                form.push({name: name, value: value})
            }));

        return form;
    }

    /**
     * Get question by id
     * @param {string} id - Question id.
     * @return {Question} - Corresponding question object.
     */
    getQuestion(id) {
        return this.questions.find(question => question.id === id)
    }

    /**
     * Replace dynamic questions.
     * @param {object[]} rawQuestionModels - Updated question models.
     */
    replaceDynamicQuestions(rawQuestionModels) {
        const models = rawQuestionModels.map(rawModel => this._questionFactory.create(rawModel));
        models.forEach(model => {
            const index = this._questions.indexOf(this.getQuestion(model.id));
            this._questions[index] = model;

            if (model.type !== QuestionTypes.DynamicQuestionPlaceholder) {
                this._attachToTriggerQuestion(model);
            }
        });

        this._dynamicQuestionsChangeCompleteEvent.trigger(models);
        return models;
    }

    /**
     * Execute validation
     * @param {boolean} [raiseValidationCompleteEvent=true] - Raise error if true.
     * @param {function} [validationRuleFilter=null] - Custom filter function to apply specific validation rules only.
     * @return {PageValidationResult} - Page validation result.
     */
    validate(raiseValidationCompleteEvent = true, validationRuleFilter = null) {
        let validationResult = new PageValidationResult();
        this._questions.forEach(question => {
            validationResult.questionValidationResults.push(question.validate(raiseValidationCompleteEvent, validationRuleFilter));
        });

        this._onValidation(validationResult);
        if (raiseValidationCompleteEvent) {
            this._onValidationComplete(validationResult);
        }

        return validationResult;
    }

    /**
     * Navigate forward in a survey
     * @param {boolean} [validate=true] - Needs to validate.
     */
    next(validate = true) {
        if (!this._surveyInfo.allowNextNavigation)
            return;

        this._beforeNavigateEvent.trigger({next: true});

        if (validate) {
            const validationResult = this.validate();
            if (validationResult.isValid === false) {
                return;
            }
        }

        this._navigateEvent.trigger({next: true});
    }

    /**
     * Navigate backward in a survey
     * * @param {boolean} [validate=true] - Needs to validate.
     */
    back(validate = true) {
        if (!this._surveyInfo.allowBackNavigation)
            return;

        this._beforeNavigateEvent.trigger({next: false});

        if (validate) {
            const validationRuleFilter = (rule) => rule.validateOnBackwardNavigation;
            const validationResult = this.validate(true, validationRuleFilter);
            if (validationResult.isValid === false) {
                return;
            }
        }

        this._navigateEvent.trigger({next: false});
    }

    /**
     * Change language on the next page
     * * @param {int} [languageCode=''] - language code.
     */
    changeLanguageOnTheNextPage(languageCode = ''){
        this._serverVariables.edit('l', languageCode);
    }

    /**
     * Forward to the last interview question for cati and capi.
     */
    fastForward(){
        if(this._surveyInfo.surveyChannel !== 'cati' && this._surveyInfo.surveyChannel !== 'capi'){
            // eslint-disable-next-line no-console
            console.warn('Confirmit: this method forbidden for current survey channel');
            return;
        }
        this._serverVariables.add('__fafwd');

        this.next(false);
    }

    _attach() {
        this._questions.forEach(question => this._attachToTriggerQuestion(question));
    }

    _attachToTriggerQuestion(question) {
        if (question.triggeredQuestions.length > 0) {
            question.changeEvent.on(() => this._dynamicQuestionTriggerChangedEvent.trigger(question));
        }
    }

    _onValidation(validationResult) {
        this._validationEvent.trigger(validationResult);
    }

    _onValidationComplete(validationResult) {
        this._validationCompleteEvent.trigger(validationResult);
    }

    _createQuestions(rawModels) {
        const questions = [];
        rawModels.forEach(rawModel => {
            const model = this._questionFactory.create(rawModel);
            if (model) {
                questions.push(model);
            }

        });
        return questions;
    }
}