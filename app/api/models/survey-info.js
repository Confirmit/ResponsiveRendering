/**
 * @desc Survey level information.
 */
export default class SurveyInfo {
    constructor(rawSurveyInfo) {
        this._isTest = rawSurveyInfo.isTest;
        this._isAccessible = rawSurveyInfo.isAccessible;
        this._surveyChannel = rawSurveyInfo.surveyChannel;
        this._autoNext = rawSurveyInfo.autoNext;
        this._progress = rawSurveyInfo.progress;
        this._language = rawSurveyInfo.language;
        this._mobileThreshold = rawSurveyInfo.mobileThreshold;
        this._messages = rawSurveyInfo.messages;
        this._allowNextNavigation = rawSurveyInfo.allowNextNavigation;
        this._allowBackNavigation = rawSurveyInfo.allowBackNavigation;
        this._disableValidationBanner = rawSurveyInfo.disableValidationBanner;
    }

    /**
     * Is survey executing in test mode.
     * @type {bool}
     * @readonly
     */
    get isTest() {
        return this._isTest;
    }

    /**
     * Is survey executing in accessibility mode.
     * @type {bool}
     * @readonly
     */
    get isAccessible() {
        return this._isAccessible;
    }

    /**
     * Which channel the interview was performed (Cawi|Cati|Capi).
     * @type {string}
     * @readonly
     */
    get surveyChannel() {
        return this._surveyChannel;
    }

    /**
     * Auto submit if all questions answered
     * @type {bool}
     * @readonly
     */
    get autoNext(){
        return this._autoNext;
    }

    /**
     * Current survey progress.
     * @type {number}
     * @readonly
     */
    get progress() {
        return this._progress;
    }

    /**
     * Current respondent language.
     * @returns {number}
     * @readonly
     */
    get language() {
        return this._language;
    }

    /**
     * Determine when switch between mobile and desktop layouts.
     * @returns {string} valid CSS value of size.
     * @readonly
     */
    get mobileThreshold() {
        return this._mobileThreshold;
    }

    /**
     * Localized messages.
     * @returns {object} Dictionary of messages.
     */
    get messages() {
        return {...this._messages};
    }

    /**
     * Is next navigation allowed for the current page.
     * @type {bool}
     * @readonly
     */
    get allowNextNavigation() {
        return this._allowNextNavigation;
    }

    /**
     * Is back navigation allowed for the current page.
     * @type {bool}
     * @readonly
     */
    get allowBackNavigation() {
        return this._allowBackNavigation;
    }
    /**
     * is disable toaster
     * @type {bool}
     * @readonly
     */
    get disableValidationBanner() {
        return this._disableValidationBanner;
    }
}