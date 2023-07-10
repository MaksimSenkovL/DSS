export default class BaseElement {
    _root;

    constructor(node, extensionElement) {
        this._root = node;
    }

    removeChildrens() {
        this._root.innerHTML = "";
    }

    clearNode(node) {
        node.innerHTML = "";
    }
}
