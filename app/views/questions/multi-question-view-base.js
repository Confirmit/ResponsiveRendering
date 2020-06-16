import QuestionWithAnswersView from './base/question-with-answers-view';
import Utils from './../../utils';
import KEYS from '../helpers/keyboard-keys';
import ValidationTypes from '../../api/models/validation/validation-types';
import CollapsibleGroup from '../controls/collapsible-group';
import GroupTypes from '../../api/group-types';

export default class MultiQuestionViewBase extends QuestionWithAnswersView {
    /**
     * @param {QuestionWithAnswers} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._currentAnswerIndex = null;
        this._collapsibleGroups = this._createCollapsibleGroups();

        this._selectedAnswerCssClass = 'cf-multi-answer--selected';
        this._selectedImageAnswerCssClass = 'cf-answer-image--selected';

        this._storedOtherValues = {...this._question.otherValues};

        this._attachHandlersToDOM();
    }

    get _currentAnswer() {
        return this.answers[this._currentAnswerIndex];
    }

    /**
     * @type {Array} list of selected answer codes
     * @protected
     * @abstract
     */
    _getSelectedAnswerCodes() {
        throw 'Not implemented exception';
    }

    /**
     * @param {Answer} answer
     * @protected
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    _selectAnswer(answer) {
        throw 'Not implemented exception';
    }

    /**
     * @param {Answer} answer
     * @protected
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    _unselectAnswer(answer) {
        throw 'Not implemented exception';
    }

    _createCollapsibleGroups() {
        const prepareCollapsibleGroupShortInfo = (question, group) => {
            return group.items
                .filter(answer => this._getSelectedAnswerCodes().includes(answer.code))
                .map(answer => answer.isOther ? question.otherValues[answer.code] : answer.text)
                .filter(shortInfoText => !Utils.isEmpty(shortInfoText));
        };

        return this._question.answerGroups
            .filter(group => group.type === GroupTypes.Collapsible)
            .map(group => new CollapsibleGroup(this._question, group, prepareCollapsibleGroupShortInfo));
    }

    _attachHandlersToDOM() {
        this.answers.forEach((answer, index) => {
            this._getAnswerNode(answer.code).on('click', () => this._onAnswerNodeClick(answer));
            this._getAnswerNode(answer.code).on('focus', this._onAnswerNodeFocus.bind(this, index));

            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('keydown', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
                otherInput.on('focus', () => this._onAnswerOtherNodeFocus(answer));
            }
        });

        if (!this._settings.disableKeyboardSupport) {
            this._container.on('keydown', this._onKeyPress.bind(this));
        }
    }

    _getSelectedAnswerClass(answer) {
        return answer.imagesSettings !== null ? this._selectedImageAnswerCssClass : this._selectedAnswerCssClass;
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code)
                .removeClass(this._getSelectedAnswerClass(answer))
                .attr('aria-checked', false);
        });

        this._getSelectedAnswerCodes().forEach(answerCode => {
            this._getAnswerNode(answerCode)
                .addClass(this._getSelectedAnswerClass(this._question.getAnswer(answerCode)))
                .attr('aria-checked', true);
        });
    }

    _updateAnswerOtherNodes({values = [], otherValues = []}) {
        if (values.length > 0) {
            this._question.answers.filter(answer => answer.isOther).forEach(answer => {
                this._getAnswerOtherNode(answer.code)
                    .attr('tabindex', '-1')
                    .attr('aria-hidden', 'true');
            });

            this._getSelectedAnswerCodes()
                .filter(answerCode => this._question.getAnswer(answerCode).isOther)
                .forEach(answerCode => {
                    this._getAnswerOtherNode(answerCode)
                        .attr('tabindex', '0')
                        .attr('aria-hidden', 'false');
                });

            values.forEach(answerCode => {
                const checked = this._getSelectedAnswerCodes().includes(answerCode);
                const cached = !Utils.isEmpty(this._storedOtherValues[answerCode]);

                if (checked && cached) {
                    this._question.setOtherValue(answerCode, this._storedOtherValues[answerCode]);
                    delete this._storedOtherValues[answerCode];
                }
            });
        }

        super._updateAnswerOtherNodes({otherValues});
    }

    _updateStoredOtherValues({values = []}) {
        values.forEach(answerCode => {
            const checked = this._getSelectedAnswerCodes().includes(answerCode);
            if (!checked) {
                this._storedOtherValues[answerCode] = this._question.otherValues[answerCode];
                this._question.setOtherValue(answerCode, null);
            }
        });
    }

    _isSelected(answer) {
        return this._getSelectedAnswerCodes().includes(answer.code);
    }

    _toggleAnswer(answer) {
        const newValue = !this._isSelected(answer);
        if (newValue) {
            this._selectAnswer(answer);
        } else {
            this._unselectAnswer(answer);
        }

        if (newValue && answer.isOther) {
            const otherInput = this._getAnswerOtherNode(answer.code);
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _setQuestionOtherValue(answer, otherValue) {
        this._question.setOtherValue(answer.code, otherValue);

        if (!this._isSelected(answer) && !Utils.isEmpty(otherValue)) {
            this._selectAnswer(answer);
        }
    }

    /**
     * @param {QuestionValidationResult} validationResult
     * @protected
     */
    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._updateGroupAriaInvalidState(validationResult);
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

    _updateGroupAriaInvalidState(validationResult) {
        if (validationResult.isValid) {
            return;
        }

        const hasNotOnlyOtherErrors = validationResult.errors.length > 0
            || validationResult.answerValidationResults.filter(result => result.isValid === false)
                .some(result => result.errors.some(error => error.type !== ValidationTypes.OtherRequired));
        if (hasNotOnlyOtherErrors === false) {
            return;
        }

        this._container.find('.cf-list').attr('aria-invalid', 'true');
    }

    _hideErrors() {
        super._hideErrors();

        this._container.find('.cf-list').attr('aria-invalid', 'false');

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
        this._toggleAnswer(answer);
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        this._setQuestionOtherValue(answer, otherValue);
    }

    _onAnswerNodeFocus(answerIndex) {
        this._currentAnswerIndex = answerIndex;
    }

    _onAnswerOtherNodeFocus(answer) {
        if (Utils.isEmpty(this._storedOtherValues[answer.code])) {
            return;
        }

        this._selectAnswer(answer);
    }

    _onKeyPress(event) {
        this._onSelectKeyPress(event);
    }

    _onSelectKeyPress(event) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswer === null) {
            return;
        }

        event.preventDefault();

        this._toggleAnswer(this._currentAnswer);
    }
}