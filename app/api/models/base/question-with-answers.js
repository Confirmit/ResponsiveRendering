import Answer from './answer.js';
import HeadGroup from './head-group.js';
import Question from './question.js';
import RuleValidationResult from './../validation/rule-validation-result.js';
import Utils from 'utils.js';

/**
 * @extends {Question}
 */
export default class QuestionWithAnswers extends Question {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);

        this._answers = [];
        this._answerGroups = [];
        this._otherValues = {};
        
        this._parseAnswerGroups(model);
        this._parseAnswers(model);
    }

    /**
     * The array of answers.
     * @type {Answer[]}
     * @readonly
     */
    get answers() {
        return this._answers;
    }

    /**
    * The array of answer groups.
    * @type {HeadGroup[]}
    * @readonly
    */
    get answerGroups() {
        return this._answerGroups;
    }

    /**
     * Get answer by code.
     * @param {string} code - Answer code.
     * @return {Answer}
     */
    getAnswer(code) {
        if(code === null) {
            return null;
        }
        code = code.toString();
        return this._answers.find(answer => answer.code === code);
    }

    /**
     * Get answers array by codes array.
     * @param {string[]} codes - Array of answer codes.
     * @return {Answer[]}
     */
    getAnswers(codes) {
        codes = codes.map(item => item.toString());
        return this._answers.filter(answer => codes.includes(answer.code));
    }

    /**
     * Get answer group by code.
     * @param {string} code - Group code.
     * @return {HeadGroup}
     */
    getAnswerGroup(code) {
        if(code === null) {
            return null;
        }
        code = code.toString();
        return this._answerGroups.find(group => group.code === code);
    }

    _parseAnswerGroups({answerGroups}) {
        if(!answerGroups || answerGroups.length === 0) {
            return;
        }
        // create empty groups to populate them in _parseAnswers method
        this._answerGroups = answerGroups.map(group=> new HeadGroup(group.code, group.title));
    }

    _parseAnswers({answers}) {
        if(!answers || answers.length === 0) {
            return;
        }

        answers.forEach(answerModel => {
            let answer;
            if (answerModel.groupCode) {
                let group = this.getAnswerGroup(answerModel.groupCode);
                answer = new Answer(answerModel, group); 
                group.items.push(answer);
            }
            else {
                answer = new Answer(answerModel); 
            }
            this._answers.push(answer);
        });
    }

    _setOtherValue(answerCode, otherValue) {
        answerCode = answerCode.toString();
        
        const answer = this.getAnswer(answerCode);
        if (!answer || !answer.isOther) {
            return false;
        }

        if (Utils.isEmpty(otherValue)) {
            if (this._otherValues[answerCode] === undefined) {
                return false;
            }
            delete this._otherValues[answerCode];
        }
        else {
            let valueToSet = otherValue.toString();
            if (this._otherValues[answerCode] === valueToSet) {
                return false;
            }
            this._otherValues[answerCode] = otherValue.toString();
        }

        return true;
    }


    _diff(oldValues, newValues) {
        // check if it's an array
        if (Array.isArray(oldValues)) {
            const added = newValues.filter(newVal => !oldValues.includes(newVal));
            const removed = oldValues.filter(oldVal => !newValues.includes(oldVal));
            return [...added, ...removed];
        }

        // otherwise assume it's an object
        const oldKeys = Object.keys(oldValues);
        const newKeys = Object.keys(newValues);
        const added = newKeys.filter(newKey => !oldKeys.includes(newKey));
        const removed = oldKeys.filter(oldKey => !newKeys.includes(oldKey));
        const modified = oldKeys.filter(oldKey => newKeys.includes(oldKey)).filter(key => oldValues[key] !== newValues[key]);
        return [...added, ...removed, ...modified];
    }
    
    _validateRequiredIfOtherSpecified() {
        let invalidAnswers = [];
        
        Object.keys(this.otherValues).forEach(otherAnswerCode => {
            if(Utils.isEmpty(this.values[otherAnswerCode]))
                invalidAnswers.push(otherAnswerCode);
        });
        
        let isValid = invalidAnswers.length === 0;
        return new RuleValidationResult(isValid, invalidAnswers);
    }
}
