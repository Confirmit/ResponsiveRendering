import $ from 'jquery';
import Cookies from 'js-cookie';
import Draggable from 'views/helpers/draggable';

export default class TestNavigatorView {
    constructor(testNavigator) {
        this._questions = testNavigator.questions;
        this._filteredQuestions = this._questions;
        this._currentQuestionId = testNavigator.currentQuestionId;
        this._iconsSvgUrl = "/cf_clientutil/wix/images/question-type-icons.svg";

        this._container = null;
        this._title = null;
        this._collapseButtonNode = null;
        this._searchInputNode = null;
        this._listNode = null;

        this._delayedSearchHandler = null;
        this._draggable = null;

        this._init();
    }

    _init() {
        this._render();

        this.initPolyfill();

        this._container = $('.cf-test-navigator');
        this._collapseButtonNode = this._container.find('.cf-test-navigator__collapse-button');
        this._searchInputNode = this._container.find('.cf-test-navigator__search input');
        this._listNode = this._container.find('.cf-test-navigator__list');

        this._attachControlHandlers();

        this._setInitialState();
    }

    initPolyfill() {
        if (window.navigator.userAgent.match(/.*Trident\/[4-7].0/) === null &&  window.navigator.userAgent.match(/MSIE\s([0-9]+);/) === null) {
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("GET", this._iconsSvgUrl, true);
        xhr.onload = e => {
            const data = (new DOMParser()).parseFromString(e.target.responseText, "text/xml");
            const rootNode = data.querySelector('svg');

            if (rootNode === null) {
                // eslint-disable-next-line no-console
                console.error('TestNavigator: couldn\'t parse response');
                return;
            }

            const iconsNodes = document.querySelectorAll('.cf-test-navigator svg');

            for (let i = 0; i < iconsNodes.length; i++) {
                let node = iconsNodes[i];
                let svgId = node.querySelector('use').getAttribute('xlink:href').split('#')[1];
                let sourceNode = rootNode.querySelector('#' + svgId);

                if (sourceNode !== null) {
                    node.querySelector('use').setAttribute('href', '#' + svgId);
                    let sourceViewBox = sourceNode.getAttribute("viewBox");

                    if (node.getAttribute("viewBox") == null && sourceViewBox) {
                        node.setAttribute('viewBox', sourceViewBox);
                    }

                    node.appendChild(sourceNode.cloneNode(true));
                }
            }
        };

        xhr.onerror = e => {
            // eslint-disable-next-line no-console
            console.error('TestNavigator: couldn\'t load icons SVG (' + e.target.status + ': ' + e.target.statusText + ')');
        };

        xhr.send();
    }

    _render() {
        $('body').append(
            '<div class="cf-test-navigator" style="visibility: hidden">' +
            '<div class="cf-test-navigator__collapse-button"></div>' +
            '   <div class="cf-test-navigator__title">Test Navigator</div>' +
            '   <div class="cf-test-navigator__search">' +
            '       <input type="text" placeholder="Search">' +
            '   </div>' +
            '   <div class="cf-test-navigator__list">' + this._renderRows() + '</div>' +
            '</div>'
        );
    }

    _renderRows() {
        return this._filteredQuestions.map(question => this._renderRow(question)).join('');
    }

    _renderRow(question) {
        const activeClass = this._currentQuestionId !== null && this._currentQuestionId === question.id ? ' cf-test-navigator__list-item--active' : '';
        const hint = `${question.id} ${question.title}`;
        const icon = '<svg class="cf-test-navigator__list-item-icon"><use xlink:href="' + this._iconsSvgUrl + '#icon-' + question.type + '" /></svg>';
        const content = `${icon}<span>${question.id}</span> ${question.title}`;
        return `<a href="${question.link || ''}" class="cf-test-navigator__list-item ${activeClass}" title="${hint}">${content}</a>`;
    }

    _attachControlHandlers() {
        this._collapseButtonNode.on('click', this._onCollapseButtonClickHandler.bind(this));
        this._searchInputNode.on('input', this.onInputChangeHandler.bind(this));
        this._listNode.on('scroll', this._onListNodeScrollHandler.bind(this));
        this._draggable = new Draggable(this._container, {handle: this._container.find('.cf-test-navigator__title')});
        this._draggable.dragEndEvent.on(coordinates => {
            Object.keys(coordinates).forEach(key => this._setCookieProperty(key, coordinates[key]));
        });
    }

    _setInitialState() {
        this._restoreCollapsed();
        this._restorePosition();

        this._container.css('visibility', 'visible');
    }

    _restoreCollapsed() {
        const collapsedFromCookies = this._getCookieProperty('collapsed');
        this._collapse(collapsedFromCookies === 1);
    }

    _restorePosition() {
        const x = parseInt(this._getCookieProperty('x')) || window.innerWidth - this._container.width() - 40;
        const y = parseInt(this._getCookieProperty('y')) || 40;

        this._container.css({
            'position': 'fixed',
            'left': x.toString() + 'px',
            'top': y.toString() + 'px'
        });
    }

    _restoreScroll() {
        const scrollFromCookies = parseInt(this._getCookieProperty('scroll')) || 0;

        let scroll = scrollFromCookies;

        const activeItem = this._listNode.children('.cf-test-navigator__list-item--active');

        if (activeItem.length === 1) {
            const activeItemOffset = activeItem.offset().top - this._listNode.offset().top;

            const minSuitableOffset = scrollFromCookies;
            const maxSuitableOffset = scrollFromCookies + this._listNode.height() - activeItem.height();

            if (activeItemOffset < minSuitableOffset || activeItemOffset >= maxSuitableOffset) {
                scroll = activeItemOffset;
            }
        }

        this._scrollTop(scroll);
    }

    _collapse(shouldCollapse = null) {
        if (shouldCollapse === null) {
            this._container.toggleClass('cf-test-navigator--collapsed');
        } else {
            this._container.toggleClass('cf-test-navigator--collapsed', shouldCollapse);
        }

        const isCollapsed = this._container.hasClass('cf-test-navigator--collapsed') ? 1 : 0;

        if (!isCollapsed) {
            this._restoreScroll();
        }

        this._setCookieProperty('collapsed', isCollapsed);
    }

    _scrollTop(scroll) {
        this._listNode.scrollTop(scroll);
        // forced cookie update to ensure that the state is actual (when scrollTop is 0 onScroll event sometime doesn't fire up)
        this._setCookieProperty('scroll', scroll);
    }

    _refreshQuestionList() {
        this._listNode.html(this._renderRows());
    }

    _getCookieProperty(property) {
        const cookie = Cookies.getJSON('cf-test-navigator-responsive') || {};
        return cookie[property];
    }

    _setCookieProperty(property, value) {
        const cookie = Cookies.getJSON('cf-test-navigator-responsive') || {};
        Cookies.set('cf-test-navigator-responsive', {...cookie, [property]: value});
    }

    _filterQuestionList(searchValue) {
        this._delayedSearchHandler = null;
        if (searchValue.length !== 0) {
            this._filteredQuestions = this._questions.filter(item => {
                if (item.id.toLowerCase().indexOf(searchValue) > -1 || item.title.toLowerCase().indexOf(searchValue) > -1) {
                    return true;
                }
                return false;
            });
        } else {
            this._filteredQuestions = this._questions;
        }
    }

    _onCollapseButtonClickHandler(event) {
        event.preventDefault();

        this._collapse();

        if (this._container.hasClass('cf-test-navigator--collapsed')) {
            return;
        }

        const possibleContainerPosition = window.innerHeight - this._container.outerHeight();
        if (event.clientY > possibleContainerPosition) {
            this._container.css('top', possibleContainerPosition);
        }
    }

    _onListNodeScrollHandler(event) {
        this._setCookieProperty('scroll', event.target.scrollTop);
    }

    onInputChangeHandler(event) {
        if (this._delayedSearchHandler) {
            clearTimeout(this._delayedSearchHandler);
        }
        this._delayedSearchHandler = setTimeout(() => {
            this._filterQuestionList(event.target.value.toLowerCase());
            this._refreshQuestionList();
        }, 500);
    }
}

