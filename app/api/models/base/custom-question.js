export default class CustomQuestion {
    /**
     * @param {Object} rawCustomQuestion - custom question settings.
     */
    constructor(rawCustomQuestion) {
        this._id = rawCustomQuestion.id;
        this._settings = JSON.parse(rawCustomQuestion.settingsJson);
    }

    /**
     * Custom question GUID
     * @return {string}
     */
    get id() {
        return this._id;
    }

    /**
     * Custom question settings
     * @return {object}
     */
    get settings() {
        return this._settings;
    }
}
