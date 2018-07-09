import QuestionWithAnswers from './../base/question-with-answers.js';
import Answer from './../base/answer.js';
import ValidationTypes from '../validation/validation-types.js';
import RuleValidationResult from '../validation/rule-validation-result.js';
import Grid3dQuestionValidationResult from "../validation/gird3d-question-validation-result";
import Utils from 'utils.js';

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
        this._multiGrid = model.multiGrid || false;

        this._parseQuestions(model);
        this._subscribeToQuestions();
        this._loadInitialState(model);
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
     * @inheritDoc
     */
    get formValues(){
        let formValues = {};
        this._innerQuestions.forEach(question => {
            formValues = {...formValues, ...question.formValues };
        });
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
        const old = { ...this._otherValues };

        const changed = this._setOtherValue(answerCode, otherValue);
        if (changed) {
            this._onChange({otherValues: this._diff(old, this._otherValues)});
        }
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

    _loadInitialState({ otherValues = {} }) {
        this._otherValues = { ...otherValues };
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

        this._innerQuestions.forEach(question => {
            validationResult.questionValidationResults.push(question.validate(false, validationRuleFilter));
        });

        const questionValidationResult = super._validate(validationRuleFilter);
        questionValidationResult.answerValidationResults.forEach(result => {
            validationResult.answerValidationResults.push(result);
        });

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
        let invalidAnswers = [];

        this.answers.filter(answer => answer.isOther).forEach(answer => {
            let isNotEmpty = this._innerQuestions.some(question => question.values.includes(answer.code));
            let otherIsEmpty = Utils.isEmpty(this.otherValues[answer.code]);
            if (isNotEmpty && otherIsEmpty){
                invalidAnswers.push(answer.code);
            }
        });

        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }
}
