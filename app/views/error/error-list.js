export default class ErrorList {
  constructor(listNode) {
    this._list = listNode;
  }

  addErrors(errors = []) {
      if (errors.length === 0) {
          return;
      }

      errors.forEach(error => this._appendError(error));
  }

  addError(error) {
      this._appendError(error);
  }

  clean() {
    this._list.empty();
  }

  _appendError(error) {
      this._list.append(`<li class="cf-error-list__item">${error}</li>`);
  }
}