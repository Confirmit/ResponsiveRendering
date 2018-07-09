import QuestionView from './base/question-view.js'

export default class LoginPageQuestionView extends QuestionView {
    constructor(question) {
        super(question);

        this._userNameInputNode =  this._container.find('.cf-login__field--user-name > input');
        this._passwordInputNode =  this._container.find('.cf-login__field--password > input');

        this._attachControlHandlers();
    }

    _onModelValueChange(changes) {
        this._userNameInputNode.val(changes.changes.value.userName);
        this._passwordInputNode.val(changes.changes.value.password);
    }

    /* Control handlers */
    _attachControlHandlers() {
        this._userNameInputNode.on('input', this._onInputChangeHandler.bind(this));
        this._passwordInputNode.on('input', this._onInputChangeHandler.bind(this));

    }

    _onInputChangeHandler(){
        this._question.setValue(this._userNameInputNode.val(),  this._passwordInputNode.val());
    }
}
