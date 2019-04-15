import $ from 'jquery';
import QuestionViewBase from '../base/question-view-base';

export default class MaxDiffInnerSingleQuestionView extends QuestionViewBase {
    constructor(parent, question, settings = null) {
        super(question, settings);

        this._parent = parent;
        this._container = $(`#${parent.id}`);

        this._attachHandlersToDOM();
    }

    _getAnswerNode(answerCode) {
        return this._container.find(`#${this._question.id}_${answerCode}`);
    }

    _attachHandlersToDOM() {
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('click', () => this._onAnswerNodeClick(answer));
        });
    }

    _onAnswerNodeClick(answer) {
        // disallow selecting the same answer twice
        if (this._parent.innerQuestions.find(x => x !== this && x.value === answer.code))
            return;
        this._question.setValue(answer.code);
    }

    _onModelValueChange({changes}) {
        if (changes.value === undefined) {
            return;
        }
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).removeClass('cf-grid-single-answer--selected');
        });

        this._getAnswerNode(this._question.value).addClass('cf-grid-single-answer--selected');
    }
}