import QuestionWithAnswersView from "./question-with-answers-view";
import $ from "jquery";

export default class SearchableQuestionViewBase extends QuestionWithAnswersView {
    /**
     * @abstract
     * @param question {SearchableQuestion<QuestionWithAnswersView>}
     * @param settings {QuestionViewSettings}
     */
    constructor(question, settings = null) {
        super(question, settings);

        this._searchableQuestionNode = this._container.find('.cf-searchable-question');
        this._selectedAnswerListNode = this._container.find(`#${this._question.id}_selected_answers`);
        this._searchableAnswerScrollWrapperNode = this._container.find(`.cf-searchable-question__answer-list-wrapper--filtered-answers`);
        this._searchableAnswerListNode = this._container.find(`#${this._question.id}_searchable_answers`);
        this._searchInputNode = this._container.find('.cf-searchable-question__search');
        this._loadMoreNode = this._container.find('.cf-searchable-question__load-more');
        this._counterNodes = this._container.find('.cf-searchable-question__selected-count');
        this._counterInSearchPanelNode = this._container.find('.cf-searchable-question__selected-count--in-search-panel');
        this._expandNode = this._container.find('.cf-searchable-question__expand');
        this._collapseNode = this._container.find('.cf-searchable-question__collapse');

        this._searchDelayTimeout = null;

        this._attachHandlersToDOM();
    }

    _getSelectedAnswerNodeId(answerCode) {
        return `${this._question.id}_${answerCode}_selected`;
    }

    _getSelectedAnswerRemoveButtonNode(answerCode) {
        return $(`#${this._getSelectedAnswerNodeId(answerCode)} .cf-searchable-question__selected-answer-remove`);
    }

    _attachModelHandlers() {
        super._attachModelHandlers();

        this._attachHandlerToSelectedAnswers(this._question.selectedAnswers);
        this._question.filterAnswersCompleteEvent.on(answers => this._onFilterAnswersComplete(answers));
        this._question.loadMoreAnswersCompleteEvent.on(answers => this._onLoadMoreAnswersComplete(answers));
    }

    _attachHandlersToDOM() {
        this._searchInputNode.on('keydown', e => e.stopPropagation());
        this._searchInputNode.on('input', this._onSearchChange.bind(this));
        this._loadMoreNode.on('click', this._onLoadMoreNodeClick.bind(this));
        this._expandNode.on('click', () => this._expandSelectedAnswersPanel());
        this._counterInSearchPanelNode.on('click', () => this._expandSelectedAnswersPanel());
        this._collapseNode.on('click', () => this._collapseSelectedAnswersPanel());
    }

    _attachHandlerToSelectedAnswers(answers) {
        answers.forEach(answer => {
            this._getSelectedAnswerRemoveButtonNode(answer.code).on('click', () => this._unselectAnswer(answer))
        });
    }

    _updateSelectedList() {
        this._selectedAnswerListNode.empty();
        this._question.selectedAnswers.forEach(answer => {
            this._selectedAnswerListNode.append(this._renderSelectedAnswer(answer));
        });

        this._attachHandlerToSelectedAnswers(this._question.selectedAnswers);
    }

    _updateSearchableList(answers) {
        answers.forEach(answer => {
            this._searchableAnswerListNode.append(`<div class="cf-list__item">${this._renderAnswer(answer)}</div>`);
            this._getAnswerNode(answer.code).on('click', () => this._onAnswerNodeClick(answer));
        });

        this._searchableQuestionNode.toggleClass('cf-searchable-question--has-more-answers', this._question.hasMoreAnswers);
        this._searchableQuestionNode.toggleClass('cf-searchable-question--no-result', answers.length === 0);
        this._scrollToBottomOfSearchableList();
    }

    _scrollToBottomOfSearchableList() {
        // TODO: mb can be replaced by CSS animation.
        this._searchableAnswerScrollWrapperNode.animate({
            scrollTop: this._searchableAnswerScrollWrapperNode[0].scrollHeight
        }, 1000);
    }

    _updateSelectedAnswersCounter() {
        this._counterNodes.text(this._question.selectedAnswers.length);
    }

    _renderSelectedAnswer(answer) {
        return `
            <div class="cf-list__item">
                <div class="cf-searchable-question__selected-answer" id="${this._getSelectedAnswerNodeId(answer.code)}">
                    <div class="cf-searchable-question__selected-answer-text">${this._getSelectedAnswerText(answer)}</div>     
                    <div class="cf-searchable-question__selected-answer-remove"></div>           
                </div>
            </div>
        `;
    }

    _expandSelectedAnswersPanel() {
        this._container.find('.cf-searchable-question').addClass('cf-searchable-question--selected-answers-expanded')
    }

    _collapseSelectedAnswersPanel() {
        this._container.find('.cf-searchable-question').removeClass('cf-searchable-question--selected-answers-expanded');
    }

    /**
     * @param {Answer} answer
     * @protected
     * @abstract
     * @return {string}
     */
    // eslint-disable-next-line no-unused-vars
    _getSelectedAnswerText(answer) {
        throw 'Not implemented';
    }

    /**
     * @param {Answer} answer
     * @protected
     * @abstract
     * @return {string}
     */
    // eslint-disable-next-line no-unused-vars
    _renderAnswer(answer) {
        throw 'Not implemented';
    }

    /**
     * @param {Answer} answer
     * @protected
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    _onAnswerNodeClick(answer) {
        throw 'Not implemented';
    }

    /**
     * @param {Answer} answer
     * @protected
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    _unselectAnswer(answer) {
        throw 'Not implemented';
    }

    _onModelValueChange(changes) {
        super._onModelValueChange(changes);

        this._updateSelectedList();
        this._updateSelectedAnswersCounter();
    }

    _onLoadMoreNodeClick() {
        this._searchableQuestionNode.removeClass('cf-searchable-question--has-more-answers');
        this._searchableQuestionNode.addClass('cf-searchable-question--loading');

        this._question.loadMoreAnswers();
    }

    _onSearchChange(event) {
        if (event.target.value === this._question.searchPattern) {
            return;
        }

        clearTimeout(this._searchDelayTimeout);
        this._searchDelayTimeout = setTimeout(() => {
            this._searchableAnswerListNode.empty();
            this._searchableQuestionNode.removeClass('cf-searchable-question--no-result');
            this._searchableQuestionNode.removeClass('cf-searchable-question--has-more-answers');
            this._searchableQuestionNode.addClass('cf-searchable-question--loading');

            this._question.filterAnswers(event.target.value);
        }, 500);
    }

    _onFilterAnswersComplete(answers) {
        this._updateSearchableList(answers, true);
        this._searchableQuestionNode.removeClass('cf-searchable-question--loading');
    }

    _onLoadMoreAnswersComplete(answers) {
        this._updateSearchableList(answers);
        this._searchableQuestionNode.removeClass('cf-searchable-question--loading');
    }
}