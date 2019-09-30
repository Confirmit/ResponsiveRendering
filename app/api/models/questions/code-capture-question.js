import Question from './../base/question';
import ValidationTypes from '../validation/validation-types';
import RuleValidationResult from '../validation/rule-validation-result';
import Utils from 'utils';

/**
 * @desc Code capture question.
 * @extends {Question}
 */
export default class CodeCaptureQuestion extends Question {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._value = model.value;
        this._cameraOnly = model.cameraOnly || false;
    }

    /**
     * Question value can be changed only by capturing (for example, by camera).
     * @returns {boolean}
     * @readonly
     */
    get cameraOnly() {
        return this._cameraOnly;
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        const form = {};

        if (!Utils.isEmpty(this.value)){
            form[this.id] = this.value;
        }

        return form;
    }

    /**
     * Code capture value.
     * @type {string}
     */
    get value() {
        return this._value;
    }

    /**
     * Set answer value.
     * @param {string} answerValue - Answer value.
     */
    setValue(answerValue) {
        this._setValueInternal(
            'value',
            () => this._setValue(answerValue),
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
        if (!this.required) {
            return new RuleValidationResult(true);
        }

        const isValid = !Utils.isEmpty(this.value);

        return new RuleValidationResult(isValid)
    }
}