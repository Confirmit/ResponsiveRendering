import Question from './../base/question.js'
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {Question}
 */
export default class OpenTextQuestion extends Question {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._loadInitialState(model);
        this._parseFeatures(model);
    }

    /**
     * Open text value.
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * Value max length.
     * @type {number}
     * @readonly
     */
    get maxLength() {
        return this._maxLength;
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        let form = {};
        if(!Utils.isEmpty(this.value)){
            form[this.id] = this.value;
        }

        return form;
    }

    /**
     * Set answer value.
     * @param {string} answerValue - Answer value.
     */
    setValue(answerValue) {
        let valueToSet = Utils.isEmpty(answerValue) ? null : answerValue.toString();
        if (this._value !== valueToSet) {
            this._value = valueToSet;
            this._onChange({value: true});
        }
    }

    _loadInitialState({ value }) {
        this._value = value;
    }

    _parseFeatures({ maxLength }){
        this._maxLength = maxLength;
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.MaxLength:
                return this._validateMaxLength();
        }
    }

    _validateRequired(){
        if (!this.required)
            return new RuleValidationResult(true);

        let isValid = !Utils.isEmpty(this.value);
        return new RuleValidationResult(isValid)
    }

    _validateMaxLength() {
        if (Utils.isEmpty(this.maxLength) || Utils.isEmpty(this.value)) {
            return new RuleValidationResult(true);
        }

        const isValid = this.value.length <= this.maxLength;
        return new RuleValidationResult(isValid);
    }
}

