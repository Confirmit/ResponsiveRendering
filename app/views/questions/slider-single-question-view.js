import QuestionWithAnswersView from './base/question-with-answers-view.js'
import VerticalSlider from "../controls/slider/vertical-slider";
import HorizontalRtlSlider from "../controls/slider/horizontal-rtl-slider";
import HorizontalSlider from "../controls/slider/horizontal-slider";

export default class SliderSingleQuestionView extends QuestionWithAnswersView {
    /**
     * @param {SingleQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings) {
        super(question, settings);

        this._slider = this._createSlider();
        this._slider.changeEvent.on(this._onSliderChange.bind(this));

        this._question.answers.forEach(answer => {
            this._getAnswerTextNode(answer.code).on('click', () => {
                this._question.setValue(answer.code);
            });
        });
    }

    _createSlider() {
        const sliderNode = this._getQuestionInputNodeId();
        const sliderValues = this._question.answers.map(answer => answer.code);
        const sliderValue = this._question.value;
        const readOnly = this._question.readOnly;
        const sliderTextValueHandler = (sliderValue) => {
            return sliderValue === null ? this._settings.messages.noResponse : this._question.getAnswer(sliderValue).text;
        };

        if(this._question.sliderIsVertical) {
            return new VerticalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, false, readOnly);
        }

        if(this._question.isRtl) {
            return new HorizontalRtlSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, false, readOnly);
        }

        return new HorizontalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, false, readOnly);
    }

    _onModelValueChange() {
        this._slider.value = this._question.value;
    }

    _onSliderChange() {
        this._question.setValue(this._slider.value);

        this._container.find('.cf-single-slider-question__label').removeClass('cf-single-slider-question__label--selected');
        this._getAnswerTextNode(this._slider.value).addClass('cf-single-slider-question__label--selected');
    }
}