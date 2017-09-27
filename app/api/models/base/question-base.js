import QuestionValidationResult from "./../validation/question-validation-result";

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
    get customRendering(){
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

    // TODO: should move to Question class?
    /**
     * Perform question validation
     * @return {QuestionValidationResult} - Result of question validation
     */
    validate() {
        return new QuestionValidationResult(this._id);
    }

    /**
     * Array of triggered questions.
     * @type {Array}
     * @readonly
     */
    get triggeredQuestions() {
        return [];
    }
}
