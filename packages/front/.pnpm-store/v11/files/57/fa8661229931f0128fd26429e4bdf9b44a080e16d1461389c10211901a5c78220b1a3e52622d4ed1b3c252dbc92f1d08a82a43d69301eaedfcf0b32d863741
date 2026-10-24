import type { Node, NodeOfType, NodeType } from "@yuku-toolchain/types";
import { type AliasMap, type AliasName } from "./aliases.js";
import { WalkContext } from "./context.js";
/** A visitor function for one node type or alias. */
export type WalkHandler<T extends Node = Node, S = unknown> = (node: T, ctx: WalkContext<T, S>) => void;
/** Enter and leave hooks for one node type or alias. */
export interface WalkHooks<T extends Node = Node, S = unknown> {
    enter?: WalkHandler<T, S>;
    leave?: WalkHandler<T, S>;
}
type Visitor<T extends Node, S> = WalkHandler<T, S> | WalkHooks<T, S>;
/**
 * Handlers keyed by node `type`, by alias (`Expression`, `Function`,
 * ...), or the universal `enter` / `leave`. A bare function is an enter
 * handler. Per node the order is universal `enter`, alias enters in
 * visitor key order, the typed enter, children, then the mirror for
 * leave.
 */
export type Visitors<S = unknown> = {
    [K in NodeType]?: Visitor<NodeOfType<K>, S>;
} & {
    [A in AliasName]?: Visitor<AliasMap[A], S>;
} & {
    enter?: WalkHandler<Node, S>;
    leave?: WalkHandler<Node, S>;
};
/**
 * Walk an AST depth-first, dispatching to typed visitors and mutating
 * in place. Traversal order is driven by tables generated from the
 * parser's AST definition, so it can never drift. Returns the root.
 */
export declare function walk<T extends Node, S = unknown>(root: T, visitors: Visitors<S>, state?: S): T;
/**
 * The async counterpart of {@link walk}: identical traversal order and
 * mutation semantics, with every handler awaited before the walk moves
 * on. Resolves to the root.
 */
export declare function walkAsync<T extends Node, S = unknown>(root: T, visitors: AsyncVisitors<S>, state?: S): Promise<T>;
/** An async visitor function for one node type or alias. */
export type AsyncWalkHandler<T extends Node = Node, S = unknown> = (node: T, ctx: WalkContext<T, S>) => void | Promise<void>;
/** Enter and leave hooks for one node type or alias in an async walk. */
export interface AsyncWalkHooks<T extends Node = Node, S = unknown> {
    enter?: AsyncWalkHandler<T, S>;
    leave?: AsyncWalkHandler<T, S>;
}
/** {@link Visitors} whose handlers may return promises. */
export type AsyncVisitors<S = unknown> = {
    [K in NodeType]?: AsyncWalkHandler<NodeOfType<K>, S> | AsyncWalkHooks<NodeOfType<K>, S>;
} & {
    [A in AliasName]?: AsyncWalkHandler<AliasMap[A], S> | AsyncWalkHooks<AliasMap[A], S>;
} & {
    enter?: AsyncWalkHandler<Node, S>;
    leave?: AsyncWalkHandler<Node, S>;
};
export declare function _walk(root: Node, visitors: Visitors<never> | AsyncVisitors<never>, state: unknown, ctx: WalkContext): void;
export declare function _walkAsync(root: Node, visitors: AsyncVisitors<never>, state: unknown, ctx: WalkContext): Promise<void>;
export {};
