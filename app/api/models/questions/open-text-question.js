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

        this._maxLength = model.maxLength;

        this._value = model.value || null;
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
     * @param {string} value - Answer text value.
     */
    setValue(value) {
        this._setValueInternal(
            'value',
            () => this._setValue(value),
            this._diffPrimitives,
        );
    }

    _setValue(value) {
        value = Utils.isEmpty(value) ? null : value.toString();
        if (this._value === value) {
            return false;
        }

        this._value = value;
        return true;
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

