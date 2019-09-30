import QuestionWithAnswersView from './base/question-with-answers-view.js';
import Utils from 'utils.js';
import ValidationTypes from "../../api/models/validation/validation-types";
import VerticalSlider from "../controls/slider/vertical-slider";
import HorizontalRtlSlider from "../controls/slider/horizontal-rtl-slider";
import HorizontalSlider from "../controls/slider/horizontal-slider";

export default class SliderNumericListQuestionView extends QuestionWithAnswersView {
    constructor(question, settings) {
        super(question, settings);

        this._nanCode = 'NOT_A_NUMBER';

        this._sliderValues = this._generateSliderValues();
        this._sliders = this._createSliders();
        Object.keys(this._sliders).forEach(answerCode => {
            this._sliders[answerCode].changeEvent.on(() => this._onSliderChange(answerCode))
        });

        this._attachControlHandlers();

    }

    _generateSliderValues() {
        const values = [];
        const valueStep = 1 / Math.pow(10, this._question.numeric.scale);
        for (
            let currentValue = this._question.numeric.min;
            currentValue <= this._question.numeric.max;
            currentValue = Utils.round(currentValue + valueStep, 2)
        ) {
            values.push(currentValue.toFixed(this._question.numeric.scale));
        }
        return values;
    }

    _createSliders() {
        const sliderValues = this._sliderValues;
        const sliderTextValueHandler = (sliderValue) => {
            return sliderValue === null ? this._settings.messages.noResponse : sliderValue;
        };

        const readOnly = this._question.readOnly;

        let sliders = {};
        this._question.answers.forEach(answer => {
            const answerCode = answer.code;
            const sliderNode = `${this._getAnswerInputNodeId(answerCode)}_slider`;
            const sliderValue = this._question.values[answerCode];

            if (this._question.sliderIsVertical) {
                sliders[answerCode] = new VerticalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, true, readOnly);
            } else {
                if (this._question.isRtl) {
                    sliders[answerCode] = new HorizontalRtlSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, true, readOnly);
                } else {
                    sliders[answerCode] = new HorizontalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, true, readOnly);
                }
            }
        });

        return sliders;
    }

    _onSliderChange(answerCode) {
        this._question.setValue(answerCode, this._sliders[answerCode].value);
    }

    _updateAnswerNodes({values = []}) {
        if (values.length === 0)
            return;

        this._question.answers.forEach(answer => {
            const answerInput = this._getAnswerInputNode(answer.code);
            const value = this._question.values[answer.code];
            const slider = this._sliders[answer.code];

            if (value === this._nanCode) {
                return;
            }

            if (this._question.values[answer.code] === undefined) {
                answerInput.val(null);
                slider.setValueSilently(null);
                return;
            }

            const sliderValue = this._getAdjustedSliderValue(value, slider.value);
            slider.setValueSilently(sliderValue);

            if (value !== answerInput.val()) {
                answerInput.val(value);
            }
        });
    }

    _getAdjustedSliderValue(inputValue, sliderValue) {
        const getNumericValue = stringValue => parseFloat(stringValue.replace(',', '.'));
        const getNormalizedValueFromNumber = numericValue => numericValue.toFixed(this._question.numeric.scale);
        const getNormalizedValueFromString = stringValue => getNormalizedValueFromNumber(getNumericValue(stringValue));

        let questionValue = getNormalizedValueFromString(inputValue);
        const numericQuestionValue = getNumericValue(inputValue);

        if (sliderValue !== questionValue) {
            if (numericQuestionValue < this._question.numeric.min) {
                questionValue = getNormalizedValueFromNumber(this._question.numeric.min);
            }
            if (numericQuestionValue > this._question.numeric.max) {
                questionValue = getNormalizedValueFromNumber(this._question.numeric.max);
            }
        }

        return questionValue;
    }

    _updateTotalSum() {
        const sum = Object.values(this._question.values).reduce((prev, current) => prev + Utils.toNumber(current), 0);
        this._container.find('.cf-numeric-list-auto-sum__value').text(sum.toFixed(this._question.numeric.scale));
    }

    _attachControlHandlers() {
        this.answers.forEach(answer => {
            this._getAnswerInputNode(answer.code).on('input', event => {
                this._onAnswerValueChangedHandler(answer.code, event);
            });

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input', event => {
                    this._onAnswerOtherValueChangedHandler(answer.code, event.target.value);
                });
            }
        });
    }

    _showAnswerError(validationResult) {
        const answerErrors = [];
        const otherErrors = [];
        validationResult.errors.forEach(error => {
            if (error.type === ValidationTypes.OtherRequired) {
                otherErrors.push(error.message);
            } else {
                answerErrors.push(error.message);
            }
        });

        const answer = this._question.getAnswer(validationResult.answerCode);
        const target = answer.isOther
            ? this._getAnswerOtherNode(validationResult.answerCode)
            : this._getAnswerTextNode(validationResult.answerCode);
        const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
        const errors = answerErrors.concat(otherErrors);
        this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);

        if (answerErrors.length > 0) {
            this._getAnswerInputNode(validationResult.answerCode)
                .attr('aria-errormessage', errorBlockId)
                .attr('aria-invalid', 'true')
                .addClass('cf-text-box--error');
        }

        if (otherErrors.length > 0) {
            const otherNode = this._getAnswerOtherNode(validationResult.answerCode);
            otherNode
                .attr('aria-errormessage', this._getAnswerOtherErrorBlockId(validationResult.answerCode))
                .attr('aria-invalid', 'true');
        }
    }

    _hideErrors() {
        super._hideErrors();

        this._container.find('.cf-text-box')
            .removeAttr('aria-errormessage')
            .removeAttr('aria-invalid')
            .removeClass('cf-text-box--error')
    }

    _onModelValueChange({changes}) {
        this._updateAnswerNodes(changes);
        this._updateAnswerOtherNodes(changes);

        if (this._question.autoSum) {
            this._updateTotalSum();
        }
    }

    _onAnswerValueChangedHandler(answerCode, event) {
        let value = event.target.value;
        if (value === '' && !event.target.validity.valid) {
            value = this._nanCode;
        }
        this._question.setValue(answerCode, value);
    }

    _onAnswerOtherValueChangedHandler(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }
}
