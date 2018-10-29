import ViewFactory from "./grid-3d-desktop-inner-question-view-factory";
import QuestionViewBase from "views/questions/base/question-view-base";
import AnswerErrorManager from "views/error/answer-error-manager";
import QuestionErrorBlock from "views/error/question-error-block";
import $ from "jquery";

export default class Grid3DDesktopQuestionView extends QuestionViewBase {
    /**
     * @param {Grid3DQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        super(question, settings);

        this._viewFactory = new ViewFactory(question, settings);
        this._innerQuestionViews = [];

        this._container = $(`#${question.id} .cf-grid-3d__desktop`);
        this._errorBlock = new QuestionErrorBlock(this._container.find('.cf-grid-3d-desktop__error'));

        this._answerErrorManager = new AnswerErrorManager();

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

    _areAnswerErrorsMoveToQuestionLevel(innerQuestion) {
        if(innerQuestion.type === 'Grid' && !innerQuestion.dropdown) {
            return true;
        }

        return false;
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
        this._errorBlock.hideErrors();
        this._answerErrorManager.removeAllErrors();

        const errors = validationResult.errors.map(error => error.message);
        const innerQuestionErrors = validationResult.questionValidationResults.reduce((accumulator, currentResult) => {
            const innerQuestion = this._question.getInnerQuestion(currentResult.questionId);
            currentResult.errors.forEach(error => {
                accumulator.push(innerQuestion.text + ': ' + error.message);
            });

            if(this._areAnswerErrorsMoveToQuestionLevel(innerQuestion)) {
                currentResult.answerValidationResults.forEach(answerResult => {
                    const answer = innerQuestion.getAnswer(answerResult.answerCode);
                    answerResult.errors.forEach(error => {
                        accumulator.push(`${innerQuestion.text} ${answer.text}: ${error.message}`);
                    });
                });
            }

            return accumulator;
        }, []);

        this._errorBlock.showErrors(errors.concat(innerQuestionErrors));


        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const answer = this._question.getAnswer(answerValidationResult.answerCode);
            if(!answer.isOther) {
                return;
            }

            const target = this._getAnswerOtherNode(answerValidationResult.answerCode);
            this._answerErrorManager.showErrors(answerValidationResult, target);
        });
    }



    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._question.setOtherValue(answer.code, otherValue);
    }
}