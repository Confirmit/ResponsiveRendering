import ErrorList from './error-list.js';

export default class QuestionErrorBlock {
    constructor(container) {
        this._container = container;
        this._errorList = new ErrorList(this._container.find('.cf-error-list'));
    }

    showErrors(errors) {
        if (errors.length === 0)
            return;

        this._errorList.clean();
        this._errorList.addErrors(errors);

        this._container.removeClass('cf-error-block--hidden');
    }

    hideErrors() {
        this._container.addClass('cf-error-block--hidden');

        this._errorList.clean();
    }
}