import $ from 'jquery';
import KEYS from "../helpers/keyboard-keys";
import Event from "../../event";

export default class Carousel {

    /**
     * @param {jQuery} carousel container;
     * @param {CarouselItem[]} items - array of carousel items;
     */
    constructor(container, items) {
        this._items = items;

        this._moveEvent = new Event("carousel:move");

        this._currentItemIndex = this._getInitialCurrentIndex();
        this._container = container;
        this._backNavigationButton = this._container.find('.cf-carousel__navigation-button--back');
        this._nextNavigationButton = this._container.find('.cf-carousel__navigation-button--next');

        this._attachHandlersToDOM();
    }

    get items() {
        return this._items;
    }

    get currentItemIndex() {
        return this._currentItemIndex;
    }

    get currentItem() {
        return this.items[this._currentItemIndex];
    }

    get currentTextNode() {
        return $(`#${this.currentItem.id}_carousel_text`);
    }

    get currentContentNode() {
        return $(`#${this.currentItem.id}_carousel_content`);
    }

    get moveEvent() {
        return this._moveEvent;
    }

    moveNext() {
        this.moveToItemByIndex(this._currentItemIndex + 1);
    }

    moveBack() {
        this.moveToItemByIndex(this._currentItemIndex - 1);
    }

    moveToItemByIndex(index) {
        if (index >= this._items.length  || index < 0 ) {
            return;
        }

        this._currentItemIndex = index;
        this._update();

        this._moveEvent.trigger();
    }

    moveToItemById(itemId){
        const index = this._items.findIndex(item => item.id === itemId);
        this.moveToItemByIndex(index);
    }

    _getInitialCurrentIndex(){
        const index = this._items.findIndex(item => !item.isComplete);
        return index !== -1 ? index :  this._items.length - 1;
    }

    _getPagingNode(item) {
        return $(`#${item.id}_carousel_paging`);
    }

    _attachHandlersToDOM() {
        this._backNavigationButton
            .on('click', this.moveBack.bind(this))
            .on('keydown', event => this._onSelectKeyPress(event, this.moveBack.bind(this)));
        this._nextNavigationButton
            .on('click', this.moveNext.bind(this))
            .on('keydown', event => this._onSelectKeyPress(event, this.moveNext.bind(this)));

        this._items.forEach((item, index) => {
            item.changeEvent.on(changes => this._onItemChange(item, changes));
            this._getPagingNode(item)
                .click(() => this.moveToItemByIndex(index))
                .on('keydown', event => this._onSelectKeyPress(event, () => this.moveToItemByIndex(index)));
        });
    }

    _update() {
        this._updateText();
        this._updateNavigationButtons();
        this._updatePaging();
        this._updateContent();
    }

    _updateText() {
        this._container.find('.cf-carousel__text')
            .removeClass('cf-carousel__text--current')
            .attr('aria-hidden', 'true');
        this.currentTextNode
            .addClass('cf-carousel__text--current')
            .attr('aria-hidden', 'false');
        this._updateTextListHeight();
    }

    _updateTextListHeight() {
        this._container.find('.cf-carousel__text-list').height(this.currentTextNode);
    }

    _updateNavigationButtons() {
        this._updateNavigationButton(this._backNavigationButton, this._currentItemIndex === 0);
        this._updateNavigationButton(this._nextNavigationButton, this._currentItemIndex === this._items.length - 1);
    }

    _updateNavigationButton(buttonNode, disable) {
        if (disable) {
            buttonNode.addClass('cf-carousel__navigation-button--disabled');
            buttonNode.attr('tabindex', '-1');
            buttonNode.attr('aria-hidden', 'true');
        } else {
            buttonNode.removeClass('cf-carousel__navigation-button--disabled');
            buttonNode.attr('tabindex', '0');
            buttonNode.attr('aria-hidden', 'false');
        }
    }

    _updatePaging() {
        this._items.forEach(item => {
            const element = this._getPagingNode(item);
            element.removeClass('cf-carousel__paging-item--complete cf-carousel__paging-item--error cf-carousel__paging-item--current');
            element.attr('aria-pressed', 'false');

            if (item.isError) {
                element.addClass('cf-carousel__paging-item--error');
            }
            else if (item.isComplete) {
                element.addClass('cf-carousel__paging-item--complete');
            }

            if (item === this.currentItem) {
                element.addClass('cf-carousel__paging-item--current');
                element.attr('aria-pressed', 'true');
            }
        });
    }

    _updateContent() {
        this._container.find('.cf-carousel__content-item')
            .attr('aria-hidden', 'true')
            .removeClass('cf-carousel__content-item--current');
        this.currentContentNode
            .addClass('cf-carousel__content-item--current')
            .attr('aria-hidden', 'false');
    }


    _onSelectKeyPress(event, callback) {
        if ([KEYS.SpaceBar, KEYS.Enter].includes(event.keyCode) === false) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        callback();
    }

    _onItemChange(item, changes) {
        this._updatePaging();

        if(changes.isError === true && item === this.currentItem){
            this._updateTextListHeight();
        }
    }
}

