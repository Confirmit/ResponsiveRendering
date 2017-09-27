export default class DynamicQuestionsManager {
    constructor(page, pageView, transport) {
        this._page = page;
        this._pageView = pageView;
        this._transport = transport;
        this.attach();
    }

    attach() {
        this._page.dynamicQuestionTriggerChangedEvent.on(this._onTriggerQuestionChange.bind(this));
    }

    _onTriggerQuestionChange(question) {
        this._transport.getQuestionsData(
            question,
            this._pageView.getFormAction(),
            this._pageView.getFormMethod(),
            this._pageView.getHiddenInputs().concat(this._page.formValues),
            this._processResponse.bind(this));
    }

    _processResponse(result) {
        result.questions.forEach(question => {
            const model = this._page.replaceDynamicQuestion(question.id, question.model, question.isPlaceholder);

            this._pageView.replaceDynamicQuestion(question.id, model, question.html, question.startupScript, question.isPlaceholder);
        });
    }
}