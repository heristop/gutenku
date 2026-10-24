import type { Node } from "@yuku-toolchain/types";
export interface Frame {
    i: number;
}
/**
 * The walk context: one reused object exposing the current position and
 * the tree mutation operations. Valid only during the visit that
 * receives it, do not store it. Underscore members are engine state.
 */
export declare class WalkContext<T extends Node = Node, S = unknown> {
    #private;
    _ancestors: Node[];
    _node: Node | null;
    _key: string | null;
    _list: Node[] | null;
    _frame: Frame | null;
    _skip: boolean;
    _stopped: boolean;
    _removed: boolean;
    _replacement: Node | null;
    /** State threaded through the walk, the third `walk` argument. */
    state: S;
    /** The node being visited. */
    get node(): T;
    /** The node holding {@link node}, or null at the walk root. */
    get parent(): Node | null;
    /** The field on {@link parent} holding {@link node}, or null at the root. */
    get key(): string | null;
    /** Index within an array field, or null in a plain field. */
    get index(): number | null;
    /** Ancestors from the walk root down to {@link parent}. */
    ancestors(): Node[];
    /** Do not descend into the current node's children. */
    skip(): void;
    /** Stop the walk entirely. */
    stop(): void;
    /**
     * Replace the current node. The walk continues into the replacement's
     * children and `leave` fires for the replacement's type. A synthetic
     * node with `start === 0 && end === 0` inherits the original span,
     * for source maps. Throws at the walk root.
     */
    replace(node: Node): void;
    /**
     * Remove the current node from its parent: spliced from array fields,
     * nulled in plain fields. Children are not walked and `leave` does
     * not fire. Throws at the walk root.
     */
    remove(): void;
    /** Insert a sibling before the current node, not visited. Array fields only. */
    insertBefore(node: Node): void;
    /** Insert a sibling after the current node, visited by the walk. Array fields only. */
    insertAfter(node: Node): void;
}
