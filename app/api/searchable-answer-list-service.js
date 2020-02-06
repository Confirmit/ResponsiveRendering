export default class SearchableAnswerListService {
    constructor(endpoint = "", languageId = null) {
        this._endpoint = endpoint;
        this._languageId = languageId;
        this._xhr = null;
    }

    search(questionId, search = "", skip = 0) {
        if (this._xhr) {
            this._xhr.abort();
        }

        return new Promise((resolve, reject) => {
            this._xhr = new XMLHttpRequest();
            this._xhr.open('GET', this._buildUrl(questionId, search, skip), true);
            this._xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            this._xhr.setRequestHeader('pragma', 'no-cache');
            this._xhr.addEventListener('load', () => {
                let data = null;
                try {
                    data = JSON.parse(this._xhr.responseText);
                } catch (exception) {
                    reject('invalid JSON');
                }
                resolve(data);
            }, false);
            this._xhr.addEventListener('error', response => reject(response.target.statusText), false);
            this._xhr.addEventListener('loadend', () => { this._xhr = null });
            this._xhr.send();
        });
    }

    _buildUrl(questionId, search, skip) {
        return `${this._endpoint}&q=${questionId}&search=${encodeURIComponent(search)}&skip=${skip}&l=${this._languageId}`;
    }
}