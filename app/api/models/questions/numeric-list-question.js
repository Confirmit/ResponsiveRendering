import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {QuestionWithAnswers}
 */
export default class NumericListQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._numeric = { ...model.numeric };
        this._multiCount = { ...model.multiCount };
        this._multiSum = { ...model.multiSum };
        this._autoSum = model.autoSum || false;
        this._autoSumTotalLabel = model.autoSumTotalLabel || '';
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;

        this._values = {};

        this._loadInitialState(model);
    }

    /**
     * `{<answerCode>: <value>}`
     * @type {object}
     * @readonly
     */
    get values() {
        return { ...this._values };
    }

    /**
     * `{<answerCode>: <otherValue>}`
     * @type {object}
     * @readonly
     */
    get otherValues() {
        return { ...this._otherValues };
    }

    /**
     * `{max:value, min:value, precision:value, scale:value}`
     * @type {object}
     * @readonly
     */
    get numeric() {
        return this._numeric;
    }

    /**
     * `{equal:value, max:value, min:value}`
     * @type {object}
     * @readonly
     */
    get multiCount() {
        return this._multiCount;
    }

    /**
     * `{equal:value, max:value, min:value}`
     * @type {object}
     * @readonly
     */
    get multiSum() {
        return this._multiSum;
    }

    /**
     * Is auto sum enabled.
     * @type {bool}
     * @readonly
     */
    get autoSum() {
        return this._autoSum;
    }

    /**
     * Label of auto sum total value.
     * @type {string}
     * @readonly
     */
    get autoSumTotalLabel() {
        return this._autoSumTotalLabel;
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
     * @inheritDoc
     */
    get formValues(){
        let form = {};

        Object.entries(this.values).forEach(([answerCode, answerValue]) => {
            let answer = this.getAnswer(answerCode);
            if(answer){
                form[answer.fieldName] = answerValue;
                if(answer.isOther){
                    form[answer.otherFieldName] = this.otherValues[answerCode];
                }
            }
        });

        return form;
    }

    /**
     * Select answer for numericlist.
     * @param {string} answerCode - Answer code.
     * @param {numeric|string} answerValue - Answer value.
     */
    setValue(answerCode, answerValue) {
        const old = { ...this._values };

        const changed = this._setValue(answerCode, answerValue);
        if (changed){
            this._onChange({values: this._diff(old, this._values)});
        }
    }

    /**
     * Set other answer value.
     * @param {string} answerCode - Answer code.
     * @param {string} otherValue -Other value.
     */
    setOtherValue(answerCode, otherValue) {
        const old = { ...this._otherValues };

        const changed = this._setOtherValue(answerCode, otherValue);
        if(changed) {
            this._onChange({otherValues: this._diff(old, this._otherValues)});
        }
    }

    _setValue(answerCode, answerValue) {
        answerCode = answerCode.toString();
        answerValue = Utils.isEmpty(answerValue) ? null : answerValue.toString();

        const answer = this.getAnswer(answerCode);
        if (!answer) {
            return false;
        }

        if(this._values[answerCode] === answerValue) {
            return false;
        }

        if(answerValue === null) {
            delete this._values[answerCode];
        } else {
            this._values[answerCode] = answerValue;
        }

        return true;
    }

    _loadInitialState({values = {}, otherValues= {}})
    {
        this._values = { ... values };
        this._otherValues = { ...otherValues };
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.OtherRequired:
                return this._validateOther();
            case ValidationTypes.Numeric:
                return this._validateNumeric();
            case ValidationTypes.Precision:
                return this._validatePrecision();
            case ValidationTypes.Scale:
                return this._validateScale();
            case ValidationTypes.Range:
                return this._validateRange();
            case ValidationTypes.MultiCount:
                return this._validateMultiCount();
            case ValidationTypes.MultiSum:
                return this._validateMultiSum();
            case ValidationTypes.RequiredIfOtherSpecified:
                return this._validateRequiredIfOtherSpecified();
        }
    }

    _validateRequired() {
        if (!this.required)
            return new RuleValidationResult(true);

        // for list-type questions 'required' means 'all required',
        // so if there is multi count we should bypass and let multi count validation make a decision
        let {equal, min, max} = this.multiCount;
        if (!Utils.isEmpty(equal) || !Utils.isEmpty(min) || !Utils.isEmpty(max))
            return new RuleValidationResult(true);

        let invalidAnswers = [];

        this.answers.forEach(answer => {
            let isNormalAnswer = !answer.isOther;
            let isEmpty = Utils.isEmpty(this.values[answer.code]);

            if (isNormalAnswer && isEmpty)
                invalidAnswers.push(answer.code);
        });

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validateOther() {
        let invalidAnswers = [];

        this.answers.forEach(answer => {
            let isOtherAnswer = answer.isOther;
            let isNotEmpty = !Utils.isEmpty(this.values[answer.code]);
            let otherIsEmpty = Utils.isEmpty(this.otherValues[answer.code]);

            if (isOtherAnswer && isNotEmpty && otherIsEmpty)
                invalidAnswers.push(answer.code);
        });

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validateNumeric(){
        let invalidAnswers = [];
        for(let[code, value] of Object.entries(this.values)) {
            if(Utils.isEmpty(value))
                continue;

            if (Utils.isNotANumber(value))
                invalidAnswers.push(code);
        }

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validatePrecision() {
        let { precision } = this.numeric;
        if (Utils.isEmpty(precision))
            return new RuleValidationResult(true);

        let invalidAnswers = [];
        for(let[code, value] of Object.entries(this.values)) {
            if(Utils.isEmpty(value))
                continue;
            if(Utils.isNotANumber(value))
                continue;

            let {totalDigits} = Utils.measureNumber(value);
            if(totalDigits > precision)
                invalidAnswers.push(code);
        }

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validateScale() {
        let { scale } = this.numeric;
        if (Utils.isEmpty(scale))
            return new RuleValidationResult(true);

        let invalidAnswers = [];
        for(let[code, value] of Object.entries(this.values)) {
            if(Utils.isEmpty(value))
                continue;
            if(Utils.isNotANumber(value))
                continue;

            let {decimalDigits} = Utils.measureNumber(value);
            if(decimalDigits > scale)
                invalidAnswers.push(code)
        }

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validateRange() {
        let { min, max } = this.numeric;
        if (Utils.isEmpty(min) && Utils.isEmpty(max))
            return new RuleValidationResult(true);

        let invalidAnswers = [];
        for(let[code, value] of Object.entries(this.values)) {
            if(Utils.isEmpty(value))
                continue;
            if(Utils.isNotANumber(value))
                continue;

            let tooSmall = !Utils.isEmpty(min) && value < min;
            let tooLarge = !Utils.isEmpty(max) && value > max;

            if(tooSmall || tooLarge)
                invalidAnswers.push(code)
        }

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validateMultiCount() {
        const { equal, min, max } = this.multiCount;
        const count = Object.keys(this.values).length;

        if (!this.required && count === 0) // bypass if not required and not answered
            return new RuleValidationResult(true);

        if(!Utils.isEmpty(equal) && count !== equal)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(min) && count < min)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(max) && count > max)
            return new RuleValidationResult(false);

        return new RuleValidationResult(true);
    }

    _validateMultiSum() {
        const { equal, min, max } = this.multiSum;
        const values = Object.values(this.values);

        if(!this.required && values.length === 0) // bypass if not required and not answered
            return new RuleValidationResult(true);

        const hasNotANumberValue = values.find(value => Utils.isNotANumber(value));
        if (hasNotANumberValue) // bypass if invalid type in values
            return new RuleValidationResult(true);

        let sum = values.reduce((sum, current) => sum + Utils.toNumber(current), 0);

        if(!Utils.isEmpty(equal) && sum !== equal)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(min) && sum < min)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(max) && sum > max)
            return new RuleValidationResult(false);

        return new RuleValidationResult(true);
    }
}
