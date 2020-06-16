import $ from 'jquery';

export default class HiddenInputs {
    constructor(serverVariables) {
        this._container = $('.cf-page__hidden-fields');
        this._serverVariables = serverVariables;

        this._init();
    }

    _getInputNode(name) {
        return this._container.find(`input[type=hidden][name=${name}]`);
    }

    _init() {
        this._container.find('input[type=hidden]').each((index, element) => {
            const node = $(element);
            this._serverVariables.add(node.attr('name'), node.attr('value'));
        });

        this._serverVariables.changeEvent.on(this._onChangeServerVariables.bind(this));
    }

    _addHiddenInputNode(name, value) {
        const input = $(`<input type="hidden" name="${name}"/>`);
        if (value !== null) {
            input.attr('value', value);
        }
        this._container.append(input);
    }

    _deleteHiddenInputNode(name) {
        this._getInputNode(name).remove();
    }

    _editHiddenInputNode(name, value) {
        this._getInputNode(name).attr('value', value);
    }

    _onChangeServerVariables({type, name, value = null}) {
        switch (type) {
            case 'add':
                this._addHiddenInputNode(name, value);
                break;
            case 'delete':
                this._deleteHiddenInputNode(name);
                break;
            case 'edit':
                this._editHiddenInputNode(name, value);
                break;
        }
    }
}