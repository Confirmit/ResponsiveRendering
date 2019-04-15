import QuestionWithAnswersView from "./base/question-with-answers-view";
import Accordion from "./../controls/accordion";
import CollapsingPanel from "../controls/collapsing-panel";
import Utils from "../../utils";
import questionHelper from "../helpers/question-helper";

export default class AccordionGridQuestionView extends QuestionWithAnswersView {
    constructor(question) {
        super(question);

        this._collapsingPanels = this.answers.map(answer => new CollapsingPanel(this._getAnswerNode(answer.code).find('.cf-collapsing-panel')));
        this._accordion = new Accordion(this._collapsingPanels);
        this._init();
    }

    _init() {
        this._attachControlHandlers();
    }

    _attachControlHandlers() {
        this.answers.forEach(answer => {
            this._question.scales.forEach(scale => this._getScaleNode(answer.code, scale.code).on('click', this._onScaleNodeClick.bind(this, answer, scale)));

            if (answer.isOther) {
                this._getAnswerOtherNode(answer.code).on('input keypress click', event => {
                    switch (event.type) {
                        case 'input':
                            this._onAnswerOtherValueChange(answer.code, event.target.value);
                            break;
                        case 'keypress':
                            this._onAnswerOtherValueKeyUp(answer, event);
                            break;
                        case 'click':
                            event.stopPropagation();
                    }
                });
            }
        });

        this._collapsingPanels.forEach((item, index) => item.toggleEvent.on(() => this._onCollapsingPanelsToggle(item, index)));
    }

    _updateAnswerScaleNodes({values = []}) {
        if (values.length === 0) {
            return;
        }

        this._container.find('.cf-accordion-grid-answer__scale-item').removeClass('cf-accordion-grid-answer__scale-item--selected');

        Object.entries(this._question.values).forEach(([answerCode, scaleCode]) => {
            this._getScaleNode(answerCode, scaleCode).addClass('cf-accordion-grid-answer__scale-item--selected');
        });
    }

    _openNextPanel() {
        const currentIndex = this._collapsingPanels.findIndex(panel => panel.isOpen);

        if(currentIndex === -1 || !questionHelper.isAnswerComplete(this._question, this._question.answers[currentIndex])){
            return;
        }

        if (currentIndex < this._collapsingPanels.length - 1) {
            this._accordion.openPanel(currentIndex + 1);
        } else {
            this._collapsingPanels[currentIndex].close();
        }
    }

    _updateSelectedAnswers({values = []}) {
        if (values.length === 0) {
            return;
        }

        this._container.find('.cf-accordion-grid-answer__selected-list').empty();
        Object.keys(this._question.values).forEach(answerCode => {
            let scaleCode = this._question.values[answerCode];
            let scaleText = this._question.scales.find(scale => scale.code === scaleCode).text;
            let answeredNode = this._getAnswerNode(answerCode).find('.cf-accordion-grid-answer__selected-list');
            answeredNode.append(`<div class="cf-accordion-grid-answer__selected-item">${scaleText}</div>`);
        });

    }

    _onModelValueChange({changes}) {
        this._updateAnswerScaleNodes(changes);
        this._updateAnswerOtherNodes(changes);
        this._updateSelectedAnswers(changes);

        if (changes.values !== undefined) {
            this._openNextPanel();
        }
    }

    _onScaleNodeClick(answer, scale) {
        this._question.setValue(answer.code, scale.code);

        if (answer.isOther && Utils.isEmpty(this._question.otherValues[answer.code])) {
            this._getAnswerOtherNode(answer.code).focus();
        }
    }

    _onAnswerOtherValueChange(answerCode, otherValue) {
        this._question.setOtherValue(answerCode, otherValue);
    }

    _onAnswerOtherValueKeyUp(currentAnswer, event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            this._openNextPanel();
        }
    }

    _onCollapsingPanelsToggle(item, index) {
        const answerNode = this._getAnswerNode(this._question.answers[index].code);
        answerNode.find('.cf-accordion-grid-answer__selected-list').toggleClass('cf-accordion-grid-answer__selected-list--hidden', item.isOpen);
    }
}