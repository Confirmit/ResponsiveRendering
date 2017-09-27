import QuestionFactory from './question-factory.js'
import Event from '../event.js'
import PageValidationResult from './models/validation/page-validation-result.js';

/**
 * @desc Represents the class for page.
 */
export default class Page {
	/**
     * @constructor
     * @param {object} rawQuestionModels - Models of current page questions.
     */
    constructor(rawQuestionModels, surveyInfo) {
        this._questions = this._conversion(rawQuestionModels);
        this._surveyInfo = surveyInfo;
        this._validationEvent = new Event("page:validation");
        this._validationCompleteEvent = new Event("page:validation-complete");

        this._beforeNavigateEvent = new Event('page:before-navigate');
        this._navigateEvent = new Event('page:navigate');
        this._dynamicQuestionTriggerChangedEvent = new Event('page:dynamic question trigger changed');

        this._attach();
    }

    /**
     * Returns survey-level metadata (respondent language, current progress, test mode etc).
     * @type {object}
     * @readonly
     */
    get surveyInfo() {
        return { ...this._surveyInfo };
    }

    /**
     * Fired on page validation. Use to implement custom validation logic.
     * @event validationEvent
     * @type {Event}
     * @memberOf Page
     */
    get validationEvent() {
        return this._validationEvent;
    }

    /**
     * Fired on page validation complete. Use to implement custom error handling.
     * @event validationCompleteEvent
     * @type {Event}
     * @memberOf Page
     */
    get validationCompleteEvent(){
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
     * Models of current page questions.
     * @type {Array}
     * @readonly
     */
    get questions()
    {
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
                form.push({name:name, value:value})
            }));

        return form;
    }

    /**
     * Get question by id
     * @param {string} id - Question id.
     * @return {Question} - Corresponding question object.
     */
    getQuestion(id)
    {
        return this.questions.find(question => question.id === id)
    }

    /**
     * Replace dynamic question.
     * @param {string} questionId - Question id.
     * @param {object} rawModel  - Question model.
     * @param {boolean} isPlaceholder
     * @return {Question} - Question object.
     */
    replaceDynamicQuestion(questionId, rawModel, isPlaceholder) {
        const index = this._questions.indexOf(this.getQuestion(questionId));
        const model = QuestionFactory.create(JSON.parse(rawModel));
        this._questions[index] = model;

        if (!isPlaceholder) {
            this._attachToTriggerQuestion(model);
        }

        return model;
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
        if(raiseValidationCompleteEvent) {
            this._onValidationComplete(validationResult);
        }

        return validationResult;
    }

    /**
     * Get question by id
     * @param {boolean} [validate=true] - Needs to validate.
     */
    next(validate = true) {
        this._beforeNavigateEvent.trigger({ next: true });

        if (validate) {
            const validationResult = this.validate();
            if (validationResult.isValid === false) {
                return;
            }
        }

        this._navigateEvent.trigger({ next: true });
    }

    /**
     * Navigate backward in a survey
     * * @param {boolean} [validate=true] - Needs to validate.
     */
    back(validate = true) {
        this._beforeNavigateEvent.trigger({ next: false });

        if (validate) {
            const validationRuleFilter = (rule) => rule.validateOnBackwardNavigation;
            const validationResult = this.validate(true, validationRuleFilter);
            if (validationResult.isValid === false) {
                return;
            }
        }

        this._navigateEvent.trigger({ next: false });
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

    _conversion(rawModels) {
        let questions = [];
        rawModels.forEach(rawModel => {
            let model = QuestionFactory.create(rawModel);
            if(model) {
                questions.push(model);
            }

        });
        return questions;
    }
}