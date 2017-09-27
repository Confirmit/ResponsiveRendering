import $ from 'jquery';

export default class SmartBanner {
    constructor() {
        this._container = $(".cf-smartbanner");
        this._container.find(".cf-smartbanner__close-button").click(() => this.close());
    }

    close() {
        this._container.addClass("cf-smartbanner_hidden");
    }
}