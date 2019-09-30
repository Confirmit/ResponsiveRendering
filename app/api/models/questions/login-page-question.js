import Question from "../base/question";
import Utils from "../../../utils";

export default class LoginPageQuestion extends Question {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     */
    constructor(model) {
        super(model);
        this._loginFieldName = model.loginFieldName;
        this._passwordFieldName = model.passwordFieldName;

        this._userName = null;
        this._password = null;
    }

    /**
     * Login page value.
     * @type {{userName: ?string, password: ?string}}
     * @readonly
     */
    get value() {
        return {userName: this._userName, password: this._password};
    }

    /**
     * @inheritDoc
     */
    get formValues() {
        const form = {
            [this._loginFieldName]: this._userName,
            [this._passwordFieldName]: this._password
        };

        return form;
    }

    /**
     * Set data for login.
     * @param {string} userName - user name.
     * @param {string} password - password.
     */
    setValue(userName, password) {
        this._setValueInternal(
            'value',
            () => this._setValue(userName, password),
            this._diffPrimitives,
        );
    }

    _setValue(userName, password) {
        this._userName = Utils.isEmpty(userName) ? null : userName.toString();
        this._password = Utils.isEmpty(password) ? null : password.toString();
        return true;
    }
}