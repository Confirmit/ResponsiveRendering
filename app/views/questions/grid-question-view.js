import QuestionWithAnswerView from './base/question-with-answers-view.js';

export default class GridQuestionView extends QuestionWithAnswerView {
    constructor(question) {
        super(question);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        const itemClickHandler = (answer, scale) => {
            this._getScaleNode(answer.code, scale.code).on('click', this._onSelectItem.bind(this, answer, scale));
        };

        this._question.answers.forEach(answer => {
            this._question.scales.forEach(scale => itemClickHandler(answer, scale));

            if(answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherValueChangedHandler(answer, event.target.value);
                });
            }
        });
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0)
            return;

        this._container.find('.cf-grid-answer__scale-item').removeClass('cf-grid-answer__scale-item--selected');
        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getScaleNode(answerCode, scaleCode).addClass('cf-grid-answer__scale-item--selected');
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerScaleNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _onSelectItem(answer, scale) {
        this._question.setValue(answer.code, scale.code);
    }

    _onAnswerOtherValueChangedHandler(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }
}