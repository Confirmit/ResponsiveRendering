import GridQuestionBase from './grid-question-base';

/**
 * @desc Extends QuestionWithAnswers
 * @extends {GridQuestionBase}
 */
export default class GridQuestion extends GridQuestionBase {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        //Features
        this._carousel = model.carousel || false;
        this._dropdown = model.dropdown || false;
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;
    }

    /**
     * Is it carousel.
     * @type {boolean}
     * @readonly
     */
    get carousel() {
        return this._carousel;
    }

    /**
     * Is it dropdown.
     * @type {boolean}
     * @readonly
     */
    get dropdown() {
        return this._dropdown;
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
}