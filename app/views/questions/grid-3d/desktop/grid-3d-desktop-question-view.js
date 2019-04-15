import ViewFactory from "./grid-3d-desktop-inner-question-view-factory";
import QuestionViewBase from "views/questions/base/question-view-base";
import QuestionErrorBlock from "views/error/question-error-block";
import $ from "jquery";
import QuestionTypes from 'api/question-types.js';
import ErrorBlockManager from "../../../error/error-block-manager";

export default class Grid3DDesktopQuestionView extends QuestionViewBase {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        super(question, settings);

        this._viewFactory = new ViewFactory(question, settings);
        this._innerQuestionViews = [];

        this._container = $(`#${this._question.id} .cf-grid-3d__desktop`);
        this._questionErrorBlock = new QuestionErrorBlock(this._container.find('.cf-grid-3d-desktop__error'));

        this._answerErrorBlockManager = new ErrorBlockManager();

        this._createInnerQuestions();
        this._attachHandlersToDOM();
    }

    detachModelHandlers() {
        super.detachModelHandlers();

        this._innerQuestionViews.forEach(questionView => {
            questionView.detachModelHandlers();
        });
    }

    _getAnswerOtherNode(answerCode) {
        return $(`#desktop_${this._question.id}_${answerCode}_other`);
    }

    _getAnswerOtherErrorBlockId(answerCode) {
        return `desktop_${this._question.id}_${answerCode}_other`;
    }

    _createInnerQuestions() {
        this._question.innerQuestions.forEach(innerQuestion => {
            const view = this._viewFactory.create(innerQuestion);
            if(view !== undefined) {
                this._innerQuestionViews.push(view);
            }
        });
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

    _onValidationComplete(validationResult) {
        this._questionErrorBlock.hideErrors();
        this._answerErrorBlockManager.removeAllErrors();

        const errors = validationResult.errors.map(error => error.message);
        const innerQuestionErrors = validationResult.questionValidationResults.reduce((acc, currentResult) => {
            const questionErrors = this._getInnerQuestionErrors(currentResult);
            const answerErrors = this._getInnerQuestionAnswerErrors(currentResult);
            return acc.concat(questionErrors).concat(answerErrors);
        }, []);

        this._questionErrorBlock.showErrors(errors.concat(innerQuestionErrors));

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

    _getInnerQuestionAnswerErrors({questionId, answerValidationResults}) {
        const innerQuestion = this._question.getInnerQuestion(questionId);
        if (innerQuestion.type === QuestionTypes.Grid && innerQuestion.dropdown)
            return [];

        const flattened = answerValidationResults.reduce((acc, answerResult) => {
          const items = answerResult.errors.map(error => ({type: error.type, code: answerResult.answerCode}));
          return acc.concat(items);
        }, []);

        const groupedByType = flattened.reduce((acc, item) => {
           let group = acc.find(x => x.type === item.type);
           if (group === undefined) {
               group = {type: item.type, codes: []};
               acc.push(group);
           }
           group.codes.push(item.code);
           return acc;
        }, []);

        return groupedByType.reduce((acc, error) => {
            const messageType = error.codes.length === 1? 'Singular': 'Plural';
            const message = this._getInnerQuestionValidationMessage(questionId, error.type, messageType);
            if (message !== undefined) {
                const {text, answerSubstitution: {placeholder, conjunction, separator, quoteBegin, quoteEnd} } = message;
                const answerTexts = error.codes.map(code => `${quoteBegin}${innerQuestion.getAnswer(code).text}${quoteEnd}`);
                const replacement = error.codes.length === 1
                    ? answerTexts[0]
                    : `${answerTexts.slice(0, -1).join(separator)}${conjunction}${answerTexts.slice(-1).pop()}`;
                acc.push(text.split(placeholder).join(replacement));
            }
            return acc;
        }, []);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._question.setOtherValue(answer.code, otherValue);
    }
}