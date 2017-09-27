import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from './../../utils.js';

export default class RankingQuestionView extends QuestionWithAnswersView{

    constructor(question) {
        super(question);

        this._attachControlHandlers();
    }

    _getAnswerRankNode(code) {
        return this._getAnswerNode(code).find('.cf-ranking-answer__rank');
    }

    _showAnswerErrors(validationResult) {
        validationResult.answerValidationResults.forEach(answerValidationResult => {
            const target = this._getAnswerNode(answerValidationResult.answerCode);
            this._answerErrorManager.showErrors(answerValidationResult, target);
        });
    }

    /* Model handlers */
    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _updateAnswerNodes({values = []}){
        if(values.length === 0)
            return;

        this._container.find('.cf-ranking-answer').removeClass('cf-ranking-answer--selected');
        this._container.find('.cf-ranking-answer__rank').text('-');

        Object.entries(this._question.values).forEach(([code, value]) => {
            this._getAnswerNode(code).addClass('cf-ranking-answer--selected');
            this._getAnswerRankNode(code).text(value);
        });
    }

    /* Control handlers */
    _attachControlHandlers() {
        this.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', ()=> this._onAnswerClick(answer));
            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => { e.stopPropagation(); });
                otherInput.on('input', e => this._onOtherInputValueChanged(answer, e.target.value));
            }
        });
    }

    _onAnswerClick(answer) {
        if (!this._isSelected(answer)) {
            this._selectAnswer(answer);
            if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])){
                this._getAnswerOtherNode(answer.code).focus();
            }
        }
        else {
            this._unselectAnswer(answer);
        }
    }

    _isSelected(answer) {
        return !Utils.isNotANumber(this._question.values[answer.code]);
    }

    _selectAnswer(answer) {
        const valuesArray = Object.values(this._question.values);
        const maxValue = valuesArray.length;

        this._question.setValue(answer.code, maxValue + 1);
    }

    _unselectAnswer(answer) {
        const oldValue = this._question.values[answer.code];

        this._question.setValue(answer.code, null);
        Object.entries(this._question.values).forEach(([code, value]) => {
            if (value > oldValue)
                this._question.setValue(code, value - 1);
        });
    }

    _onOtherInputValueChanged(answer, otherValue) {
        this._question.setOtherValue(answer.code, otherValue);

        if (!this._isSelected(answer) && !Utils.isEmpty(otherValue)){
            this._selectAnswer(answer);
        }
    }
}


