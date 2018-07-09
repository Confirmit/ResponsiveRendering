/**
 * @desc Survey level information.
 */
export default class SurveyInfo {
    constructor(rawSurveyInfo) {
        this._isTest = rawSurveyInfo.isTest;
        this._progress = rawSurveyInfo.progress;
        this._language = rawSurveyInfo.language;
        this._mobileThreshold = rawSurveyInfo.mobileThreshold;
        this._messages = rawSurveyInfo.messages;
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
}