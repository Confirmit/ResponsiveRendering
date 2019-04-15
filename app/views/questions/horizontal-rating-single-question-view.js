import QuestionWithAnswersView from './base/question-with-answers-view.js';
import KEYS from 'views/helpers/keyboard-keys.js';

export default class HorizontalRatingSingleQuestionView extends QuestionWithAnswersView {
    /**
     * @param {SingleRatingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._groupNode = this._container.find('.cf-hrs-single');
        this._selectedScaleItemClass = 'cf-hrs-single__scale-item--selected';
        this._selectedNonScoredItemClass = 'cf-hrs-single__na-item--selected';
        this._currentAnswerIndex = null;
        this._sortedAnswers = this._question.scaleItems.concat(this._question.nonScaleItems);

        this._attachHandlersToDOM();
    }

    get answers() {
        return this._sortedAnswers;
    }

    get _currentAnswer() {
        return this.answers[this._currentAnswerIndex];
    }

    _attachHandlersToDOM() {
        this.answers.forEach((answer, index) => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));
            this._getAnswerNode(answer.code).on('focus', this._onAnswerNodeFocus.bind(this, index));
        });

        if (!this._settings.disableKeyboardSupport) {
            this._container.on('keydown', this._onKeyPress.bind(this));
        }
    }

    _isItemInScale(answerCode) {
        return this._question.scaleItems.find(item => item.code === answerCode) !== undefined;
    }

    _selectAnswer(answer) {
        this._question.setValue(answer.code);
    }

    _updateAnswerNodes() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code)
                .removeClass(this._selectedScaleItemClass)
                .removeClass(this._selectedNonScoredItemClass)
                .attr('aria-checked', 'false')
                .attr('tabindex', '-1');
        });

        if(this._question.value === null) {
            this._getAnswerNode(this.answers[0].code)
                .attr('tabindex', '0');
            return;
        }

        const itemNodeClass = this._isItemInScale(this._question.value) ? this._selectedScaleItemClass : this._selectedNonScoredItemClass;
        this._getAnswerNode(this._question.value)
            .addClass(itemNodeClass)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');
    }

    /**
     * @param {QuestionValidationResult} validationResult
     * @protected
     */
    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._groupNode.attr("aria-invalid", "true");
    }

    _hideErrors() {
        super._hideErrors();
        this._groupNode.attr("aria-invalid", "false");
    }

    _getPreviousAnswerIndex() {
        if (this._currentAnswerIndex > 0) {
            return this._currentAnswerIndex - 1;
        } else {
            return this.answers.length - 1;
        }

    }

    _getNextAnswerIndex() {
        if (this._currentAnswerIndex < this.answers.length - 1) {
            return this._currentAnswerIndex + 1;
        } else {
            return 0;
        }
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
    }

    _onAnswerNodeClick(answer) {
       this._selectAnswer(answer);
    }

    _onKeyPress(event) {
        this._onArrowKeyPress(event);
        this._onSelectKeyPress(event);
    }

    _onArrowKeyPress(event) {
        if ([KEYS.ArrowUp, KEYS.ArrowLeft, KEYS.ArrowRight, KEYS.ArrowDown].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswerIndex === null) {
            return;
        }

        event.preventDefault();

        let nextAnswer = null;
        switch (event.keyCode) {
            case KEYS.ArrowUp:
            case KEYS.ArrowLeft:
                nextAnswer = this.answers[this._getPreviousAnswerIndex()];
                break;
            case KEYS.ArrowRight:
            case KEYS.ArrowDown:
                nextAnswer = this.answers[this._getNextAnswerIndex()];
                break;
        }

        this._selectAnswer(nextAnswer);
        this._getAnswerNode(nextAnswer.code).focus();
    }

    _onSelectKeyPress(event) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswer === null) {
            return;
        }

        event.preventDefault();

        this._selectAnswer(this._currentAnswer);
    }

    _onAnswerNodeFocus(answerIndex) {
        this._currentAnswerIndex = answerIndex;
    }
}