import Answer from "./answer";

/**
 * @desc A class for HierarchyNode
 */
export default class HierarchyNode {
    constructor(model, parent = null) {
        this._caption = model.caption;
        this._isSelectable = model.isSelectable;
        this._answer = model.answer ? new Answer(model.answer) : null;
        this._parent = parent;
        this._hasChildren = model.hasChildren;
        this._children = model.children.map(childNode => new HierarchyNode(childNode, this));
    }

    /**
     *  Get child nodes.
     *  @readonly
     *  @type {HierarchyNode[]}
     */
    get children() {
        return this._children;
    }

    /**
     * Caption
     * @type {string}
     * @readonly
     */
    get caption() {
        return this._caption;
    }

    /**
     * The parent HierarchyNode.
     * @type {HierarchyNode}
     * @readonly
     */
    get parent() {
        return this._parent;
    }

    /**
     * The answer.
     * @type {Answer}
     * @readonly
     */
    get answer() {
        return this._answer;
    }

    /**
     * Is node has children?
     * @type {boolean}
     * @readonly
     */
    get hasChildren() {
        return this._hasChildren;
    }

    /**
     * Is node can be selected as value?
     * @type {boolean}
     * @readonly
     */
    get isSelectable() {
        return this._isSelectable;
    }
}