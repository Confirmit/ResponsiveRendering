/**
 * @desc Test navigator question model.
 */
export default class TestNavigatorQuestion{
    constructor(question){
        this._question = question;
    }

    /**
     * Question id.
     * @type {string}
     * @readonly
     */
    get id(){
        return this._question.id !== undefined ? this._question.id : '';
    }

    /**
     * Question title.
     * @type {string}
     * @readonly
     */
    get title(){
        return this._question.title !== undefined ? this._question.title : '';
    }

    /**
     * Question type.
     * @type {string}
     * @readonly
     */
    get type(){
        return this._question.type !== undefined ? this._question.type : '';
    }

    /**
     * Question link.
     * @type {string}
     * @readonly
     */
    get link(){
        return this._question.link !== undefined ? this._question.link : '';
    }
}