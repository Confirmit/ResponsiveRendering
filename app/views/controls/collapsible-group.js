import CollapsingPanel from './collapsing-panel';
import $ from "jquery";

export default class CollapsibleGroup {
    /**
     * @param {QuestionWithAnswers} question
     * @param {HeadGroup} group - the instance of answer group.
     * @param {function(<QuestionWithAnswers>, <HeadGroup>): array} prepareShortInfoFn - prepare short info delegate, return array of other and answer texts
     */

    constructor(question, group, prepareShortInfoFn) {
        this._group = group;
        this._question = question;
        this._prepareShortInfoFn = prepareShortInfoFn;

        this._container = $(`#${this._question.id}_${this._group.code}_group`);
        this._shortInfoNode = this._container.find('.cf-collapsible-group__short-info');

        this._panel = new CollapsingPanel(this._container);

        this._question.validationCompleteEvent.on(this._onValidationComplete.bind(this));
        this._question.changeEvent.on(this._onQuestionChange.bind(this));
        this._panel.toggleEvent.on(this._onToggleEvent.bind(this));
    }

    _onQuestionChange() {
        this._shortInfoNode.empty();
        const texts = this._prepareShortInfoFn(this._question, this._group);

        this._shortInfoNode.append(texts.join('<i class="cf-collapsible-group__short-info-separator"></i>'));
    }

    _onValidationComplete(validationResult) {
        const answerCodes = this._group.items.map(answer => answer.code);

        if (validationResult.answerValidationResults.some(answerValidationResult => answerCodes.includes(answerValidationResult.answerCode))) {
            this._panel.open();
        }
    }

    _onToggleEvent() {
        this._container.find('.cf-collapsible-group__short-info').toggleClass('cf-collapsible-group__short-info--hidden', this._panel.isOpen);
    }
}