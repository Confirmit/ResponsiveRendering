export default class HeadGroup {
    /**
     * Create instance.
     * @param {string} code - Group code
     * @param {string} title - Group title.
     * @param {Array} items - Array of the group answers or scales codes.
     */
    constructor(code, title, items) {
        this._code = code;
        this._title = title;
        this._items = items || [];
    }

    /**
     * Group code.
     * @type {string}
     * @readonly
     */
    get code() {
        return this._code;
    }

    /**
     * Group title.
     * @type {string}
     * @readonly
     */
    get title() {
        return this._title;
    }

    /**
     * Array of the group answers or scales codes.
     * @type {Array}
     * @readonly
     */
    get items() {
        return this._items;
    }
}
