import QuestionWithAnswersView from './base/question-with-answers-view.js';
import FloatingLabels from '../controls/floating-labels.js';

export default class StarRatingQuestionView extends QuestionWithAnswersView {
    /**
     * @param {GridRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

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
        if(values.length === 0)
            return;

        this._container.find('.cf-sr-grid-answer__scale-item').removeClass('cf-sr-grid-answer__scale-item--selected');
        this._container.find('.cf-sr-grid-answer__na-item').removeClass('cf-sr-grid-answer__na-item--selected');

        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            let scaleIndex = this._question.scaleItems.findIndex(item => item.code === scaleCode);
            if(scaleIndex !== -1) {
                this._question.scaleItems.forEach((item, index) => {
                    if (index <= scaleIndex) {
                        this._getScaleNode(answerCode, item.code).addClass('cf-sr-grid-answer__scale-item--selected');
                    }
                });
            }
            else {
                this._getScaleNode(answerCode, scaleCode).addClass('cf-sr-grid-answer__na-item--selected');
            }
        });
    }

    _initFloatingLabels() {
        const panel = this._container.find('.cf-sr-grid-answer--fake-for-panel .cf-label-panel');
        const lastItem = this._container.find('.cf-sr-grid-answer:last-child .cf-sr-grid-answer__scale').last();
        new FloatingLabels(panel, lastItem, this._settings.mobileThreshold);
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