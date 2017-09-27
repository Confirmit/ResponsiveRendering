import $ from 'jquery';

export default class HiddenQuestionView {
    constructor(question) {
        this._question = question;
        this._container = $(`#${this._question.id}`);
    }

    render(){
        this._container.find('.confirmit-hidden-input').remove();
        const formValues = Object.entries(this._question.formValues);
        const inputs = formValues.map(([name, value]) => {
            return $('<input/>', {
                type: 'hidden',
                class: 'confirmit-hidden-input',
                name: name,
                value: value
            });
        });
        this._container.prepend(inputs);
    }
}
