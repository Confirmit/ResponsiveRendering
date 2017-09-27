import QuestionWithAnswersView from './base/question-with-answers-view.js';

export default class OpenTextListQuestionView extends QuestionWithAnswersView {
   constructor(question) {
       super(question);
       this._attachControlHandlers();
   }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _updateAnswerNodes({values = []}) {
        if(values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            const answerInput = this._getAnswerInputNode(answer.code);
            const value = this._question.values[answer.code] || '';
            if (answerInput.val() !== value) {
                answerInput.val(value);
            }
        });
    }

    _attachControlHandlers() {
       this.answers.forEach(answer => {
           this._getAnswerInputNode(answer.code).on('input', event => {
               this._onAnswerValueChangedHandler(answer.code, event.target.value);
           });

           if (answer.isOther) {
               this._getAnswerOtherNode(answer.code).on('input', event => {
                   this._onAnswerOtherValueChangedHandler(answer.code, event.target.value);
               });
           }
       });
    }

    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            this._answerErrorManager.showErrors(
                answerValidationResult,
                this._getAnswerInputNode(answerValidationResult.answerCode),
                this._getAnswerOtherNode(answerValidationResult.answerCode)
            );
        });
    }

    _onAnswerValueChangedHandler(answerCode, answerValue) {
        this._question.setValue(answerCode, answerValue);
    }

    _onAnswerOtherValueChangedHandler(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }
}
