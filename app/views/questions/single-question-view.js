import QuestionWithAnswersView from './base/question-with-answers-view.js';
import KEYS from 'views/helpers/keyboard-keys.js';
import Utils from './../../utils.js';
import ValidationTypes from '../../api/models/validation/validation-types';
import CollapsibleGroup from '../controls/collapsible-group';
import GroupTypes from '../../api/group-types';

export default class SingleQuestionView extends QuestionWithAnswersView {
    /**
     * @param {SingleQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._groupNode = this._container.find('.cf-list');
        this._currentAnswerIndex = null;
        this._collapsibleGroups = this._createCollapsibleGroups();

        this._selectedAnswerCssClass = 'cf-single-answer--selected';
        this._selectedImageAnswerCssClass = 'cf-answer-image--selected';

        this._storedOtherValues = {};

        this._attachHandlersToDOM();
        this._fillStoredOtherValues()
    }

    get _currentAnswer() {
        return this.answers[this._currentAnswerIndex];
    }

    _createCollapsibleGroups() {
        const prepareCollapsibleGroupShortInfo = (question, group) => {
            const answer = question.getAnswer(question.value);
            return group.items.includes(answer) ? [answer.isOther ? question.otherValue : answer.text] : [];
        };

        return this._question.answerGroups
            .filter(group => group.type === GroupTypes.Collapsible)
            .map(group => new CollapsibleGroup(this._question, group, prepareCollapsibleGroupShortInfo));
    }

    _fillStoredOtherValues(){
        if(this._question.value !== null){
            this._storedOtherValues[this._question.value] = this._question.otherValue;
        }
    }

    _attachHandlersToDOM() {
        this.answers.forEach((answer, index) => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));
            this._getAnswerNode(answer.code).on('focus', this._onAnswerNodeFocus.bind(this, index));

            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('keydown', e => e.stopPropagation());
                otherInput.on('focus', () => this._onAnswerOtherNodeFocus(answer));
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });

        if (!this._settings.disableKeyboardSupport) {
            this._container.on('keydown', this._onKeyPress.bind(this));
        }
    }

    _selectAnswer(answer) {
        this._question.setValue(answer.code);

        if (answer.isOther) {
            const otherInput = this._getAnswerOtherNode(answer.code);
            this._question.setOtherValue(otherInput.val());
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _updateAnswerNodes({value}) {
        if (value === undefined) {
            return;
        }

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code)
                .removeClass(this._getSelectedAnswerClass(answer))
                .attr('aria-checked', 'false')
                .attr('tabindex', '-1');
        });

        if (this._question.value === null) {
            this._getAnswerNode(this._question.answers[0].code)
                .attr('tabindex', '0');
            return;
        }

        this._getAnswerNode(this._question.value)
            .addClass(this._getSelectedAnswerClass(this._question.getAnswer(this._question.value)))
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');
    }

    _updateStoredOtherValues({otherValue = null}){
        if (!otherValue) {
            return;
        }

        this._storedOtherValues[this._question.value] = this._question.otherValue;
    }

    _getSelectedAnswerClass(answer) {
        return answer.imagesSettings !== null ? this._selectedImageAnswerCssClass : this._selectedAnswerCssClass;
    }

    _updateAnswerOtherNodes() {
        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            if(this._question.value !== answer.code) {
                this._setOtherNodeValue(answer.code, null);
            }
            
            this._getAnswerOtherNode(answer.code)
                .attr('tabindex', '-1')
                .attr('aria-hidden', 'true');
        });

        if (this._question.value === null) {
            return;
        }

        if (this._question.getAnswer(this._question.value).isOther) {
            this._getAnswerOtherNode(this._question.value)
                .attr('tabindex', '0')
                .attr('aria-hidden', 'false');
        }

        this._setOtherNodeValue(this._question.value, this._question.otherValue);
    }

    /**
     * @param {QuestionValidationResult} validationResult
     * @protected
     */
    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._updateRadioGroupAriaInvalidState(validationResult);
    }

    /**
     * @param {AnswerValidationResult} validationResult
     * @protected
     */
    _showAnswerError(validationResult) {
        super._showAnswerError(validationResult);
        this._addAriaValidationAttributesToAnswerOther(validationResult);
    }

    /**
     * @param {AnswerValidationResult} validationResult
     * @protected
     */
    _addAriaValidationAttributesToAnswerOther(validationResult) {
        const otherErrors = validationResult.errors.filter(error => error.type === ValidationTypes.OtherRequired);
        if (otherErrors.length === 0) {
            return;
        }

        const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
        const otherNode = this._getAnswerOtherNode(validationResult.answerCode);
        otherNode
            .attr('aria-errormessage', errorBlockId)
            .attr('aria-invalid', 'true');
    }

    _updateRadioGroupAriaInvalidState(validationResult) {
        const hasNotOnlyOtherErrors = validationResult.errors.length > 0
            || validationResult.answerValidationResults.filter(result => result.isValid === false)
                .some(result => result.errors.some(error => error.type !== ValidationTypes.OtherRequired));
        if (hasNotOnlyOtherErrors === false) {
            return;
        }

        this._groupNode.attr('aria-invalid', 'true');
    }

    _hideErrors() {
        super._hideErrors();

        this._groupNode.attr('aria-invalid', 'false');

        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            this._getAnswerOtherNode(answer.code)
                .removeAttr('aria-errormessage')
                .removeAttr('aria-invalid');
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
        this._updateStoredOtherValues(changes);
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
                if (this._currentAnswerIndex > 0) {
                    nextAnswer = this.answers[this._currentAnswerIndex - 1];
                } else {
                    nextAnswer = this.answers[this.answers.length - 1];
                }
                break;
            case KEYS.ArrowRight:
            case KEYS.ArrowDown:
                if (this._currentAnswerIndex < this.answers.length - 1) {
                    nextAnswer = this.answers[this._currentAnswerIndex + 1];
                } else {
                    nextAnswer = this.answers[0];
                }
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

    _onAnswerOtherNodeFocus(answer) {
        if (Utils.isEmpty(this._storedOtherValues[answer.code])) {
            return;
        }

        this._question.setValue(answer.code);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if (!Utils.isEmpty(otherValue)) { // select answer
            this._question.setValue(answer.code);
        }

        if (this._question.value === answer.code) { // update other value for currently selected answer
            this._question.setOtherValue(otherValue);
        }
    }
}

