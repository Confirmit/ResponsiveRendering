import SingleQuestion from './single-question.js';
import SearchableQuestionMixin from './searchable-question-mixin.js';

/**
 * @extends {SingleQuestion}
 * @extends {SearchableQuestionMixin}
 */
export default class SearchableSingleQuestion extends SearchableQuestionMixin(SingleQuestion) {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     * @param {SearchableAnswerListService} searchableAnswerListService - searchable answer list service.
     */
    constructor(model, searchableAnswerListService) {
        super(model, searchableAnswerListService);
    }

    _updateSelectedAnswers(changes) {
        if(changes.value !== undefined) {
            this._selectedAnswers = [];
            if(this.value !== null) {
                this._selectedAnswers.push(this.getAnswer(this.value));
            }
        }
    }
}