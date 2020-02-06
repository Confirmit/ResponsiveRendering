import Event from "../../../event";
import Answer from "../base/answer";

/**
 * @typedef {Object} SearchableQuestion
 * @property {Answer[]} answers All available answers to select.
 * @property {Answer[]} filteredAnswers Filtered answers.
 * @property {Answer[]} selectedAnswers Selected answers.
 * @property {Answer[]} otherAnswers Other answers.
 * @property {Answer[]} exclusiveAnswers Exclusive answers.
 * @property {Answer[]} lockedAnswers answers with lock position.
 * @property {boolean} hasMoreAnswers Is it available more answers?
 * @property {Event} loadMoreAnswersCompleteEvent Fired on loading more answers is complete.
 * @property {Event} filterAnswersCompleteEvent Fired on filtering answers is complete.
 * @property {function(searchInput: string)} filterAnswers Filter answers.
 * @property {function()} loadMoreAnswers Load more answers.
 */

/**
 * Searchable question mixin.
 * @param {QuestionWithAnswers} base - Question with answers model.
 * @return {SearchableQuestion<QuestionWithAnswers>}
 */
const SearchableQuestionMixin = base => class extends base {
    /**
     * @param {object} model - raw model
     * @param {SearchableAnswerListService} searchableAnswerListService
     */
    constructor(model, searchableAnswerListService) {
        super(model);

        this._searchableAnswerListService = searchableAnswerListService;

        this._filteredAnswers = model.filteredAnswers.map(answerModel => new Answer(answerModel));
        this._selectedAnswers = model.selectedAnswers.map(answerModel => new Answer(answerModel));
        this._otherAnswers = model.otherAnswers.map(answerModel => new Answer(answerModel));
        this._exclusiveAnswers = model.exclusiveAnswers.map(answerModel => new Answer(answerModel));
        this._lockedAnswers = model.lockedAnswers.map(answerModel => new Answer(answerModel));

        this._searchPattern = '';
        this._hasMoreAnswers = model.hasMoreAnswers;
        this._pagingSize = model.answersPerPage;
        this._pagingIndex = 1;

        this._loadMoreAnswersCompleteEvent = new Event("searchable-question:load-more-answers-complete");
        this._filterAnswersCompleteEvent = new Event("searchable-question:filter-answers-complete");
    }

    /**
     * The array of filtered answers.
     * @type {Answer[]}
     * @readonly
     */
    get filteredAnswers() {
        return this._filteredAnswers;
    }

    /**
     * The array of selected answers.
     * @type {Answer[]}
     * @readonly
     */
    get selectedAnswers() {
        return this._selectedAnswers;
    }

    /**
     * The array of other answers.
     * @type {Answer[]}
     * @readonly
     */
    get otherAnswers() {
        return this._otherAnswers;
    }

    /**
     * The array of exclusive answers.
     * @type {Answer[]}
     * @readonly
     */
    get exclusiveAnswers() {
        return this._exclusiveAnswers;
    }

    /**
     * The array of answers with lock position.
     * @type {Answer[]}
     * @readonly
     */
    get lockedAnswers(){
        return this._lockedAnswers;
    }

    /**
     * Is it available more answers?
     * @type {boolean}
     * @readonly
     */
    get hasMoreAnswers() {
        return this._hasMoreAnswers;
    }

    /**
     * The search string
     * @type {boolean}
     * @readonly
     */
    get searchPattern(){
        return this._searchPattern;
    }

    /**
     * Fired on loading more answers is complete.
     * @event loadMoreAnswersCompleteEvent
     * @type {Event}
     */
    get loadMoreAnswersCompleteEvent() {
        return this._loadMoreAnswersCompleteEvent;
    }

    /**
     * Fired on filtering answers is complete.
     * @event filterAnswersCompleteEvent
     * @type {Event}
     */
    get filterAnswersCompleteEvent() {
        return this._filterAnswersCompleteEvent;
    }

    /**
     * Filter answers (async).
     * @param {string} search - filter pattern.
     */
    filterAnswers(search) {
        this._filterAnswers(search).then(answers => {
            this._filterAnswersCompleteEvent.trigger(answers);
        });
    }

    /**
     * Load more answers (async).
     */
    loadMoreAnswers() {
        if(!this._hasMoreAnswers) {
            return;
        }

        this._loadMoreAnswers().then(answers => {
            this._loadMoreAnswersCompleteEvent.trigger(answers);
        });
    }

    async _filterAnswers(search) {
        const searchResult = await this._searchableAnswerListService.search(this.id, search, 0);

        this._searchPattern = search;
        this._pagingIndex = 1;
        this._hasMoreAnswers = searchResult.hasMoreAnswers;
        this._filteredAnswers = searchResult.answers.map(rawAnswer => new Answer(rawAnswer));
        this._updateAnswers();

        return this._filteredAnswers;
    }

    async _loadMoreAnswers() {
        const searchResult = await this._searchableAnswerListService.search(this.id, this._searchPattern, this._pagingSize * this._pagingIndex);

        this._pagingIndex++;
        this._hasMoreAnswers = searchResult.hasMoreAnswers;
        const extraAnswers = searchResult.answers.map(rawAnswer => new Answer(rawAnswer));
        this._filteredAnswers = this._filteredAnswers.concat(extraAnswers);
        this._updateAnswers();

        return extraAnswers;
    }

    _updateAnswers() {
        const answers = [...this.filteredAnswers, ...this.otherAnswers, ...this.exclusiveAnswers, ...this.lockedAnswers];
        this._answers = answers.concat(this._selectedAnswers.filter(selectedAnswer =>
            !answers.some(answer => answer.code === selectedAnswer.code)));
    }

    _onChange(changes) {
        this._updateSelectedAnswers(changes);
        this._updateAnswers();
        super._onChange(changes);
    }

    /**
     * @protected
     * @abstract
     * @param changes
     */
    // eslint-disable-next-line no-unused-vars
    _updateSelectedAnswers(changes) {
        throw 'Not implemented';
    }
};
export default SearchableQuestionMixin;