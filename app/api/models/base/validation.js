export class RuleValidationResult {
    /**
     * Create instance.
     * @param {boolean} isValid - Is it valid.
     * @param {string[]} answers - The array of answer codes.
     * @param {object} data - Object with properties.
     */
    constructor(isValid, answers = [], data = {}) {
        this._isValid = isValid;
        this._answers = answers;
        this._data = data;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._isValid;
    }

    /**
     * The array of answer codes where found validation error.
     * @type {string[]}
     * @readonly
     */
    get answers() {
        return this._answers;
    }

    /**
     * Object with properties.
     * @type {Object}
     * @readonly
     */
    get data() {
        return this._data;
    }
}

/**
 * @class
 * @alias PageValidationResult
 */
export class PageValidationResult {
    /**
     * Create instance.
     * @param {QuestionValidationResult[]} questionValidationResults - Question validation results.
     */
    constructor(questionValidationResults = []) {
        this._questionValidationResults = questionValidationResults;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._questionValidationResults.every(result => result.isValid);
    }

    /**
     * Question validation results.
     * @type {QuestionValidationResult[]}
     * @readonly
     */
    get questionValidationResults() {
        return this._questionValidationResults;
    }
}

/**
 * @class
 * @alias QuestionValidationResult
 */
export class QuestionValidationResult {
    /**
     * Create instance.
     * @param {string} questionId - Question id.
     * @param {string[]} errors - Question specific errors.
     * @param {answerValidationResults[]} answerValidationResults - Answer validation results.
     */
    constructor(questionId, errors = [], answerValidationResults = []) {
        this._questionId = questionId;
        this._errors = errors;
        this._answerValidationResults = answerValidationResults;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._errors.length === 0 && this._answerValidationResults.every(result => result.isValid);
    }

    /**
     * Question id.
     * @type {string}
     * @readonly
     */
    get questionId() {
        return this._questionId;
    }

    /**
     * Question specific errors.
     * @type {ValidationError[]}
     * @readonly
     */
    get errors() {
        return this._errors;
    }

    /**
     * Answer validation results.
     * @type {AnswerValidationResult[]}
     * @readonly
     */
    get answerValidationResults() {
        return this._answerValidationResults;
    }
}

/**
 * @class
 * @alias AnswerValidationResult
 */
export class AnswerValidationResult {
    /**
     * Create instance.
     * @param {string} answerCode - Answer code.
     * @param {string[]} errors - Answer specific errors.
     */
    constructor(answerCode, errors = []) {
        this._answerCode = answerCode;
        this._errors = errors;
    }

    /**
     * Is it valid.
     * @type {boolean}
     * @readonly
     */
    get isValid() {
        return this._errors.length === 0;
    }

    /**
     * Answer code.
     * @type {string}
     * @readonly
     */
    get answerCode() {
        return this._answerCode;
    }

    /**
     * Answer specific errors.
     * @type {ValidationError[]}
     * @readonly
     */
    get errors() {
        return this._errors;
    }
}

/**
 * @class
 * @alias ValidationError
 */
export class ValidationError {
    /**
     * Create instance.
     * @param {string} type - Validation rule type.
     * @param {string} message - Validate error message.
     * @param {object} data - data object with extra information about validation result.
     */
    constructor(type, message, data = {}) {
        this._type = type;
        this._message = message;
        this._data = data;
    }

    /**
     * Validation rule type.
     * @type {string}
     * @readonly
     */
    get type() {
        return this._type;
    }

    /**
     * Validate error message.
     * @type {string}
     * @readonly
     */
    get message() {
        return this._message;
    }

    /**
     * Data object with extra information about validation result.
     * @type {object}
     * @readonly
     */
    get data() {
        return this._data;
    }
}

export const ValidationTypes = Object.freeze({
    Required : 'Required',
    OtherRequired: 'OtherRequired',
    MaxLength: 'MaxLength',
    Numeric: 'Numeric',
    Precision: 'Precision',
    Scale: 'Scale',
    Range: 'Range',
    MultiCount: 'MultiCount',
    MultiSum: 'MultiSum',
    Date: 'Date',
    Ranking: 'Ranking',
    RequiredIfOtherSpecified : 'RequiredIfOtherSpecified',
    Geolocation: 'Geolocation'
});


