import ErrorList from './error-list.js';
import $ from 'jquery';

export default class PageErrorBlock {
    constructor() {
        this._container = $('.cf-toast--error');
        this._errorList = new ErrorList(this._container.find('.cf-error-list'));

        this._timeout = null;

        this._closeButton = this._container.find('.cf-toast__close');
        this._closeButton.click(this.hideErrors.bind(this));
    }

    showErrors(errors) {
        clearTimeout(this._timeout);
        this._timeout = setTimeout(()=> this.hideErrors(), 5000);

        this._errorList.clean();
        this._errorList.addErrors(errors);

        this._container.removeClass('cf-toast--hidden');
    }

    hideErrors() {
        clearTimeout(this._timeout);

        this._container.addClass('cf-toast--hidden');

        this._errorList.clean();
    }
}