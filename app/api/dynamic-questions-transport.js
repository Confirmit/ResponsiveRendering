import $ from 'jquery';

export default class DynamicQuestionsTransport {
    constructor() {
        this._hasUpdated = false;

        this._openTimeoutMs = 500;
        this._inputTimeoutMs = 100;
        this._timers = {};

        this._xhr = null;
    }

    getQuestionsData(question, formAction, formMethod, formValues, callback) {
        if (this._timers[question.id]) {
            clearTimeout(this._timers[question.id]);
        }

        let timeout = question.type.includes('Open') ? this._openTimeoutMs : this._inputTimeoutMs;
        this._timers[question.id] = setTimeout(() => this._runAjax(question.id, formAction, formMethod, formValues, callback), timeout);
    }

    _runAjax(questionId, formAction, formMethod, formValues, callback) {
        delete this._timers[questionId];

        if (this._xhr) {
            this._xhr.abort('cancel pending dynamic update');
        }

        const settings = {
            type: formMethod.toUpperCase(),
            url: this._buildUrl(formAction, questionId),
            data: $.param(formValues),
            dataType: "json"
        };

        this._xhr = $.ajax(settings)
            .done(result => this._processResponse(result, callback))
            .fail((xhr, status, error) => this._handleError(status, error))
            .always(() => this._cleanup());
    }

    _buildUrl(formAction, questionId) {
        let queryString = `__dynamicUpdate=true&__dqtrigger=${questionId}&__triggerhasupdated=${this._hasUpdated}&__islistsearch=false`;
        return formAction + (formAction.indexOf("?") > -1 ? "&" : "?") + queryString;
    }

    _processResponse(result, callback){
        if (result && result.questions){
            this._hasUpdated = true;

            callback(result);
        }
    }

    _handleError(status, error){
        if (status === 'cancel pending dynamic update')
            return;

        // TODO: find a way to show global error banner or another way of handling
        // eslint-disable-next-line no-console
        console.error("Dynamic question load failed: " + error);
    }

    _cleanup(){
        this._xhr = null;
    }
}