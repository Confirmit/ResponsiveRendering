import GridQuestionBase from './grid-question-base';

/**
 * @extends {GridQuestionBase}
 */
export default class GridRatingQuestion extends GridQuestionBase {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._scaleItems = [];
        this._nonScaleItems = [];

        this._loadScales(model);
    }

    /**
     * `{<answerCode>: <scaleCode>...}`
     * @type {object}
     * @readonly
     */
    get scaleItems() {
        return [ ...this._scaleItems ];
    }

    /**
     * Array of Scales without a score.
     * @type {Scale[]}
     * @readonly
     */
    get nonScaleItems() {
        return [ ...this._nonScaleItems ];
    }

    _loadScales({ scaleItems = [], nonScaleItems = [] }) {
        this._scaleItems = this.getScales(scaleItems);
        this._nonScaleItems = this.getScales(nonScaleItems);
    }
}
