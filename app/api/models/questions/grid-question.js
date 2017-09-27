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
}