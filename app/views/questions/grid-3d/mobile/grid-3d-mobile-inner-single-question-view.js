import Utils from "../../../../utils";
import Grid3DMobileInnerQuestionView from "./grid-3d-mobile-inner-question-view";

export default class Grid3DMobileInnerSingleQuestionView extends Grid3DMobileInnerQuestionView {
    constructor(parentQuestion, question, settings = null) {
        super(parentQuestion, question, settings);

        this._attachHandlersToDOM();
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', this._onAnswerNodeClick.bind(this, answer));

            if (answer.isOther) {
                const otherInput = this._getAnswerOtherNode(answer.code);
                otherInput.on('click', e => e.stopPropagation());
                otherInput.on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value));
            }
        });
    }


    _onModelValueChange({changes}) {
        if (changes.value === undefined) {
            return;
        }

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass('cf-single-answer--selected');
        });

        this._getAnswerNode(this._question.value).addClass('cf-single-answer--selected');
    }



    _onAnswerNodeClick(answer) {
        this._question.setValue(answer.code);

        if (answer.isOther) {
            const otherInput = this._getAnswerOtherNode(answer.code);
            this._question.setOtherValue(otherInput.val());
            if (Utils.isEmpty(otherInput.val())) {
                otherInput.focus();
            }
        }
    }

    _onAnswerOtherNodeValueChange(answer, otherValue) {
        if (!Utils.isEmpty(otherValue)) { // select answer
            this._question.setValue(answer.code);
        }

        this._parentQuestion.setOtherValue(answer.code, otherValue);
    }
}