/**
 * The walk context: one reused object exposing the current position and
 * the tree mutation operations. Valid only during the visit that
 * receives it, do not store it. Underscore members are engine state.
 */
export class WalkContext {
    _ancestors = [];
    _node = null;
    _key = null;
    _list = null;
    _frame = null;
    _skip = false;
    _stopped = false;
    _removed = false;
    _replacement = null;
    /** State threaded through the walk, the third `walk` argument. */
    state;
    /** The node being visited. */
    get node() {
        return this._node;
    }
    /** The node holding {@link node}, or null at the walk root. */
    get parent() {
        const a = this._ancestors;
        return a.length === 0 ? null : a[a.length - 1];
    }
    /** The field on {@link parent} holding {@link node}, or null at the root. */
    get key() {
        return this._key;
    }
    /** Index within an array field, or null in a plain field. */
    get index() {
        return this._list === null ? null : this._frame.i;
    }
    /** Ancestors from the walk root down to {@link parent}. */
    ancestors() {
        return [...this._ancestors];
    }
    /** Do not descend into the current node's children. */
    skip() {
        this._skip = true;
    }
    /** Stop the walk entirely. */
    stop() {
        this._stopped = true;
    }
    /**
     * Replace the current node. The walk continues into the replacement's
     * children and `leave` fires for the replacement's type. A synthetic
     * node with `start === 0 && end === 0` inherits the original span,
     * for source maps. Throws at the walk root.
     */
    replace(node) {
        if (node === null || typeof node !== "object" || typeof node.type !== "string") {
            throw new TypeError("replace: expected an AST node");
        }
        if (this.parent === null) {
            throw new TypeError("replace: cannot replace the walk root");
        }
        if (node.start === 0 && node.end === 0) {
            node.start = this.node.start;
            node.end = this.node.end;
        }
        this._replacement = node;
    }
    /**
     * Remove the current node from its parent: spliced from array fields,
     * nulled in plain fields. Children are not walked and `leave` does
     * not fire. Throws at the walk root.
     */
    remove() {
        if (this.parent === null) {
            throw new TypeError("remove: cannot remove the walk root");
        }
        this._removed = true;
    }
    /** Insert a sibling before the current node, not visited. Array fields only. */
    insertBefore(node) {
        this.#insert(node, 0);
        this._frame.i++;
    }
    /** Insert a sibling after the current node, visited by the walk. Array fields only. */
    insertAfter(node) {
        this.#insert(node, 1);
    }
    #insert(node, offset) {
        if (this._list === null) {
            throw new TypeError("insertBefore/insertAfter require a node in an array field");
        }
        this._list.splice(this._frame.i + offset, 0, node);
    }
}
