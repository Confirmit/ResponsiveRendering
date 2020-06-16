import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from './../../utils.js';
import KEYS from '../helpers/keyboard-keys';
import ValidationTypes from '../../api/models/validation/validation-types';

export default class RankingQuestionView extends QuestionWithAnswersView {
    /**
     * @param {RankingQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._selectedAnswerClass = 'cf-ranking-answer--selected';
        this._currentAnswerIndex = null;

        this._rankingStatusNode = this._container.find('.cf-ranking-status');

        this._storedOtherValues = {...this._question.otherValues};

        this._attachHandlersToDOM();
    }

    _getAnswerRankNode(code) {
        return this._getAnswerNode(code).find('.cf-ranking-answer__rank');
    }

    get _currentAnswer() {
        return this.answers[this._currentAnswerIndex];
    }

    /**
     * @param {AnswerValidationResult} validationResult
     * @private
     */
    _showAnswerError(validationResult) {
        if (this._settings.isAccessible) {
            this._showAccessibleError(validationResult);
            return;
        }

        const target = this._getAnswerNode(validationResult.answerCode);
        const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
        const errors = validationResult.errors.map(error => error.message);
        this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);

        const otherErrors = validationResult.errors.filter(error => error.type === ValidationTypes.OtherRequired);
        if (otherErrors.length > 0) {
            this._getAnswerOtherNode(validationResult.answerCode)
                .attr('aria-errormessage', errorBlockId)
                .attr('aria-invalid', 'true');
        }
    }

    _showAccessibleError(validationResult) {
        const answerErrors = [];
        const otherErrors = [];
        validationResult.errors.forEach(error => {
            if (error.type === ValidationTypes.OtherRequired) {
                otherErrors.push(error.message);
            } else {
                answerErrors.push(error.message);
            }
        });

        if (answerErrors.length > 0) {
            const answerNode = this._getAnswerNode(validationResult.answerCode);
            const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
            this._answerErrorBlockManager.showErrors(errorBlockId, answerNode, answerErrors);
        }

        if (otherErrors.length > 0) {
            const otherNode = this._getAnswerOtherNode(validationResult.answerCode);
            const otherErrorBlockId = this._getAnswerOtherErrorBlockId(validationResult.answerCode);
            otherNode
                .attr('aria-errormessage', otherErrorBlockId)
                .attr('aria-invalid', 'true');
            this._answerErrorBlockManager.showErrors(otherErrorBlockId, otherNode, otherErrors);
        }
    }

    _hideErrors() {
        super._hideErrors();
        this._question.answers.filter(answer => answer.isOther).forEach(answer => {
            this._getAnswerOtherNode(answer.code)
                .removeAttr('aria-errormessage')
                .removeAttr('aria-invalid');
        });
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code)
                .removeClass(this._selectedAnswerClass)
                .attr('aria-pressed', 'false');
            this._getAnswerRankNode(answer.code).text('-');
        });

        Object.entries(this._question.values).forEach(([code, value]) => {
            this._getAnswerNode(code)
                .addClass(this._selectedAnswerClass)
                .attr('aria-pressed', 'true');
            this._getAnswerRankNode(code).text(value);
        });
    }

    _updateAnswerOtherNodes({values = [], otherValues = []}) {
        if (values.length > 0) {
            this._question.answers.filter(answer => answer.isOther).forEach(answer => {
                this._getAnswerOtherNode(answer.code)
                    .attr('tabindex', '-1')
                    .attr('aria-hidden', 'true');
            });

            Object.keys(this._question.values)
                .filter(answerCode => this._question.getAnswer(answerCode).isOther)
                .forEach(answerCode => {
                    this._getAnswerOtherNode(answerCode)
                        .attr('tabindex', '0')
                        .attr('aria-hidden', 'false');
                });

            values.forEach(answerCode => {
                const checked = Object.keys(this._question.values).includes(answerCode);
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
            const checked = Object.keys(this._question.values).includes(answerCode);
            if (!checked) {
                this._storedOtherValues[answerCode] = this._question.otherValues[answerCode];
                this._question.setOtherValue(answerCode, null);
            }
        });
    }

    _attachHandlersToDOM() {
        this.answers.forEach((answer, index) => {
            this._getAnswerNode(answer.code).on('click', () => this._onAnswerClick(answer));
            this._getAnswerNode(answer.code).on('focus', () => this._onAnswerNodeFocus(index));

            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('keydown', e => e.stopPropagation());
                otherInput.on('focus', () => this._onAnswerOtherNodeFocus(answer));
                otherInput.on('input', e => this._onOtherInputValueChanged(answer, e.target.value));
            }
        });

        if (!this._settings.disableKeyboardSupport) {
            this._container.on('keydown', this._onKeyPress.bind(this));
        }
    }

    _toggleAnswer(answer) {
        if (!this._isSelected(answer)) {
            this._selectAnswer(answer);
            if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
                this._getAnswerOtherNode(answer.code).focus();
            }
        } else {
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

    _updateRankingStatus() {
        /*
            should read in all cases:
            1) if answer selected
            2) if unselected all answers
            3) if other input value is changed
         */
        const answersStatuses = [];
        Object.entries(this._question.values).sort((a, b) => a[1] - b[1]).forEach(([answerCode, rank]) => {
            const answer = this._question.getAnswer(answerCode);
            let answerStatus = `${rank} ${answer.text}`;
            if (answer.isOther && !Utils.isEmpty(this._question.otherValues[answerCode])) {
                answerStatus += `(${this._question.otherValues[answerCode]})`;
            }

            answersStatuses.push(answerStatus);
        });

        const status = `${this._question.text}: ${answersStatuses.join(', ')}`;
        this._rankingStatusNode.html(status);
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);
        this._updateRankingStatus(changes);
        this._updateStoredOtherValues(changes);
    }

    _onAnswerClick(answer) {
        this._toggleAnswer(answer);
    }

    _onAnswerNodeFocus(answerIndex) {
        this._currentAnswerIndex = answerIndex;
    }

    _onAnswerOtherNodeFocus(answer) {
        if (Utils.isEmpty(this._storedOtherValues[answer.code]) || !Utils.isEmpty(this._question.values[answer.code])) {
            return;
        }

        this._selectAnswer(answer);
    }

    _onOtherInputValueChanged(answer, otherValue) {
        this._question.setOtherValue(answer.code, otherValue);

        if (!this._isSelected(answer) && !Utils.isEmpty(otherValue)) {
            this._selectAnswer(answer);
        }
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


