export default class Capi{
    constructor(page){
        this._page = page;
    }

    /**
     * Postpone interview
     */
    postpone(){
        this._page.serverVariables.add('__exit', 'true');
        this._page.next(false);
    }
}