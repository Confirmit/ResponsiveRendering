export default class HierarchyService {
    constructor(endpoint = "", languageId = null) {
        this._endpoint = endpoint;
        this._languageId = languageId;
        this._xhr = null;
    }

    /**
     * Get children of hierarchy node.
     * @param {string} questionId - Question id
     * @param {string} extendedAnswerCode - Answer code corresponding to hierarchy node
     * @returns {Promise<object>}
     */
    getHierarchySubLevel(questionId, extendedAnswerCode) {
        if (this._xhr) {
            this._xhr.abort();
        }

        let answerCode = null;
        let tableId = null;
        if(extendedAnswerCode !== null) {
            answerCode = extendedAnswerCode.substring(0, extendedAnswerCode.lastIndexOf("_"));
            tableId = extendedAnswerCode.substring(extendedAnswerCode.lastIndexOf("_") + 1, extendedAnswerCode.length);
        }

        return new Promise((resolve, reject) => {
            this._xhr = new XMLHttpRequest();
            this._xhr.open('GET', this._buildUrl(questionId, answerCode, tableId), true);
            this._xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            this._xhr.setRequestHeader('pragma', 'no-cache');
            this._xhr.addEventListener('load', () => {
                let data = null;
                try {
                    data = JSON.parse(this._xhr.responseText);
                } catch (exception) {
                    reject('invalid JSON');
                }
                resolve(this._requestComplete(data, extendedAnswerCode === null));
            }, false);
            this._xhr.addEventListener('error', response => reject(response.target.statusText), false);
            this._xhr.addEventListener('loadend', () => { this._xhr = null });
            this._xhr.send();
        });
    }

    _buildUrl(questionId = null, answerCode = null, tableId = null) {
        const properties = {
            "q": questionId,
            "l": this._languageId,
            "key": answerCode,
            "t": tableId
        };

        let url = this._endpoint;

        for(let key in properties){
            if(properties[key] !== null){
                url += `&${key}=${properties[key]}`;
            }
        }
        return url;
    }

    _requestComplete(data, firstLevelOnly) {
        const elements = firstLevelOnly ?  data.Elements : data.Elements[0].Elements;
        if(elements === null) {
            return [];
        }
        return elements.filter(this._visibilityFilter).map(this._normalizeNode);
    }

    _visibilityFilter(node) {
        return node.HasChildren || node.IsSelectable;
    }
    _normalizeNode(node) {
        return {
            "caption": node.Caption,
            "isSelectable": node.IsSelectable,
            "hasChildren": node.HasChildren,
            "answer": {
                "code": `${node.Key}_${node.TableId}`,
                "text": node.Value
            },
            "children": node.Elements !== null ? node.Elements.filter(this._visibilityFilter).map(this._normalizeNode) : [],
        };
    }
}