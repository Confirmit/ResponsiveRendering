import MultiQuestionBase from './multi-question-base.js';

/**
 * @extends {MultiQuestionBase}
 */
export default class MultiQuestion extends MultiQuestionBase {
    /**
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._defaultValue = model.defaultValue;
        this._refusedValue = model.refusedValue;
        this._answerButtons = model.answerButtons || false;
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;
    }

    /**
     * Use buttons for answers.
     * @type {boolean}
     * @readonly
     */
    get answerButtons() {
        return this._answerButtons;
    }

    /**
     * Number of columns for answers placement.
     * @type {number}
     * @readonly
     */
    get layoutColumns() {
        return this._layoutColumns;
    }

    /**
     * Number of rows for answers placement.
     * @type {number}
     * @readonly
     */
    get layoutRows() {
        return this._layoutRows;
    }

    /**
     * The default answer code applied to a question.
     * CATI or CAPI interviewer can use the Default button or keyboard shortcut to select the default answer.
     * @type {string}
     * @readonly
     */
    get defaultValue() {
        return this._defaultValue;
    }

    /**
     * The default answer code applied to a question.
     * CATI or CAPI interviewer can use the Default button or keyboard shortcut to select the default answer.
     * @type {string}
     * @readonly
     */
    get refusedValue() {
        return this._refusedValue;
    }
}