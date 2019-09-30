import QuestionWithAnswers from './../base/question-with-answers.js';
import Answer from './../base/answer.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Grid3dQuestionValidationResult from "../validation/gird3d-question-validation-result";
import Utils from 'utils.js';
import QuestionTypes from 'api/question-types.js';

/**
 * @class
 * @extends {QuestionWithAnswers}
 */
export default class Grid3DQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     * @param {QuestionFactory} questionFactory - Question factory.
     */
    constructor(model, questionFactory) {
        super(model);

        this._questionFactory = questionFactory;
        this._innerQuestions = [];
        this._carousel = model.carousel || false;
        this._multiGrid = model.multiGrid || false;
        this._maxDiff = model.maxDiff || false;
        this._validationMessagesForInnerQuestions = model.validationMessagesForInnerQuestions;

        this._otherValues = { ...model.otherValues };


        this._parseQuestions(model);
        this._subscribeToQuestions();
    }

    /**
     * Is multi grid
     * @type {boolean}
     * @readonly
     */
    get multiGrid() {
        return this._multiGrid;
    }

    /**
     * Is max diff question
     * @type {boolean}
     * @readonly
     */
    get maxDiff() {
        return this._maxDiff;
    }

    /**
     * Is carousel grid
     * @type {boolean}
     * @readonly
     */
    get carousel() {
        return this._carousel;
    }

    /**
     * Validation messages to show on Grid3D level if inner question validation fails
     * @type {Array}
     * @readonly
     */
    get validationMessagesForInnerQuestions(){
        return this._validationMessagesForInnerQuestions;
    }

    /**
     * @inheritDoc
     */
    get formValues(){
        let formValues = {};

        this._innerQuestions.forEach(question => {
            formValues = {...formValues, ...question.formValues };
        });

        // TODO: Filling order is important, mb good idea to make empty fieldName of other answers in inner questions.
        for(let[answerCode, otherValue] of Object.entries(this.otherValues)) {
            const answer = this.getAnswer(answerCode);
            if(answer && answer.isOther){
                formValues[answer.otherFieldName] = otherValue;
            }
        }

        return formValues;
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
     * Set other answer value.
     * @param {string} answerCode - Answer code.
     * @param {string} otherValue - Other value.
     */
    setOtherValue(answerCode, otherValue) {
        this._setValueInternal(
            'otherValues',
            () => this._setOtherValue(answerCode, otherValue),
        );
    }

    /**
     * Array of inner questions.
     * @type {QuestionWithAnswers[]}
     * @readonly
     */
    get innerQuestions() {
        return this._innerQuestions;
    }

    /**
     * Get inner question by id.
     * @param {string} id - Question id.
     * @return {QuestionWithAnswers}
     */
    getInnerQuestion(id) {
        if(id === null) {
            return null;
        }
        id = id.toString();
        return this._innerQuestions.find(question => question.id === id);
    }

    _parseQuestions({ questions }) {
        questions.forEach(questionModel => {
            const question = this._questionFactory.create(questionModel);
            this._innerQuestions.push(question);
        });
    }

    _parseAnswers({ answers }) {
        answers.forEach(answer => {
            this._answers.push(new Answer(answer, null));
        });
    }

    _subscribeToQuestions() {
        this._innerQuestions.forEach(question => {
            question.changeEvent.on(data => {
                this._onChange({ questions: {[question.id]: data.changes} });
            });
        });
    }

    _validate(validationRuleFilter = null) {
        const validationResult = new Grid3dQuestionValidationResult(this._id);

        const innerQuestionValidationResults = this._innerQuestions.map(q => q.validate(true, validationRuleFilter));
        validationResult.questionValidationResults.push(...innerQuestionValidationResults);

        const ownValidationResult = super._validate(validationRuleFilter);
        validationResult.answerValidationResults.push(...ownValidationResult.answerValidationResults);

        return validationResult;
    }

    _validateRule(validationType) {
        switch(validationType) {
            case ValidationTypes.Required:
                return  new RuleValidationResult(true);
            case ValidationTypes.OtherRequired:
                return this._validateOther();
        }
    }

    _validateOther() {
        const invalidAnswers = [];
        this.answers.filter(answer => answer.isOther).forEach(answer => {
            const isNotEmpty = this._innerQuestions.some(question => this._isAnswerInQuestionValue(question, answer.code));
            const otherIsEmpty = Utils.isEmpty(this.otherValues[answer.code]);
            if (isNotEmpty && otherIsEmpty){
                invalidAnswers.push(answer.code);
            }
        });

        const isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }

    _isAnswerInQuestionValue(question, answerCode) {
        switch (question.type) {
            case QuestionTypes.Single:
                return question.value === answerCode;
            case QuestionTypes.Multi:
                return question.values.includes(answerCode);
            case QuestionTypes.OpenTextList:
            case QuestionTypes.NumericList:
            case QuestionTypes.Ranking:
            case QuestionTypes.Grid:
            default:
                return question.values[answerCode] !== undefined;
        }
    }
}
