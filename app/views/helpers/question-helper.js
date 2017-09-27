import Utils from 'utils.js';

export default class QuestionHelper {

    static isAnswerComplete(question, answer) {
        if (Utils.isEmpty(question.values[answer.code])) {
            return false;
        }

        if (answer.isOther && Utils.isEmpty(question.otherValues[answer.code])) {
            return false;
        }

        return true;
    }
}