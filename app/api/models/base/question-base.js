import QuestionValidationResult from './../validation/question-validation-result';
import CustomQuestion from './custom-question';
import Utils from 'utils.js';

/**
 * @desc A base class for Question
 */
export default class QuestionBase {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        this._type = model.nodeType;
        this._id = model.questionId;
        this._title = model.title;
        this._text = model.text;
        this._instruction = model.instruction;
        this._customRendering = model.customRendering;
        this._isRtl = model.isRtl;
        this._customQuestion = Utils.isEmpty(model.customQuestion) ? null : new CustomQuestion(model.customQuestion);
    }

    /**
     * Question type.
     * @type {string}
     * @readonly
     */
    get type() {
        return this._type;
    }

    /**
     * Question id.
     * @type {string}
     * @readonly
     */
    get id() {
        return this._id;
    }

    /**
     * Question title.
     * @type {string}
     * @readonly
     */
    get title() {
        return this._title;
    }

    /**
     * Question text.
     * @type {string}
     * @readonly
     */
    get text() {
        return this._text;
    }

    /**
     * Question instruction.
     * @type {string}
     * @readonly
     */
    get instruction() {
        return this._instruction;
    }

    /**
     * Is default Confirmit rendering disabled?
     * @type {boolean}
     * @readonly
     */
    get customRendering() {
        return this._customRendering;
    }

    // TODO: should move to Question class?
    /**
     * Object with values representing question answer for server.
     * @type {object}
     * @readonly
     */
    get formValues() {
        return {};
    }

    /**
     * Array of triggered questions.
     * @type {Array}
     * @readonly
     */
    get triggeredQuestions() {
        return [];
    }

    /**
     * Is right to left language
     * @type {bool}
     * @readonly
     */
    get isRtl() {
        return this._isRtl;
    }

    /**
     * Custom question settings
     * @type {CustomQuestion}
     * @readonly
     */
    get customQuestion() {
        return this._customQuestion;
    }

    // TODO: should move to Question class?
    /**
     * Perform question validation
     * @param {boolean} [raiseValidationCompleteEvent=true] - Raise validationComplete event if true.
     * @param {function} [validationRuleFilter=null] - Custom filter function to apply specific validation rules only.
     * @return {QuestionValidationResult} - Result of question validation
     */
    // eslint-disable-next-line no-unused-vars
    validate(raiseValidationCompleteEvent = true, validationRuleFilter = null) {
        return new QuestionValidationResult(this._id);
    }
}