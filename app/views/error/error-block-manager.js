import AnswerErrorBlock from './answer-error-block';

export default class ErrorBlockManager {
    constructor() {
        this._answerErrorBlocks = [];
    }

    showErrors(blockId, targetNode, errors) {
        if(errors.length === 0) {
            return;
        }

        this._showErrorBlock(blockId, targetNode, errors);
    }

    removeAllErrors() {
        this._answerErrorBlocks.forEach(block => block.remove());
        this._answerErrorBlocks = [];
    }

    _showErrorBlock(blockId, targetNode, errors)  {
        this._createBlock(blockId, targetNode).showErrors(errors);
    }

    _createBlock(id, target) {
        const block = new AnswerErrorBlock(id, target);
        this._answerErrorBlocks.push(block);
        return block;
    }
}