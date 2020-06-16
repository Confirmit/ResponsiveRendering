import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {QuestionWithAnswers}
 */
export default class RankingQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._multiCount = { ...model.multiCount };
        this._layoutColumns = model.layoutColumns || 0;
        this._layoutRows = model.layoutRows || 0;
        this._captureOrder = model.captureOrder || false;
        this._answerButtons = model.answerButtons || false;
        this._rankByNumber = model.rankByNumber || false;
        this._rankByDrag = model.rankByDrag || false;

        this._values = { ...model.values };
        this._otherValues = { ...model.otherValues };
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
     * `{equal:value, max:value, min:value}`
     * @type {object}
     * @readonly
     */
    get multiCount(){
        return { ...this._multiCount };
    }

    /**
     * Display the question as capture order multi.
     * @type {boolean}
     * @readonly
     */
    get captureOrder() {
        return this._captureOrder;
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
     * Use number inputs for answers.
     * @type {boolean}
     * @readonly
     */
    get rankByNumber() {
        return this._rankByNumber;
    }

    /**
     * Use drag and drop for answers.
     * @type {boolean}
     * @readonly
     */
    get rankByDrag() {
        return this._rankByDrag;
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
     * Select answer for ranking.
     * @param {string} answerCode - Answer code.
     * @param {string} answerValue - Answer value.
     */
    setValue(answerCode, answerValue) {
        this._setValueInternal(
            'values',
            () => this._setValue(answerCode, answerValue)
        );
    }

    /**
     * Set other answer value.
     * @param {string} answerCode - Answer code.
     * @param {string} otherValue - Other value.
     */
    setOtherValue(answerCode, otherValue) {
        this._setValueInternal(
            'otherValues',
            () => this._setOtherValue(answerCode, otherValue)
        );
    }

    _setValue(answerCode, answerValue) {
        answerCode = answerCode.toString();

        const answer = this.getAnswer(answerCode);
        if (!answer) {
            return false;
        }

        if (this._captureOrder && (answer.isExclusive || this._isCurrentValueExclusive())) {
            this._clearValues();
            answerValue = 1;
        }

        if (Utils.isNotANumber(answerValue)) {
            if (this._values[answerCode] === undefined) {
                return false;
            }
            delete this._values[answerCode];
        }
        else {
            const valueToSet = Number(answerValue);
            if (this._values[answerCode] === valueToSet) {
                return false;
            }
            this._values[answerCode] = valueToSet;
        }

        return true;
    }

    _isCurrentValueExclusive() {
        const values = Object.keys(this._values);
        return values.length === 1 && this.getAnswer(values[0]).isExclusive;
    }

    _clearValues() {
        this._values = {};
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.OtherRequired:
                return this._validateOther();
            case ValidationTypes.MultiCount:
                return this._validateMultiCount();
            case ValidationTypes.Ranking:
                return this._validateRanking();
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

        if (this._captureOrder) {
            const isValid = Object.keys(this.values).length > 0;
            return new RuleValidationResult(isValid);
        }

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

        if (this._captureOrder && this._isCurrentValueExclusive()) // bypass if exclusive answers is supported and selected answer is exclusive
            return new RuleValidationResult(true);

        if(!Utils.isEmpty(equal) && count !== equal)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(min) && count < min)
            return new RuleValidationResult(false);

        if (!Utils.isEmpty(max) && count > max)
            return new RuleValidationResult(false);

        return new RuleValidationResult(true);
    }

    _validateRanking() {
        const values = Object.values(this.values);

        if (values.length === 0)
            return new RuleValidationResult(true);

        const isValid = values
            .sort((a, b) => a - b)
            .every((current, index) => current - 1 === index);

        return new RuleValidationResult(isValid);
    }
}
