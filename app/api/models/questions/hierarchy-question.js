import QuestionWithAnswers from "../base/question-with-answers";
import HierarchyNode from '../base/hierarchy-node';
import Utils from "../../../utils";
import RuleValidationResult from "../validation/rule-validation-result";
import ValidationTypes from "../validation/validation-types";

export default class HierarchyQuestion extends QuestionWithAnswers {
    /**
     * Create instance.
     * @param {object} model - The instance of the model.
     * @param {HierarchyService} hierarchyService - hierarchy service.
     */
    constructor(model, hierarchyService) {
        super(model);

        this._hierarchyService = hierarchyService;

        this._forceLowestLevel = model.forceLowestLevel;
        this._mandatoryLevelText = model.mandatoryLevelText;
        this._optionalLevelText = model.optionalLevelText;

        this._value = model.value || null;
        this._hierarchy = new HierarchyNode(model.hierarchy);
    }

    /**
     * Optional hierarchy level description.
     * @type {string}
     * @readonly
     */
    get optionalLevelText() {
        return this._optionalLevelText;
    }

    /**
     * Mandatory hierarchy level description.
     * @type {string}
     * @readonly
     */
    get mandatoryLevelText() {
        return this._mandatoryLevelText;
    }

    /**
     * Force user to pass all hierarchy levels.
     * @type {boolean}
     * @readonly
     */
    get forceLowestLevel() {
        return this._forceLowestLevel;
    }

    /**
     * The array of answers.
     * @type {Answer[]}
     * @readonly
     */
    get answers() {
        const answers = [];
        for (const node of this._getNodeGenerator()) {
            answers.push(node.answer);
        }
        return answers;
    }

    /**
     * Hierarchy of answers; root node.
     * @type {HierarchyNode}
     * @readonly
     */
    get hierarchy() {
        return this._hierarchy;
    }

    /**
     * Selected value (extended answer code).
     * @type {string}
     * @readonly
     */
    get value() {
        return this._value;
    }

    /**
     * @inheritDoc
     */
    get formValues() {
        let form = {};

        let answer = this.getAnswer(this.value);
        if (answer) {
            let {originalAnswerCode} = this._revealAnswerCode(this.value);
            form[this._id] = originalAnswerCode;
        }

        return form;
    }

    /**
     * Get current hierarchy node according to question value; if value is null, return root node.
     * @type {HierarchyNode}
     * @readonly
     */
    get currentHierarchyNode() {
        return Utils.isEmpty(this._value) ? this._hierarchy : this.getHierarchyNode(this._value);
    }

    /**
     * Get answer by code.
     * @param {string} code - Extended answer code.
     * @return {Answer}
     */
    getAnswer(code) {
        if(Utils.isEmpty(code)) {
            return null;
        }
        code = code.toString();

        const node = this.getHierarchyNode(code);
        return node !== null ? node.answer : null;
    }

    /**
     * Set question value.
     * @param {string} value - Extended Answer code.
     */
    setValue(value) {
        if (this.readOnly) {
            return;
        }

        const oldValue = this.value;
        const changed = this._setValue(value);
        if (changed) {
            this._updateHierarchy()
                .then(() => this._onChange({ value: this._diffPrimitives(oldValue, this.value) }));
        }
    }

    /**
     *  Get hierarchy node by extended Answer code.
     *  @param {string} answerCode - Extended Answer code.
     *  @return {HierarchyNode}
     */
    getHierarchyNode(answerCode) {
        if(Utils.isEmpty(answerCode)) {
            return null;
        }
        answerCode = answerCode.toString();

        for (const node of this._getNodeGenerator()) {
            if (node.answer.code === answerCode) {
                return node;
            }
        }
        return null;
    }

    * _getNodeGenerator() {
        const queue = [...this._hierarchy.children];
        let currentNode;
        while ((currentNode = queue.shift())) {
            yield currentNode;
            currentNode.children.forEach(childNode => queue.push(childNode));
        }
    }

    _revealAnswerCode(extendedAnswerCode) {
        let originalAnswerCode = null;
        let tableId = null;

        if(extendedAnswerCode != null) {
            originalAnswerCode = extendedAnswerCode.substring(0, extendedAnswerCode.lastIndexOf("_"));
            tableId = extendedAnswerCode.substring(extendedAnswerCode.lastIndexOf("_") + 1, extendedAnswerCode.length);
        }

        return { originalAnswerCode, tableId };
    }

    _setValue(value) {
        value = Utils.isEmpty(value) ? null : value.toString();
        if (this._value === value) {
            return false;
        }

        if (value !== null) {
            const answer = this.getAnswer(value);
            if (!answer) {
                return false;
            }
        }

        this._value = value;

        return true;
    }

    _validateRule(validationType) {
        switch (validationType) {
            case ValidationTypes.Required:
                return this._validateRequired();
            case ValidationTypes.HierarchyForceLowestLevel:
                return this._validateHierarchyForceLowestLevel();
        }
    }

    _validateRequired() {
        if (!this.required)
            return new RuleValidationResult(true);

        const isValid = !Utils.isEmpty(this.value);
        return new RuleValidationResult(isValid);
    }

    _validateHierarchyForceLowestLevel() {
        if (!this.forceLowestLevel) {
            return new RuleValidationResult(true);
        }

        if (Utils.isEmpty(this._value)) {
            return new RuleValidationResult(true);
        }

        const isValid = this.getHierarchyNode(this._value).isSelectable;
        return new RuleValidationResult(isValid);
    }

    async _updateHierarchy() {
        const currentNode = this.currentHierarchyNode;

        // clean up old branches related to current selected node
        if(currentNode.answer === null) {
            currentNode.children.length = 0;
        } else {
            currentNode.parent.children.forEach(childNode => {
                childNode.children.length = 0;
            });
        }

        // if no children don't need to request them.
        if(!currentNode.hasChildren) {
            return;
        }

        const rawChildNodes = await this._hierarchyService.getHierarchySubLevel(this._id, this._value)
            .catch(error => {
                // TODO: find a way to show global error banner or another way of handling
                // eslint-disable-next-line no-console
                console.error("Can't update hierarchy: " + error);
            });
        if(!rawChildNodes) {
            return;
        }

        // build up current branch
        rawChildNodes.forEach(rawChildNode => {
            currentNode.children.push(new HierarchyNode(rawChildNode, currentNode));
        });
    }
}