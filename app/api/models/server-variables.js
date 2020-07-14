import Event from '../../event';
/**
 * @desc Keeps server variables
 */
export default class ServerVariables {
    /**
     * Create instance.
     */
    constructor() {
        this._fields = {};
        this._changeEvent = new Event('server-variables: change');
    }

    /**
     * Fired on server variables changes.
     * The handler callback function can take parameters. When the handler is called, object will be passed as only parameter.
     * Object has two properties: type - type change event. value - server variable value.
     * @event changeEvent
     * @type {Event}
     */
    get changeEvent(){
        return this._changeEvent;
    }

    /**
     * Add variable.
     * @param {string} [name] - name of variable.
     * @param {string} [value]] - value of variable.
     */
    add(name, value) {
        if(name in this._fields){
            return;
        }

        this._fields[name] = value;
        this._changeEvent.trigger({type: 'add', name, value});
    }


    /**
     * Edit variable.
     * @param {string} [name] - name of variable.
     * @param {string} [newValue]] - new value of variable.
     */
    edit(name, newValue) {
        if(name in this._fields){
            this._fields[name] = newValue;
            this._changeEvent.trigger({type: 'edit', name, value: newValue});
        }
    }


    /**
     * Remove variable.
     * @param {string} [name] - name of variable.
     */
    remove(name) {
        if(name in this._fields){
            delete this._fields[name];
            this._changeEvent.trigger({type: 'delete', name});
        }
    }
}