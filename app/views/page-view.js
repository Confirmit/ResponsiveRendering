import QuestionViewFactory from './question-view-factory.js';
import QuestionViewSettings from './question-view-settings.js';
import HiddenQuestionView from './questions/hidden-question-view.js';
import PageErrorBlock from './error/page-error-block.js';
import $ from 'jquery';
import SmartBanner from './controls/smart-banner.js';
import AutoNextNavigator from './controls/auto-next-navigator.js';
import TestNavigatorView from './controls/test-navigator-view.js';
import ProcessMonitor from '../process-monitor.js';
import Event from 'event.js';
import QuestionTypes from 'api/question-types.js';

export default class PageView {
    /**
     * @param {Page} page
     */
    constructor(page) {
        this._page = page;
        this._questionViewSettings = new QuestionViewSettings(this._page.surveyInfo);
        this._questionViews = [];
        this._hiddenViews = [];
        this._pageErrorBlock = new PageErrorBlock();
        this._smartBanner = new SmartBanner();

        this._processMonitor = new ProcessMonitor();
        this._processMonitor.changeStateEvent.on(this._onProcessMonitorStateChange.bind(this));

        this._testNavigatorView = this._page.testNavigator !== null ? new TestNavigatorView(this._page.testNavigator) : null;
        this._autoNextNavigator = null;

        this._questionViewFactory = new QuestionViewFactory(this._questionViewSettings);
        this._registeredCustomQuestionViews = {};

        this._pageForm = $('#page_form');

        this._initCompleteEvent = new Event('page-view:init-complete');
    }

    init() {
        this._attachQuestionViews();
        this._attachModelHandlers();
        this._attachControlHandlers();
        this._attachExtensions();

        this._initCompleteEvent.trigger();
    }

    get initCompleteEvent() {
        return this._initCompleteEvent;
    }

    get questionViewFactory() {
        return this._questionViewFactory;
    }

    set questionViewFactory(questionViewFactory) {
        this._questionViewFactory = questionViewFactory;
    }

    registerCustomQuestionView(questionId, createViewFn) {
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
        const questionView = this._createQuestionView(model);

        if (questionView !== undefined) {
            this._questionViews.push(questionView);

            if (questionView.pendingChangeEvent !== undefined) {
                questionView.pendingChangeEvent.on(this._onQuestionPendingChange.bind(this));
            }
        }

        this._hiddenViews.push(new HiddenQuestionView(model));
    }

    _createQuestionView(model) {
        const createCustomQuestionViewFn = this._registeredCustomQuestionViews[model.id];
        if (createCustomQuestionViewFn !== undefined) {
            return this._customTryCreateView(model, createCustomQuestionViewFn);
        }

        return this._factoryTryCreateView(model);
    }

    _customTryCreateView(model, createCustomQuestionViewFn) {
        try {
            return createCustomQuestionViewFn(model, this._questionViewSettings);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Custom view creation for question(${model.id}) failed: ` + error);
        }
    }

    _factoryTryCreateView(model) {
        try {
            return this._questionViewFactory.create(model);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Factory view creation for question(${model.id}) failed: ` + error);
        }
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

        this._page.dynamicQuestionTriggerChangedEvent.on(() => this._processMonitor.addProcess('dynamic_manager'));
        this._page.dynamicQuestionsChangeCompleteEvent.on(this._onDynamicQuestionChangeComplete.bind(this));
    }

    _attachControlHandlers() {
        $('.cf-navigation-next').on('click', () => this._onNavigationButtonClick(true));
        $('.cf-navigation-back').on('click', () => this._onNavigationButtonClick(false));
        $('.cf-navigation-ok').on('click', () => this._onOkButtonClick());

        this._preventFormSubmitOnEnter();
    }

    _attachExtensions() {
        this._autoNextNavigator = new AutoNextNavigator(this._page);
    }

    _showErrors(errors = []) {
        if(this._page.surveyInfo.disableValidationBanner){
            return;
        }

        this._pageErrorBlock.showErrors(errors);
    }

    _hideErrors() {
        if(this._page.surveyInfo.disableValidationBanner){
            return;
        }

        this._pageErrorBlock.hideErrors();
    }

    _scrollToFirstInvalidQuestion(validationResult) {
        const invalidQuestion = validationResult.questionValidationResults.find(question => !question.isValid);
        if (!invalidQuestion) {
            return;
        }

        $(`#${invalidQuestion.questionId}`)[0].scrollIntoView({behavior: 'smooth'});
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

    replaceDynamicQuestion(model, html, startupScript) {
        $(`#${model.id}`).replaceWith(html);

        this._detachQuestionView(model.id);

        if (model.type === QuestionTypes.DynamicQuestionPlaceholder) {
            return;
        }

        this._attachQuestionView(model);
        if (startupScript) {
            this._runDynamicQuestionStartupScript(startupScript)
        }
    }

    _runDynamicQuestionStartupScript(script) {
        try {
            $.globalEval(script);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    _onNavigationButtonClick(next) {
        if (!this._processMonitor.idle) {
            return;
        }

        if (next) {
            this._page.next();
        } else {
            this._page.back();
        }
    }

    _onOkButtonClick() {
        try {
            if (window.parent && typeof (window.parent.postMessage) === 'function') {
                window.parent.postMessage({type: 'cf-survey-end'}, '*');
            }
        } catch (error) {
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

    _onDynamicQuestionChangeComplete(models) {
        this._processMonitor.removeProcess('dynamic_manager');

        models.forEach(model => {
            if (model.type === QuestionTypes.DynamicQuestionPlaceholder) {
                this._processMonitor.removeProcess(`question_view_${model.id}`);
            }
        });
    }

    _onQuestionPendingChange({id, pending}) {
        if (pending) {
            this._processMonitor.addProcess(`question_view_${id}`);
        } else {
            this._processMonitor.removeProcess(`question_view_${id}`);
        }
    }

    _onProcessMonitorStateChange() {
        $('.cf-page__navigation').toggleClass('cf-navigation--disabled', !this._processMonitor.idle);
    }
}