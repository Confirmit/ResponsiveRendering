import QuestionWithAnswers from 'api/models/base/question-with-answers.js';
import ValidationTypes from 'api/models/validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';


/**
 * @extends {QuestionWithAnswers}
 */
export default class SingleRatingQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._scaleItems = [];
        this._nonScaleItems = [];
        this._value = null;

        this._loadInitialState(model);
    }

    /**
     * `{<answerCode>: <scaleCode>...}`
     * @type {object}
     * @readonly
     */
    get scaleItems() {
        return this._scaleItems;
    }

    /**
     * Array of Scales without a score.
     * @type {object}
     * @readonly
     */
    get nonScaleItems() {
        return this._nonScaleItems;
    }

    /**
     * Selected answer code.
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * Set value.
     * @param {string} value - Answer code.
     */
    setValue(value) {
        let changed = this._setValue(value);

        if (changed) {
            this._onChange({value: true});
        }
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        const form = {};
        const answer = this.getAnswer(this.value);

        if(answer){
            form[answer.fieldName] = this.value;
        }

        return form;
    }

    _setValue(value) {
        value = Utils.isEmpty(value) ? null : value.toString();
        if (this._value === value) {
            return false;
        }

        if (value !== null) {
            const answer = this.getAnswer(value);
            if (!answer) {
                return false;
            }
        }

        this._value = value;

        return true;
    }

    _loadInitialState({
        scaleItems =[],
        nonScaleItems = [],
        value
    }) {
        this._scaleItems = this.getAnswers(scaleItems);
        this._nonScaleItems = this.getAnswers(nonScaleItems);
        this._value = value;
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
        }
    }

    _validateRequired() {
        if (!this.required)
            return new RuleValidationResult(true);

        let isValid = !Utils.isEmpty(this.value);
        return new RuleValidationResult(isValid);
    }
}
