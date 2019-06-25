import QuestionWithAnswerView from './base/question-with-answers-view.js';
import KEYS from "../helpers/keyboard-keys";
import ValidationTypes from "../../api/models/validation/validation-types";

export default class GridQuestionView extends QuestionWithAnswerView {
    /**
     * @param {GridQuestionBase} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._currentAnswerIndex = null;
        this._currentScaleIndex = null;

        this._selectedScaleCssClass = 'cf-grid-answer__scale-item--selected';
        this._selectedImageScaleCssClass = 'cf-answer-image--selected';
        this._scaleGroupCssClass = 'cf-grid-answer__scale';

        this._attachHandlersToDOM();
    }

    get _scales() {
        return this._question.scales;
    }

    get _currentAnswer() {
        return this._question.answers[this._currentAnswerIndex];
    }

    get _currentScale() {
        return this._scales[this._currentScaleIndex];
    }

    _getSelectedScaleClass(scale){
        return scale.imagesSettings !== null ? this._selectedImageScaleCssClass : this._selectedScaleCssClass;
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach((answer, answerIndex) => {
            this._scales.forEach((scale, scaleIndex) => {
                this._getScaleNode(answer.code, scale.code)
                    .on('click', event => this._onScaleNodeClick(event, answer, scale))
                    .on('focus', this._onScaleNodeFocus.bind(this, answerIndex, scaleIndex));
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code)
                    .on('keydown', event => this._onAnswerOtherValueKeyPress(event, answer))
                    .on('input', event => this._onAnswerOtherValueChangedHandler(answer, event.target.value));
            }
        });

        if (!this._settings.disableKeyboardSupport) {
            this._container.on('keydown', this._onKeyPress.bind(this));
        }
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0)
            return;

        values.forEach(answerCode => {
            this._scales.forEach(scale => {
                this._clearScaleNode(answerCode, scale.code);
            });

            const scaleCode = this._question.values[answerCode];
            if (scaleCode === undefined) {
                this._getScaleNode(answerCode, this._scales[0].code)
                    .attr('tabindex', '0');
            } else {
                this._selectScaleNode(answerCode, scaleCode);
            }
        });
    }

    _clearScaleNode(answerCode, scaleCode) {
        this._getScaleNode(answerCode, scaleCode)
            .removeClass(this._getSelectedScaleClass(this._question.getScale(scaleCode)))
            .attr('aria-checked', 'false')
            .attr('tabindex', '-1');
    }

    _selectScaleNode(answerCode, scaleCode) {
        this._getScaleNode(answerCode, scaleCode)
            .addClass(this._getSelectedScaleClass(this._question.getScale(scaleCode)))
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');
    }

    _selectScale(answer, scale) {
        this._question.setValue(answer.code, scale.code);
    }

    _showAnswerError(validationResult) {

        //super._showAnswerError(result); TODO: is it possible to re-use?

        const answer = this._question.getAnswer(validationResult.answerCode);
        const targetNode = answer.isOther
            ? this._getAnswerOtherNode(answer.code)
            : this._getAnswerTextNode(answer.code);
        const errorBlockId = this._getAnswerErrorBlockId(answer.code);
        const errors = validationResult.errors.map(error => error.message);
        this._answerErrorBlockManager.showErrors(errorBlockId, targetNode, errors);

        const otherErrors = validationResult.errors.filter(error => error.type === ValidationTypes.OtherRequired);
        if (otherErrors.length > 0) {
            this._getAnswerOtherNode(validationResult.answerCode)
                .attr('aria-errormessage', errorBlockId)
                .attr('aria-invalid', 'true');
        }

        const answerHasNotOnlyOtherErrors = validationResult.errors.length > otherErrors.length;
        if (answerHasNotOnlyOtherErrors) {
            this._getAnswerNode(answer.code).find(`.${this._scaleGroupCssClass}`)
                .attr("aria-invalid", "true")
                .attr("aria-errormessage", errorBlockId);
        }
    }

    _hideErrors() {
        super._hideErrors();

        this._container.find(`.${this._scaleGroupCssClass}`)
            .removeAttr("aria-invalid")
            .removeAttr("aria-errormessage");

        this._container.find('.cf-text-box')
            .removeAttr('aria-errormessage')
            .removeAttr('aria-invalid');
    }

    _onModelValueChange({changes}) {
        this._updateAnswerScaleNodes(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _onScaleNodeClick(event, answer, scale) {
        this._selectScale(answer, scale);
    }

    _onAnswerOtherValueChangedHandler(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }

    // eslint-disable-next-line no-unused-vars
    _onAnswerOtherValueKeyPress(event, answer) {
        event.stopPropagation();
    }

    _onScaleNodeFocus(answerIndex, scaleIndex) {
        this._currentAnswerIndex = answerIndex;
        this._currentScaleIndex = scaleIndex;
    }

    _onKeyPress(event) {
        this._onArrowKeyPress(event);
        this._onSelectKeyPress(event);
    }

    _onArrowKeyPress(event) {
        if ([KEYS.ArrowUp, KEYS.ArrowLeft, KEYS.ArrowRight, KEYS.ArrowDown].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswerIndex === null || this._currentScaleIndex === null) {
            return;
        }

        event.preventDefault();

        let nextScale = null;
        switch (event.keyCode) {
            case KEYS.ArrowUp:
            case KEYS.ArrowLeft:
                if (this._currentScaleIndex > 0) {
                    nextScale = this._scales[this._currentScaleIndex - 1];
                } else {
                    nextScale = this._scales[this._scales.length - 1];
                }

                break;
            case KEYS.ArrowRight:
            case KEYS.ArrowDown:
                if (this._currentScaleIndex < this._scales.length - 1) {
                    nextScale = this._scales[this._currentScaleIndex + 1];
                } else {
                    nextScale = this._scales[0];
                }
                break;
        }

        this._selectScale(this._currentAnswer, nextScale);
        this._getScaleNode(this._currentAnswer.code, nextScale.code).focus();
    }

    _onSelectKeyPress(event) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswerIndex === null || this._currentScaleIndex === null) {
            return;
        }

        event.preventDefault();

        this._selectScale(this._currentAnswer, this._currentScale);
    }
}