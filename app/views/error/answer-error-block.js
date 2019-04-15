import ErrorList from './error-list.js';
import $ from 'jquery';

export default class AnswerErrorBlock {

    constructor(id, target, { top = false, absolute = false } = {}) {
        this._container = null;
        this._errorList = null;

        this._id = id;
        this._target = target;
        this._targetIsInput = this._targetIsInput();
        this._positionTop = top;
        this._positionAbsolute = absolute;

        this._init();
    }

    showErrors(errors) {
        if (errors.length === 0)
            return;

        this._errorList.clean();
        this._errorList.addErrors(errors);

        this._container.removeClass('cf-error-block--hidden');
    }

    remove() {
        this._container.remove();
        if(this._targetIsInput) {
            this._removeErrorClassFromTarget();
        }
    }

    _init() {
        this._container = $(this._prepareHtml());
        this._errorList = new ErrorList(this._container.find(this._container.find('.cf-error-list')));
        this._append();

        if(this._targetIsInput) {
            this._addErrorClassToTarget();
        }
    }

    _append() {
        if(this._positionAbsolute) {
            this._target.append(this._container);
        } else {
            if(this._positionTop) {
                this._target.before(this._container);
            } else {
                this._target.after(this._container);
            }
        }
    }

    _prepareHtml() {
        let html = '';
        html += `<div id="${this._id}" role="alert" aria-labelledby="${this._id}_list" class="cf-error-block cf-error-block--hidden ${this._getPositionModifier()}">`;
        html += `   <ul class="cf-error-list" id="${this._id}_list"></ul>`;
        html += '</div>';
        return html;
    }

    _getPositionModifier() {
        if(this._targetIsInput) {
            return '';
        }

        let modifier = 'cf-error-block--bottom'; // default

        if(!this._positionAbsolute) {
            if(this._positionTop) {
                modifier = 'cf-error-block--top';
            } else {
                modifier = 'cf-error-block--bottom';
            }
        } else {
            if(this._positionTop) {
                modifier = 'cf-error-block--absolute-top';
            } else {
                modifier = 'cf-error-block__absolute-bottom';
            }
        }

        return modifier;
    }

    _targetIsInput() {
        return this._target.hasClass('cf-text-box') || this._target.hasClass('cf-dropdown');
    }

    _addErrorClassToTarget() {
        if(this._target.hasClass('cf-text-box')) {
            this._target.addClass('cf-text-box--error');
        }
        if(this._target.hasClass('cf-dropdown')) {
            this._target.addClass('cf-dropdown--error');
        }
    }

    _removeErrorClassFromTarget() {
        this._target.removeClass('cf-text-box--error cf-dropdown--error');
    }
}