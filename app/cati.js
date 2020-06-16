export default class Cati{
    constructor(page){
        this._page = page;
    }

    /**
     * Abandons the interview in progress.
     */
    terminate(){
        this._page.serverVariables.add('__btnExit', '1');
        this._page.next(false);
    }

    /**
     * Allows making an appointment. Displays the Appointment dialog window.
     */
    appointment(){
        this._page.serverVariables.add('__its', '1');
        this._page.next(false);
    }
}