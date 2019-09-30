import $ from 'jquery';

export default class Carousel {

    /**
     * @param {jQuery} carousel container;
     * @param {CarouselItem[]} items - array of carousel items;
     */
    constructor(container, items) {
        this._items = items;

        this._currentItemIndex = this._getInitialCurrentIndex();
        this._container = container;
        this._backNavigationButton = this._container.find('.cf-carousel__navigation-button--back');
        this._nextNavigationButton = this._container.find('.cf-carousel__navigation-button--next');

        this._attachHandlersToDOM();
    }

    get items() {
        return this._items;
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
        this._backNavigationButton.click(this.moveBack.bind(this));
        this._nextNavigationButton.click(this.moveNext.bind(this));

        this._items.forEach((item, index) => {
            item.changeEvent.on(changes => this._onItemChange(item, changes));
            this._getPagingNode(item).click(() => this.moveToItemByIndex(index));
        });
    }

    _update() {
        this._updateText();
        this._updateNavigationButtons();
        this._updatePaging();
        this._updateContent();
    }

    _updateText() {
        this._container.find('.cf-carousel__text').removeClass('cf-carousel__text--current');
        this.currentTextNode.addClass('cf-carousel__text--current');
        this._updateTextListHeight();
    }

    _updateTextListHeight() {
        this._container.find('.cf-carousel__text-list').height(this.currentTextNode);
    }

    _updateNavigationButtons() {
        if (this._currentItemIndex === 0) {
            this._backNavigationButton.addClass('cf-carousel__navigation-button--disabled');
        } else {
            this._backNavigationButton.removeClass('cf-carousel__navigation-button--disabled');
        }

        if (this._currentItemIndex === this._items.length - 1) {
            this._nextNavigationButton.addClass('cf-carousel__navigation-button--disabled');
        } else {
            this._nextNavigationButton.removeClass('cf-carousel__navigation-button--disabled');
        }
    }

    _updatePaging() {
        this._items.forEach(item => {
            const element = this._getPagingNode(item);
            element.removeClass('cf-carousel__paging-item--complete cf-carousel__paging-item--error cf-carousel__paging-item--current');

            if (item.isError) {
                element.addClass('cf-carousel__paging-item--error');
            }
            else if (item.isComplete) {
                element.addClass('cf-carousel__paging-item--complete');
            }

            if (item === this.currentItem) {
                element.addClass('cf-carousel__paging-item--current');
            }
        });
    }

    _updateContent() {
        this._container.find('.cf-carousel__content-item').removeClass('cf-carousel__content-item--current');
        this.currentContentNode.addClass('cf-carousel__content-item--current');
    }

    _onItemChange(item, changes) {
        this._updatePaging();

        if(changes.isError === true && item === this.currentItem){
            this._updateTextListHeight();
        }
    }
}

