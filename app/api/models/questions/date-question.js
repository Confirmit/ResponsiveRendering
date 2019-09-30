import Question from './../base/question.js'
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @typedef {Object} CultureInfo
 * @property {string} dateFormat Required format, e.g. "M/d/yyyy".
 * @property {string[]} Names of months in current respondent language.
 * @property {string} name Culture name, e.g. "en-US".
 */

/**
 * @desc Date question model.
 * @extends {Question}
 */
export default class DateQuestion extends Question {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._minValue = model.minValue;
        this._culture = model.culture;

        this._value = model.value || null;
    }

    /**
     * String representation in iso-8601 format, e.g. 2017-07-25.
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * String representation of the smallest possible value.
     * @type {string}
     * @readonly
     */
    get minValue(){
        return this._minValue;
    }

    /**
     * Information about date question culture.
     * @type {CultureInfo}
     * @readonly
     */
    get culture(){
        return { ...this._culture };
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
     * Set value of date.
     * @param {string} value - Date value.
     * @example model.setValue('2017-12-31');
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
        if(this._value === value) {
            return false;
        }

        this._value = value;
        return true;
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.Date:
                return this._validateDate();
        }
    }

    _validateRequired(){
        if (!this.required)
            return new RuleValidationResult(true);

        let isValid = !Utils.isEmpty(this.value);
        return new RuleValidationResult(isValid)
    }

    _validateDate() {
        if (Utils.isEmpty(this.value)) {
            return new RuleValidationResult(true);
        }

        if (!Utils.isDate(this.value)) {
            return new RuleValidationResult(false);
        }

        if (!Utils.isDate(this.minValue)) {
            return new RuleValidationResult(true);
        }

        let isValid = new Date(this.value) >= new Date(this.minValue);
        return new RuleValidationResult(isValid);
    }
}
