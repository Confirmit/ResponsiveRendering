import QuestionWithAnswers from './../base/question-with-answers.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * Base question model class for Multi
 * @extends {QuestionWithAnswers}
 */
export default class MultiQuestionBase extends QuestionWithAnswers {
    /**
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._multiCount = { ...model.multiCount };

        this._values = model.values ? [ ...model.values ] : [];
        this._otherValues = { ...model.otherValues };
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
     * @param {bool} selected - if true the answer will be selected, else unselected.
     */
    setValue(answerCode, selected) {
        this._setValueInternal(
            'values',
            () => this._setValue(answerCode, selected),
            this._diffArrays,
        );
    }


    /**
     * Clear question.
     */
    clearValues() {
        this._setValueInternal(
            'values',
            () => { this._clearValues(); return true; },
            this._diffArrays,
        );
    }

    /**
     * Set other answer value.
     * @param {string} answerCode - Answer code.
     * @param {string} otherValue -Other value.
     */
    setOtherValue(answerCode, otherValue) {
        this._setValueInternal(
            'otherValues',
            () => this._setOtherValue(answerCode, otherValue)
        );
    }

    _setValue(answerCode, selected) {
        const changed = selected
            ? this._addValue(answerCode)
            : this._removeValue(answerCode);
        return changed;
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

        const {min, equal} = this.multiCount;
        if (!Utils.isEmpty(min) || !Utils.isEmpty(equal)) // bypass if required and has multi count low boundary constraints (to be handled by multi count validation)
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

        if (!this.required && count === 0) // bypass if not required and not answered (to be handled by required validation)
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