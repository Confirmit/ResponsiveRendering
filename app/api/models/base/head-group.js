export default class HeadGroup {
    /**
     * Create instance.
     * @param {Object} group - Group
     * @param {answer[] | scale[]} items - Array of the group answers or scales codes.
     */
    constructor(group, items = []) {
        this._code = group.code;
        this._title = group.title;
        this._type = group.type;
        this._items = items;
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
     * Group type.
     * @type {string}
     * @readonly
     */
    get type() {
        return this._type;
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
