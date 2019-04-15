import Event from "../../event";

export default class CollapsingPanel {
    constructor(container) {
        this._container = container;
        this._isOpen = this._container.hasClass('cf-collapsing-panel--open');
        this._toggleEvent = new Event('collapsing-panel:toggle');

        this._init();
    }

    _init() {
        this._container.find('.cf-collapsing-panel__title').on('click', () => this._toggle(!this._isOpen));
    }

    get toggleEvent() {
        return this._toggleEvent;
    }

    get isOpen() {
        return this._isOpen;
    }

    open() {
        this._toggle(true);
    }

    close() {
        this._toggle(false);
    }

    _toggle(value) {
        if (this._isOpen === value) {
            return;
        }

        this._isOpen = value;
        this._toggleDOM();
        this._toggleEvent.trigger();
    }

    _toggleDOM() {
        const bodyNode = this._container.find('.cf-collapsing-panel__body');

        bodyNode.one('transitionend', () => {
            bodyNode[0].style.removeProperty('height');
            bodyNode.removeClass('cf-collapsing-panel__body--collapsing');
        });

        bodyNode.addClass('cf-collapsing-panel__body--collapsing');
        bodyNode.css('height', `${bodyNode[0].scrollHeight}px`);

        if (!this._isOpen) {
            bodyNode[0].offsetHeight; //for make browser reflow
            bodyNode.css('height', '0px');
        }

        this._container.toggleClass('cf-collapsing-panel--open', this._isOpen);
    }
}