import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {QuestionWithAnswers}
 */
export default class MultiQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._multiCount = { ...model.multiCount };
        this._answerButtons = model.answerButtons || false;
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;

        this._values = [];

        this._loadInitialState(model);
    }

    /**
     * Use buttons for answers.
     * @type {boolean}
     * @readonly
     */
    get answerButtons() {
        return this._answerButtons;
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
     * Array of selected codes.
     * @type {string[]}
     * @readonly
     */
    get values() {
        return [ ...this._values ];
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
     * `{equal:value, max:value, min:value}`
     * @type {object}
     * @readonly
     */
    get multiCount(){
        return { ...this._multiCount };
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        let form = {};

        this.values.forEach(answerCode => {
            let answer = this.getAnswer(answerCode);
            if(answer){
                form[answer.fieldName] = "1";
                if(answer.isOther){
                    form[answer.otherFieldName] = this.otherValues[answerCode];
                }
            }
        });

        return form;
    }

    /**
     * Select answer for multi.
     * @param {string} answerCode - Answer code.
     * @param {string} check - Check or uncheck.
     */
    setValue(answerCode, check) {
        const old = [ ...this._values ];

        const changed = check
            ? this._addValue(answerCode)
            : this._removeValue(answerCode);
        if(changed) {
            this._onChange({values: this._diff(old, this._values)});
        }
    }

    /**
     * Clear question.
     */
    clearValues() {
        const old = [ ...this._values ];

        this._clearValues();
        this._onChange({values: this._diff(old, this._values)});
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

    _addValue(answerCode) {
        answerCode = answerCode.toString();
        if(!answerCode || this._values.includes(answerCode)) {
            return false;
        }

        const answer = this.getAnswer(answerCode);
        if(!answer) {
            return false;
        }

        // there is no generic message for exclusivity validation, so we handle it here
        if(answer.isExclusive || this._isCurrentValueExclusive()) {
            this._clearValues();
        }

        this._values.push(answerCode);

        return true;
    }

    _removeValue(answerCode) {
        answerCode = answerCode.toString();
        if(!answerCode || !this._values.includes(answerCode)) {
            return false;
        }

        this._values = this._values.filter(item => item !== answerCode);

        return true;
    }

    _clearValues() {
        this._values = [];
    }

    _isCurrentValueExclusive() {
        return  this._values.length === 1 && this.getAnswer(this._values[0]).isExclusive;
    }

    _loadInitialState({ values = [], otherValues={} })
    {
        this._values = [ ...values ];
        this._otherValues = { ...otherValues };
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.OtherRequired:
                return this._validateOther();
            case ValidationTypes.MultiCount:
                return this._validateMultiCount();
            case ValidationTypes.RequiredIfOtherSpecified:
                return this._validateRequiredIfOtherSpecified();
        }
    }

    _validateRequired() {
        if (!this.required)
            return new RuleValidationResult(true);

        let isValid = this.values.length > 0;
        return new RuleValidationResult(isValid);
    }


    // TODO: move to base class
    _validateOther() {
        let invalidAnswers = [];

        this.answers.forEach(answer => {
            let isOther = answer.isOther;
            let isNotEmpty = this.values.includes(answer.code);
            let otherIsEmpty = Utils.isEmpty(this.otherValues[answer.code]);
            if (isOther && isNotEmpty && otherIsEmpty){
                invalidAnswers.push(answer.code);
            }
        });

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _validateMultiCount() {
        let { equal, min, max } = this.multiCount;
        let count = this.values.length;

        if (!this.required && count === 0) // bypass if not required and not answered
            return new RuleValidationResult(true);

        if (this._isCurrentValueExclusive()) // bypass is selected answer is exclusive
            return new RuleValidationResult(true);

        if(!Utils.isEmpty(equal) && count !== equal)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(min) && count < min)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(max) && count > max)
            return new RuleValidationResult(false);

        return new RuleValidationResult(true);
    }

    _validateRequiredIfOtherSpecified() {
        let invalidAnswers = [];
        
        Object.keys(this.otherValues).forEach(otherAnswerCode => {
            if(!this.values.includes(otherAnswerCode))
                invalidAnswers.push(otherAnswerCode);
        });
        
        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }
}