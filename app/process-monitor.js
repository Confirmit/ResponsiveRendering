import Event from './event';

export default class ProcessMonitor{
    constructor(){
        this._items = [];
        this._changeStateEvent = new Event('processMonitor: idle');
    }

    get idle(){
        return this._items.length === 0;
    }

    get changeStateEvent(){
        return this._changeStateEvent;
    }

    addProcess(name){
        if(this._items.includes(name)){
            return;
        }

        this._items.push(name);

        if(this._items.length === 1){
            this._changeStateEvent.trigger()
        }
    }

    removeProcess(name){
        if(!this._items.includes(name)){
            return;
        }

        const index = this._items.indexOf(name);

        this._items.splice(index ,1);

        if(this._items.length === 0){
            this._changeStateEvent.trigger()
        }
    }
}