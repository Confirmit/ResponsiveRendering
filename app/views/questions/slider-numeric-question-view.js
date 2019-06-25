import QuestionView from './base/question-view.js'
import VerticalSlider from "../controls/slider/vertical-slider";
import HorizontalRtlSlider from "../controls/slider/horizontal-rtl-slider";
import HorizontalSlider from "../controls/slider/horizontal-slider";
import Utils from 'utils.js';

export default class SliderNumericQuestionView extends QuestionView {
    /**
     * @param {NumericQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._nanCode = 'NOT_A_NUMBER';

        this._input = this._getQuestionInputNode();
        this._input.on('input', this._onQuestionInputNodeValueChange.bind(this));

        this._sliderValues = this._generateSliderValues();

        this._slider = this._createSlider();
        this._slider.changeEvent.on(() => this._onSliderChange());
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

    _createSlider() {
        const sliderNode = this._getQuestionInputNodeId() + '_slider';
        const sliderValues = this._sliderValues;
        const sliderValue = this._question.value;
        const sliderTextValueHandler = (sliderValue) => {
            return sliderValue === null ? this._settings.messages.noResponse : sliderValue;
        };

        let slider = null;
        if(this._question.sliderIsVertical) {
            slider = new VerticalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, true);
        } else {
            if(this._question.isRtl) {
                slider = new HorizontalRtlSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, true);
            } else {
                slider = new HorizontalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, true);
            }
        }
        return slider;
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);
        this._input.attr('aria-invalid', true);
    }

    _hideErrors() {
        super._hideErrors();
        this._input.attr('aria-invalid', false);
    }

    _attachControlHandlers() {
        this._input.on('input', this._onQuestionInputNodeValueChange.bind(this));
    }

    _onModelValueChange() {
        if (this._question.value === this._nanCode) {
            return;
        }

        if(this._question.value === null) {
            this._input.val(null);
            this._slider.setValueSilently(null);
            return;
        }

        const getNumericValue = stringValue => parseFloat(stringValue.replace(',', '.'));
        const getNormalizedValueFromNumber = numericValue => numericValue.toFixed(this._question.numeric.scale);
        const getNormalizedValueFromString = stringValue => getNormalizedValueFromNumber(getNumericValue(stringValue));

        let questionValue = getNormalizedValueFromString(this._question.value);
        const numericQuestionValue = getNumericValue(this._question.value);
        const inputValue = getNormalizedValueFromString(this._input.val());

        if (inputValue !== questionValue) {
            this._input.val(questionValue);
        }

        if (this._slider.value !== questionValue) {
            if(numericQuestionValue < this._question.numeric.min) {
                questionValue = getNormalizedValueFromNumber(this._question.numeric.min);
            }
            if(numericQuestionValue > this._question.numeric.max) {
                questionValue = getNormalizedValueFromNumber(this._question.numeric.max);
            }
            this._slider.setValueSilently(questionValue);
        }
    }

    _onQuestionInputNodeValueChange(event) {
        let value = event.target.value;
        if(value === '' && !event.target.validity.valid) {
            value = this._nanCode;
        }
        this._question.setValue(value);
    }

    _onSliderChange() {
        this._question.setValue(this._slider.value);
    }
}