import QuestionViewFactory from './question-view-factory.js';
import HiddenQuestionView from './questions/hidden-question-view.js';
import PageErrorBlock  from './error/page-error-block.js';
import $ from 'jquery';
import SmartBanner from './controls/smart-banner';


export default class PageView {
    constructor(page) {
        this._page = page;
        this._questionViews = [];
        this._hiddenViews = [];
        this._pageErrorBlock = new PageErrorBlock();
        this._smartBanner = new SmartBanner();

        this._questionViewFactory = new QuestionViewFactory();
        this._registeredCustomQuestionViews = {};

        this._pageForm = $('#page_form');
    }

    init () {
        this._attachQuestionViews();
        this._attachModelHandlers();
        this._attachControlHandlers();
    }

    get questionViewFactory () {
        return this._questionViewFactory;
    }

    set questionViewFactory (questionViewFactory) {
        this._questionViewFactory = questionViewFactory;
    }

    registerCustomQuestionView (questionId, createViewFn) {
        this._registeredCustomQuestionViews[questionId] = createViewFn;
    }

    getFormAction() {
        return this._pageForm.attr('action');
    }

    getFormMethod() {
        return this._pageForm.attr('method');
    }

    getHiddenInputs() {
        return $('.cf-page__hidden-fields').find('input[type=hidden]').serializeArray();
    }

    _attachQuestionViews() {
        this._page.questions.forEach(model => this._attachQuestionView(model));
    }

    _attachQuestionView(model) {
        const createCustomQuestionViewFn = this._registeredCustomQuestionViews[model.id];
        const questionView = createCustomQuestionViewFn
            ? createCustomQuestionViewFn(model)
            : this._questionViewFactory.create(model);

        const hiddenView = new HiddenQuestionView(model);

        if (questionView)
            this._questionViews.push(questionView);

        if (hiddenView)
            this._hiddenViews.push(hiddenView);
    }

    _detachQuestionView(questionId) {
        this._questionViews.filter(view => view.id === questionId).forEach(view => {
            view.detachModelHandlers();
        });

        this._questionViews = this._questionViews.filter(view => view.id !== questionId);
        this._hiddenViews = this._hiddenViews.filter(view => view.id !== questionId);
    }

    _attachModelHandlers() {
        this._page.validationCompleteEvent.on(validationResult => this._onValidationComplete(validationResult));
        this._page.navigateEvent.on(({next}) => this._navigate(next));
    }

    _attachControlHandlers() {
        $('.cf-navigation-next').on('click', () => this._onNavigationButtonClick(true));
        $('.cf-navigation-back').on('click', () => this._onNavigationButtonClick(false));
        $('.cf-navigation-ok').on('click', () => this._onOkButtonClick());
        this._preventFormSubmitOnEnter();
    }

    _showErrors(errors = []) {
        this._pageErrorBlock.showErrors(errors);
    }

    _hideErrors() {
        this._pageErrorBlock.hideErrors();
    }

    _scrollToFirstInvalidQuestion(validationResult) {
        const invalidQuestion = validationResult.questionValidationResults.find(question => !question.isValid);
        if(!invalidQuestion) {
            return;
        }

        $(`#${invalidQuestion.questionId}`)[0].scrollIntoView({ behavior: 'smooth' });
    }

    _navigate(next) {
        this._hiddenViews.forEach(view => view.render());
        this._renderNavigationHiddenView(next);

        this._pageForm.submit();
    }

    _preventFormSubmitOnEnter() {
        let textInputs = 'input[type=text], input[type=number], input[type=date], input[type=password]';

        this._pageForm.on('keypress', textInputs, (e) => {
            if (e.keyCode === 13 || e.keyCode === 10) {
                e.preventDefault();
                $(e.target).blur();
            }
        });
    }

    _renderNavigationHiddenView(next) {
        const name = next ? '__fwd' : '__bck';
        const input = $('<input/>', {
            type: 'hidden',
            class: 'cf-hidden-navigation',
            name: name,
            value: '1'
        });
        this._pageForm.find('.cf-hidden-navigation').remove();
        this._pageForm.append(input);
    }

    replaceDynamicQuestion(questionId, questionModel, html, startupScript, isPlaceholder) {
        $(`#${questionId}`).replaceWith(html);

        this._detachQuestionView(questionId);

        if (!isPlaceholder) {
            this._attachQuestionView(questionModel);

            if (startupScript) {
                this._runDynamicQuestionStartupScript(startupScript);
            }
        }
    }

    _runDynamicQuestionStartupScript(script) {
        try {
            $.globalEval(script);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    _onNavigationButtonClick(next) {
        if (next) {
            this._page.next();
        }
        else {
            this._page.back();
        }
    }

    _onOkButtonClick() {
        try {
            if (window.parent && typeof(window.parent.postMessage) === 'function') {
                window.parent.postMessage({type:'cf-survey-end'}, '*');
            }
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }

        this._onNavigationButtonClick(true);
    }

    _onValidationComplete(validationResult) {
        if (!validationResult.isValid) {
            this._showErrors([this._page.surveyInfo.messages.toastErrorMessage]);
            this._scrollToFirstInvalidQuestion(validationResult);
        } else {
            this._hideErrors();
        }
    }
}