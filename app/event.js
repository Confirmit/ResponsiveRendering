/**
 * @desc Represents the class for event.
 */
export default class Event {
    /**
     * Create instance.
     * @param {string} name - Event name.
     */
    constructor(name) {
        this._name = name;
        this._subscribers = [];
    }

    /**
     * Event name.
     * @type {string}
     * @readonly
     */
    get name() {
        return this._name;
    }

    /**
     * Subscribe to event.
     * @param {function} subscriber - Event handler function.
     */
    on(subscriber) {
        if(this._subscribers.find(item => item === subscriber) !== undefined) {
            return;
        }

        this._subscribers.push(subscriber)
    }

    /**
     * Unsubscribe from event.
     * @param {function} subscriber - Event handler function.
     */
    off(subscriber) {
        this._subscribers = this._subscribers.filter(item => item !== subscriber);
    }

    /**
     * Trigger the event.
     * @param {object} data
     */
    trigger(data) {
        this._subscribers.forEach(item => item(data));
    }
}
