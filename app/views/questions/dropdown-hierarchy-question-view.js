import QuestionWithAnswersView from "./base/question-with-answers-view";
import Utils from './../../utils.js';

export default class DropdownHierarchyQuestionView extends QuestionWithAnswersView {
    /**
     * @param {HierarchyQuestion} question
     * @param {QuestionViewSettings} settings
     */
    constructor(question, settings = null) {
        super(question, settings);
        this._init();
    }

    _init() {
        let currentNode = this._question.currentHierarchyNode;
        while (currentNode !== null) {
            this._getSelectNodeByHierarchyNode(currentNode).on('change', event => this._question.setValue(event.target.value));
            currentNode = currentNode.parent;
        }
    }

    _getSelectNodeCaptionId(node) {
        if (node.answer == null) {
            return `${this._question.id}_root_caption`;
        }
        return `${this._getAnswerInputNodeId(node.answer.code)}_caption`;
    }

    _getSelectNodeByHierarchyNode(node) {
        if (node.answer !== null) {
            return this._getAnswerInputNode(node.answer.code);
        } else {
            return this._container.find(`#${this._question.id}_root_input`);
        }
    }

    _getAnswerNodeByHierarchyNode(node) {
        if (node.answer !== null) {
            return this._getAnswerNode(node.answer.code);
        } else {
            return this._container.find(`#${this._question.id}_root`);
        }
    }

    _removeLowerLevels(currentNode) {
        const node = currentNode.parent !== null ? currentNode.parent : currentNode;
        const answerNode = this._getAnswerNodeByHierarchyNode(node);
        const currentIndex = this._container.find(".cf-dropdown-hierarchy__node").index(answerNode);
        this._container.find(".cf-dropdown-hierarchy__node").filter(index => index > currentIndex).remove();
    }

    _updateUpperLevels(node) {
        if(node === this._question.hierarchy){
            this._updateDropdownNode(this._question.hierarchy, '""');
            return;
        }

        let currentNode = node;
        while (currentNode.parent !== null) {
            this._updateDropdownNode(currentNode.parent, currentNode.answer.code);
            currentNode = currentNode.parent;
        }
    }

    _updateDropdownNode(hierarchyNode, value){
        const input = this._getSelectNodeByHierarchyNode(hierarchyNode);
        input.find('option')
            .removeClass("cf-dropdown__item--selected")
            .removeAttr('selected');

        input.find(`option[value=${value}]`)
            .addClass("cf-dropdown__item--selected")
            .attr('selected', 'selected');
    }

    _renderSubLevel(currentNode) {
        if (!currentNode.hasChildren || currentNode === this._question.hierarchy) {
            return;
        }

        const containerHtml = `<div class="cf-dropdown-hierarchy__node cf-list__item" id="${this._getAnswerNodeId(currentNode.answer.code)}" aria-live="polite" aria-atomic="true"></div>`;

        let contentHtml = '';
        if (currentNode.caption !== null) {
            contentHtml += `<label class="cf-dropdown-hierarchy__node-caption" id="${this._getSelectNodeCaptionId(currentNode)}" for="${this._getAnswerInputNodeId(currentNode.answer.code)}">${currentNode.caption}</label>`;
        }

        contentHtml += `<select class="cf-dropdown" id="${this._getAnswerInputNodeId(currentNode.answer.code)}" ${this._getAriaLabelAttr(currentNode)} aria-required="${this._isSelectNodeRequired(currentNode)}" aria-errormessage="${this._getQuestionErrorNodeId()}" aria-invalid="false">`;
        contentHtml += `   <option class="cf-dropdown__item" value="${currentNode.answer.code}">${this._getDefaultOptionText(currentNode)}</option>`;

        currentNode.children.forEach(node => {
            contentHtml += `   <option class="cf-dropdown__item" value="${node.answer.code}">${node.answer.text}</option>`;
        });

        contentHtml += '</select>';

        // append container first
        this._container.find('.cf-dropdown-hierarchy').append(containerHtml);

        // append content with small delay just to help screen reader realize that content is updated
        setTimeout(() => {
            this._getAnswerNode(currentNode.answer.code).append(contentHtml);
            this._getSelectNodeByHierarchyNode(currentNode).on('change', event => this._question.setValue(event.target.value));
        }, this._settings.isAccessible ? 200 : 0);
    }

    _isSelectNodeRequired(hierarchyNode) {
        return hierarchyNode.answer === null ? this._question.required : this._question.forceLowestLevel;
    }

    _getDefaultOptionText(hierarchyNode) {
        return this._isSelectNodeRequired(hierarchyNode) ? this._question.mandatoryLevelText : this._question.optionalLevelText;
    }

    _getAriaLabelAttr(hierarchyNode) {
        if (hierarchyNode.caption !== null) {
            return ""
        }

        if (hierarchyNode.answer === null) {
            const labelledby = Utils.isEmpty(this._question.instruction) ? `${this._question.id}_text` : `${this._question.id}_instruction`;
            return `aria-labelledby="${labelledby}"`;
        }

        return `aria-label="${Utils.htmlEncode(this._getDefaultOptionText(hierarchyNode))}"`;
    }

    _showErrors(validationResult) {
        super._showErrors(validationResult);

        const currentHierarchyNode = this._question.currentHierarchyNode;
        const selectNode = this._getSelectNodeByHierarchyNode(currentHierarchyNode);
        selectNode.attr('aria-invalid', true);
    }

    _hideErrors() {
        super._hideErrors();
        this._container.find('.cf-dropdown').attr('aria-invalid', false);
    }

    _onModelValueChange() {
        const currentNode = this._question.currentHierarchyNode;

        this._removeLowerLevels(currentNode);
        this._updateUpperLevels(currentNode);
        this._renderSubLevel(currentNode);
    }
}