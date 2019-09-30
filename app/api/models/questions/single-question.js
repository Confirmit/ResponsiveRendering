import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {QuestionWithAnswers}
 */
export default class SingleQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._defaultValue = model.defaultValue;
        this._refusedValue = model.refusedValue;
        this._answerButtons = model.answerButtons || false;
        this._slider = model.slider || false;
        this._sliderIsVertical = model.sliderIsVertical || false;
        this._dropdown = model.dropdown || false;
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;

        this._value = model.value || null;
        this._otherValues = { ...model.otherValues };
    }

    /**
     * Is it answer buttons.
     * @type {boolean}
     * @readonly
     */
    get answerButtons() {
        return this._answerButtons;
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

    /**
     * Selected value.
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * Other value.
     * @type {?string}
     * @readonly
     */
    get otherValue() {
        if (Utils.isEmpty(this._value))
            return null;

        return this._otherValues[this._value] || null;
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

    /**
     * @inheritDoc
     */
    get formValues(){
        let form = {};

        let answer = this.getAnswer(this.value);
        if(answer){
            form[answer.fieldName] = this.value;
            if(answer.isOther){
                form[answer.otherFieldName] = this.otherValue;
            }
        }

        return form;
    }

    /**
     * Answer code, optional other value.
     * @param {string} value - Answer code.
     */
    setValue(value) {
        this._setValueInternal(
            'value',
            () => this._setValue(value),
            this._diffPrimitives,
        );
    }

    /**
     * Set other answer value.
     * @param {string} otherValue - other value.
     */
    setOtherValue(otherValue) {
        this._setValueInternal(
            'otherValue',
            () => this._setOtherValue(this._value, otherValue),
            this._diffPrimitives,
        );
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

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.OtherRequired:
                return this._validateOther(); 
            case ValidationTypes.RequiredIfOtherSpecified:
                return this._validateRequiredIfOtherSpecified();
        }
    }

    _validateRequired() {
        if (!this.required)
            return new RuleValidationResult(true);

        let isValid = !Utils.isEmpty(this.value);
        return new RuleValidationResult(isValid);
    }

    _validateOther(){
        if (Utils.isEmpty(this.value))
            return new RuleValidationResult(true);

        let answer = this.getAnswer(this.value);
        let isValid = !answer.isOther || !Utils.isEmpty(this.otherValue);
        return new RuleValidationResult(isValid, [this.value]);
    }
    
    _validateRequiredIfOtherSpecified(){
        if(!Utils.isEmpty(this.value))
            return new RuleValidationResult(true);
        
        let invalidAnswers = Object.keys(this._otherValues);

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }
}