import QuestionWithAnswersView from './base/question-with-answers-view.js';

export default class HorizontalRatingSingleQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        const itemClickHandler = answer => {
            this._getAnswerNode(answer.code).on('click', this._onSelectItem.bind(this, answer));
        };

        this._question.scaleItems.forEach(itemClickHandler);
        this._question.nonScaleItems.forEach(itemClickHandler);
    }

    _updateScaleNodes() {
        this._container.find('.cf-hrs-single__scale-item').removeClass('cf-hrs-single__scale-item--selected');
        this._container.find('.cf-hrs-single__na-item').removeClass('cf-hrs-single__na-item--selected');

        if(this._question.value === null) {
            return;
        }

        const itemInScale = this._question.scaleItems.find(item => item.code === this._question.value) !== undefined;
        const itemNodeClass = itemInScale ? 'cf-hrs-single__scale-item--selected' : 'cf-hrs-single__na-item--selected';
        this._getAnswerNode(this._question.value).addClass(itemNodeClass);
    }

    /* Handlers */
    _onModelValueChange() {
        this._updateScaleNodes();
    }

    _onSelectItem(answer) {
        this._question.setValue(answer.code);
    }
}