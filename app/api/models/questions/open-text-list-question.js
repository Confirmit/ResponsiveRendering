import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {QuestionWithAnswers}
 */
export default class OpenTextListQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._maxLength = model.maxLength;
        this._multiCount = model.multiCount || {};
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
     * Value max length.
     * @type {number}
     * @readonly
     */
    get maxLength(){
        return this._maxLength;
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
     * Select answer for opentextlist.
     * @param {string} answerCode - Answer code.
     * @param {string} answerValue - Answer value.
     */
    setValue(answerCode, answerValue) {
        const old = { ...this._values };

        const changed = this._setValue(answerCode, answerValue);
        if(changed) {
            this._onChange({values: this._diff(old, this._values)})
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

        const answer = this.getAnswer(answerCode);
        if (!answer) {
            return false;
        }

        if (Utils.isEmpty(answerValue)) {
            if (this._values[answerCode] === undefined) {
                return false;
            }
            delete this._values[answerCode];
        }
        else {
            const valueToSet = answerValue.toString();
            if (this._values[answerCode] === valueToSet) {
                return false;
            }
            this._values[answerCode] = valueToSet;
        }

        return true;
    }

    _loadInitialState({ values = {}, otherValues = {} }) {
        this._values = { ...values };
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
            case ValidationTypes.MaxLength:
                return this._validateMaxLength();
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

    _validateMultiCount() {
        let { equal, min, max } = this.multiCount;
        let count = Object.values(this.values).length;

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

    _validateMaxLength(){
        if (Utils.isEmpty(this.maxLength))
            return new RuleValidationResult(true);

        let answers = [];
        for(let[code, value] of Object.entries(this.values)) {
            if(Utils.isEmpty(value))
                continue;

            if (value.length > this.maxLength)
                answers.push(code);
        }

        let isValid = answers.length === 0;
        return new RuleValidationResult(isValid, answers);
    }
}