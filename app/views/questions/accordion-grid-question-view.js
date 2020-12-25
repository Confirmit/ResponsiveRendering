import QuestionWithAnswersView from "./base/question-with-answers-view";
import Accordion from "./../controls/accordion";
import CollapsingPanel from "../controls/collapsing-panel";
import Utils from "../../utils";
import questionHelper from "../helpers/question-helper";
import $ from "jquery";
import KEYS from "../helpers/keyboard-keys";
import ValidationTypes from "../../api/models/validation/validation-types";

export default class AccordionGridQuestionView extends QuestionWithAnswersView {
    constructor(question, settings) {
        super(question, settings);

        this._currentAnswerIndex = null;
        this._currentScaleIndex = null;

        this._accordion = new Accordion(this.answers.map(answer =>
            new CollapsingPanel(this._getAnswerNode(answer.code).find('.cf-collapsing-panel'))
        ));

        this._selectedScaleCssClass = 'cf-accordion-grid-answer__scale-item--selected';

        this._init();
    }

    get _scales() {
        return this._question.scales;
    }

    get _currentAnswer() {
        return this._question.answers[this._currentAnswerIndex] || null;
    }

    get _currentScale() {
        return this._scales[this._currentScaleIndex] || null;
    }

    _getAnswerTitleNode(answerCode) {
        return $(`#${this._question.id}_${answerCode}_title`);
    }

    _getAnswerContentNode(answerCode) {
        return $(`#${this._question.id}_${answerCode}_content`);
    }

    _getAnswerSelectedScalesListNode(answerCode) {
        return this._getAnswerNode(answerCode).find('.cf-accordion-grid-answer__selected-list');
    }

    _getScaleGroupNode(answerCode) {
        return this._getAnswerNode(answerCode).find('[role="radiogroup"]');
    }

    _init() {
        this._attachControlHandlers();
    }

    _attachControlHandlers() {
        this.answers.forEach((answer, answerIndex) => {
            this._question.scales.forEach((scale, scaleIndex) => {
                this._getScaleNode(answer.code, scale.code)
                    .on('click', this._onScaleNodeClick.bind(this, answer, scale))
                    .on('focus', this._onScaleNodeFocus.bind(this, answerIndex, scaleIndex));
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code)
                    .on('input', event => this._onAnswerOtherValueChange(answer.code, event.target.value))
                    .on('click', event => event.stopPropagation());
            }
        });

        this._accordion.panels.forEach((item, index) => item.toggleEvent.on(() => this._onCollapsingPanelsToggle(item, index)));

        if (!this._settings.disableKeyboardSupport) {
            this.answers.forEach((answer, answerIndex) => {
                this._getAnswerTitleNode(answer.code)
                    .on('keydown', this._onAnswerTitleKeyDown.bind(this, answerIndex));

                this._getScaleGroupNode(answer.code)
                    .on('keydown', this._onGroupNodeKeyDown.bind(this));

                if (answer.isOther) {
                    this._getAnswerOtherNode(answer.code).on('keydown', event =>
                        this._onAnswerOtherNodeKeyDown(event, answer, answerIndex));
                }

                this._scales.forEach(scale => {
                    this._getScaleNode(answer.code, scale.code)
                        .on('keydown', this._onScaleNodeKeyDown.bind(this));
                });
            });
        }
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0) {
            return;
        }

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
            .removeClass(this._selectedScaleCssClass)
            .attr('aria-checked', 'false')
            .attr('tabindex', '-1');
    }

    _selectScaleNode(answerCode, scaleCode) {
        this._getScaleNode(answerCode, scaleCode)
            .addClass(this._selectedScaleCssClass)
            .attr('aria-checked', 'true')
            .attr('tabindex', '0');
    }

    _openNextPanel() {
        const openPanelIndex = this._accordion.getOpenPanelIndex();
        if(openPanelIndex === -1){
            return;
        }

        if (openPanelIndex >= this._accordion.panels.length - 1) {
            this._accordion.closePanel(openPanelIndex);
            return;
        }

        this._accordion.openPanel(openPanelIndex + 1);
        this._getAnswerTitleNode(this._question.answers[openPanelIndex + 1].code).focus();
    }

    _updateSelectedAnswers({values = []}) {
        if (values.length === 0) {
            return;
        }

        this._container.find('.cf-accordion-grid-answer__selected-list').empty();
        Object.keys(this._question.values).forEach(answerCode => {
            const scaleCode = this._question.values[answerCode];
            const scaleText = this._question.scales.find(scale => scale.code === scaleCode).text;
            this._getAnswerSelectedScalesListNode(answerCode).append(`<div class="cf-accordion-grid-answer__selected-item">${scaleText}</div>`);
        });
    }

    _selectScale(answer, scale) {
        this._question.setValue(answer.code, scale.code);

        if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
            this._getAnswerOtherNode(answer.code).focus();
        }
    }

    _showAnswerError(validationResult) {
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
            this._getScaleGroupNode(answer.code)
                .attr("aria-invalid", "true")
                .attr("aria-errormessage", errorBlockId);
        }
    }

    _hideErrors() {
        super._hideErrors();

        this.answers.forEach(answer => {
            this._getScaleGroupNode(answer.code)
                .removeAttr("aria-invalid")
                .removeAttr("aria-errormessage");
        });


        this._container.find('.cf-text-box')
            .removeAttr('aria-errormessage')
            .removeAttr('aria-invalid');
    }

    _onModelValueChange({changes}) {
        this._updateAnswerScaleNodes(changes);
        this._updateAnswerOtherNodes(changes);
        this._updateSelectedAnswers(changes);

        if (changes.values !== undefined) {
            const openPanelIndex = this._accordion.getOpenPanelIndex();
            if(questionHelper.isAnswerComplete(this._question, this._question.answers[openPanelIndex])) {
                this._openNextPanel();
            }
        }
    }

    _onScaleNodeClick(answer, scale) {
        this._selectScale(answer, scale);
    }

    _onScaleNodeFocus(answerIndex, scaleIndex) {
        this._currentAnswerIndex = answerIndex;
        this._currentScaleIndex = scaleIndex;
    }

    _onAnswerOtherValueChange(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }

    _onAnswerTitleKeyDown(answerIndex, event) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const panel = this._accordion.panels[answerIndex];
        if (panel.isOpen) {
            panel.close();
        } else {
            panel.open();
        }
    }

    _onGroupNodeKeyDown(event) {
        if ([KEYS.ArrowUp, KEYS.ArrowLeft, KEYS.ArrowRight, KEYS.ArrowDown].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswerIndex === null || this._currentScaleIndex === null) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

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

        this._getScaleNode(this._currentAnswer.code, nextScale.code).focus();
    }

    _onScaleNodeKeyDown(event) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }
        if (this._currentAnswerIndex === null || this._currentScaleIndex === null) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        this._selectScale(this._currentAnswer, this._currentScale);
    }

    // eslint-disable-next-line no-unused-vars
    _onAnswerOtherNodeKeyDown(event, answer, answerIndex) {
        if (event.keyCode === KEYS.Tab) {
            return;
        }

        event.stopPropagation();

        if (event.keyCode === KEYS.Enter) {
            const openPanelIndex = this._accordion.getOpenPanelIndex();
            if(questionHelper.isAnswerComplete(this._question, this._question.answers[openPanelIndex])) {
                this._openNextPanel();
            }
        }
    }

    _onCollapsingPanelsToggle(panel, index) {
        const answerCode = this._question.answers[index].code;
        if(panel.isOpen) {
            this._getAnswerTitleNode(answerCode).attr('aria-expanded', 'true');
            this._getAnswerContentNode(answerCode).attr('aria-hidden', 'false');
            this._getAnswerSelectedScalesListNode(answerCode)
                .attr('aria-hidden', 'true')
                .addClass('cf-accordion-grid-answer__selected-list--hidden');

            const scaleCode = this._question.values[answerCode];
            if(scaleCode !== undefined) {
                this._getScaleNode(answerCode, scaleCode).attr('tabindex', '0');
            } else {
                this._getScaleNode(answerCode, this._scales[0].code).attr('tabindex', '0');
            }
        } else {
            this._getAnswerTitleNode(answerCode).attr('aria-expanded', 'false');
            this._getAnswerContentNode(answerCode).attr('aria-hidden', 'true');
            this._getAnswerSelectedScalesListNode(answerCode)
                .attr('aria-hidden', 'false')
                .removeClass('cf-accordion-grid-answer__selected-list--hidden');

            this._scales.forEach(scale => {
               this._getScaleNode(answerCode, scale.code).attr('tabindex', '-1');
            });
        }
    }
}