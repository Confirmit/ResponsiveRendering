import QuestionWithAnswersView from './base/question-with-answers-view.js';
import FloatingLabels from '../controls/floating-labels.js';

export default class HorizontalRatingGridQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._attachHandlersToDOM();
        this._initFloatingLabels();
    }

    _attachHandlersToDOM() {
        const itemClickHandler = (answer, scale) => {
            this._getScaleNode(answer.code, scale.code).on('click', this._onSelectItem.bind(this, answer, scale));
        };

        this._question.answers.forEach(answer => {
            this._question.scaleItems.forEach(scale => itemClickHandler(answer, scale));
            this._question.nonScaleItems.forEach(scale => itemClickHandler(answer, scale));

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

        this._container.find('.cf-hrs-grid-answer__scale-item').removeClass('cf-hrs-grid-answer__scale-item--selected');
        this._container.find('.cf-hrs-grid-answer__na-item').removeClass('cf-hrs-grid-answer__na-item--selected');
        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            let itemInScale = this._question.scaleItems.find(item => item.code === scaleCode) !== undefined;
            let itemNodeClass = itemInScale ? 'cf-hrs-grid-answer__scale-item--selected' : 'cf-hrs-grid-answer__na-item--selected';
            this._getScaleNode(answerCode, scaleCode).addClass(itemNodeClass);
        });
    }

    _initFloatingLabels() {
        const panel = this._container.find('.cf-hrs-grid-answer--first .cf-label-panel');
        const lastItem = this._container.find('.cf-hrs-grid-answer:last-child .cf-hrs-grid-answer__scale').last();
        new FloatingLabels(panel, lastItem);
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