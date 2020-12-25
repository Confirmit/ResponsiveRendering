import $ from 'jquery';

export default class FloatingLabels {
    constructor(panel, lastItem, mobileThreshold){
        this._mobileThreshold = mobileThreshold;
        this._panel = panel;
        this._lastItem = lastItem;
        this._clone = null;

        this._init();
    }

    _init(){
        if(this._panel.length === 0) {
            return;
        }

        this._onScroll = this._onScroll.bind(this);
        this._onResize = this._onResize.bind(this);

        this._clone = this._panel
            .clone()
            .addClass('cf-label-panel--floating')
            .css('visibility', 'hidden')
            .insertAfter(this._panel);


        $(window).on('resize', this._onResize);
        if(window.ResizeObserver !== undefined) {
            new window.ResizeObserver(() => {
                this._adjustWidthAndPosition();
            }).observe(this._panel[0]);
        }

        this._adjustWidthAndPosition();
        this._onOffPanel();
    }

    _adjustWidthAndPosition() {
        this._clone.css({
            width: this._panel.outerWidth() + 'px',
            left: this._panel.offset().left
        });
    }

    _onOffPanel() {
        if(window.innerWidth <= this._mobileThreshold) {
            this._float();
        }
        else {
            this._hide();
        }
    }

    _float() {
        this._panelOffset = this._panel.offset().top;
        this._maxOffset = this._lastItem.offset().top - this._clone.outerHeight(true);

        $(window).on('scroll', this._onScroll);
        this._onScroll();
    }

    _hide() {
        this._clone.css('visibility', 'hidden');
        $(window).off('scroll', this._onScroll);
    }

    _handleScroll() {
        const scrollValue = $(window).scrollTop();

        if(scrollValue < this._panelOffset) { // above the topmost panel
            this._clone.css('visibility', 'hidden');
        }else if( scrollValue > this._maxOffset + this._clone.outerHeight(true)) { // below last item
            this._clone.css('visibility', 'hidden');
        } else {
            const fixedTop = scrollValue > this._maxOffset
                ? this._maxOffset - scrollValue
                : 0;
            this._clone.css({
                top: fixedTop + 'px',
                visibility: 'visible'
            });
        }
    }

    _onResize() {
        this._adjustWidthAndPosition();
        this._onOffPanel();
    }

    _onScroll() {
        this._handleScroll();
    }
}