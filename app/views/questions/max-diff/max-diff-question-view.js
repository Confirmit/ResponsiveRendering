import MaxDiffInnerSingleQuestionView from './max-diff-inner-single-question-view';
import QuestionView from "../base/question-view";
import ErrorBlockManager from "../../error/error-block-manager";

export default class MaxDiffQuestionView extends QuestionView {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._innerQuestionViews = [];

        this._answerErrorBlockManager = new ErrorBlockManager();

        this._createInnerQuestionViews();
        this._attachHandlersToDOM();
    }

    detachModelHandlers() {
        super.detachModelHandlers();

        this._innerQuestionViews.forEach(questionView => {
            questionView.detachModelHandlers();
        });
    }

    _getAnswerOtherErrorBlockId(answerCode) {
        return `${this._question.id}_${answerCode}_other_error`;
    }

    _getAnswerOtherNode(answerCode) {
        return this._container.find(`#${this._question.id}_${answerCode}_other`);
    }

    _createInnerQuestionViews() {
        this._innerQuestionViews = this._question.innerQuestions.map(innerQuestion => new MaxDiffInnerSingleQuestionView(this._question, innerQuestion, this._settings));
    }

    _attachHandlersToDOM() {
        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            if(answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }

    _setOtherNodeValue(answerCode, otherValue) {
        otherValue = otherValue || '';

        const otherInput = this._getAnswerOtherNode(answerCode);
        if (otherInput.val() !== otherValue) {
            otherInput.val(otherValue);
        }
    }

    _onModelValueChange({changes}) {
        if(changes.otherValues === undefined) {
            return;
        }

        changes.otherValues.forEach(answerCode => {
            const otherValue = this._question.otherValues[answerCode];
            this._setOtherNodeValue(answerCode, otherValue);
        });
    }

    _showErrors(validationResult) {
        const errors = validationResult.errors.map(error => error.message);
        const innerQuestionErrors = validationResult.questionValidationResults.reduce((acc, currentResult) => {
            const questionErrors = this._getInnerQuestionErrors(currentResult);
            return acc.concat(questionErrors);
        }, []);
        this._errorBlock.showErrors(errors.concat(innerQuestionErrors));


        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const answer = this._question.getAnswer(answerValidationResult.answerCode);
            if(!answer.isOther) {
                return;
            }

            const target = this._getAnswerOtherNode(answerValidationResult.answerCode);
            const errorBlockId = this._getAnswerOtherErrorBlockId(answerValidationResult.answerCode);
            const errors = answerValidationResult.errors.map(error => error.message);
            this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
        });
    }

    _hideErrors(){
        super._hideErrors();
        this._answerErrorBlockManager.removeAllErrors();
    }

    _getInnerQuestionValidationMessage(questionId, type, messageType) {
        return this._question.validationMessagesForInnerQuestions.find(x => x.questionId === questionId && x.validationType === type && x.messageType === messageType);
    }

    _getInnerQuestionErrors({questionId, errors}) {
        return errors.reduce((acc, error) => {
            const message = this._getInnerQuestionValidationMessage(questionId, error.type, 'General');
            if (message !== undefined)
                acc.push(message.text);
            return acc;
        }, []);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._question.setOtherValue(answer.code, otherValue);
    }
}