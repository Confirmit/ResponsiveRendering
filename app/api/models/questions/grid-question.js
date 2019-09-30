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
        this._answerButtons = model.answerButtons || false;
        this._accordion = model.accordion || false;
        this._carousel = model.carousel || false;
        this._dropdown = model.dropdown || false;
        this._slider = model.slider || false;
        this._sliderIsVertical = model.sliderIsVertical || false;
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;
        this._answersHaveRightText = model.answersHaveRightText || false;
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
     * Is it accordion.
     * @type {boolean}
     * @readonly
     */
    get accordion() {
        return this._accordion;
    }

    /**
     * Is it slider.
     * @type {boolean}
     * @readonly
     */
    get slider() {
        return this._slider;
    }

    /**
     * Is slider vertical.
     * @type {boolean}
     * @readonly
     */
    get sliderIsVertical() {
        return this._sliderIsVertical;
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
     * Has right answer texts
     * @type {boolean}
     * @readonly
     */
    get answersHaveRightText() {
        return this._answersHaveRightText;
    }

    /**
     * Is it answer buttons
     * @type {boolean}
     * @readonly
     */
    get answerButtons() {
        return this._answerButtons;
    }
}