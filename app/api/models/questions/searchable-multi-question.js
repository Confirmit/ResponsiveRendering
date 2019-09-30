import MultiQuestionBase from './multi-question-base.js';
import SearchableQuestionMixin from "./searchable-question-mixin.js";

/**
 * @extends {MultiQuestionBase}
 * @extends {SearchableQuestionMixin}
 */
export default class SearchableMultiQuestion extends SearchableQuestionMixin(MultiQuestionBase) {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     * @param {SearchableAnswerListService} searchableAnswerListService - searchable answer list service.
     */
    constructor(model, searchableAnswerListService) {
        super(model, searchableAnswerListService);
    }

    _updateSelectedAnswers(changes) {
        if(changes.values !== undefined) {
            // remove
            this._selectedAnswers = this._selectedAnswers.filter(answer => this.values.includes(answer.code));
            //add
            const selectedAnswersCodes = this._selectedAnswers.map(answer => answer.code);
            const newAnswers = this.values
                .filter(answerCode => !selectedAnswersCodes.includes(answerCode))
                .map(answerCode => this.getAnswer(answerCode));
            this._selectedAnswers = this._selectedAnswers.concat(newAnswers);
        }
    }
}