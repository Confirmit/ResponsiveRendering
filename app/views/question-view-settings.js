/**
 * @desc Question view settings.
 */
export default class QuestionViewSettings {
    /**
     * @param {SurveyInfo} surveyInfo
     */
    constructor(surveyInfo) {
        this._mobileThreshold = this._convertCssValueToPixelValue(surveyInfo.mobileThreshold);
    }

    /**
     * Determine when switch between mobile and desktop layouts.
     * @returns {string}
     * @readonly
     */
    get mobileThreshold() {
        return this._mobileThreshold;
    }

    _convertCssValueToPixelValue(cssValue) {
        const node = document.createElement('div');
        node.style.boxSizing = 'border-box';
        node.style.width = cssValue;
        node.style.height = '0px';
        document.body.appendChild(node);
        const pixelValue = node.offsetWidth;
        document.body.removeChild(node);
        return pixelValue;
    }
}