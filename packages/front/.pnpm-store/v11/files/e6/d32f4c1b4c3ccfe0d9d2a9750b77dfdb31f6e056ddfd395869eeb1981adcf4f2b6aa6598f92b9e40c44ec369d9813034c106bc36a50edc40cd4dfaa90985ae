import type { BindingPattern, CallExpression, Expression, Identifier, Node, NodeOfType, NodeType, ParenthesizedExpression, StringLiteral, TSAsExpression, TSNonNullExpression, TSSatisfiesExpression, TSTypeAssertion } from "@yuku-toolchain/types";
type MaybeNode = Node | null | undefined;
/**
 * The static name a node denotes: an `Identifier`'s `name` or a string
 * `Literal`'s `value`. Null for anything else, so the common
 * `Identifier | StringLiteral` name slots (a `ModuleExportName`, a
 * static property key) read in one call.
 */
export declare function nameOf(node: Identifier | StringLiteral): string;
export declare function nameOf(node: MaybeNode): string | null;
/**
 * The runtime value of a `Literal` node: string, number, boolean,
 * bigint, RegExp, or null for the null literal. Undefined for
 * non-literal nodes.
 */
export declare function literalValue(node: MaybeNode): string | number | boolean | bigint | RegExp | null | undefined;
/**
 * An expression that only wraps another one: parentheses and the
 * TypeScript assertion forms erased on the way to JavaScript.
 */
export type Wrapper = ParenthesizedExpression | TSAsExpression | TSSatisfiesExpression | TSNonNullExpression | TSTypeAssertion;
/**
 * True when `node` is a {@link Wrapper}, the expressions {@link unwrap}
 * strips to reach the one that carries the meaning. Its `expression` is
 * the node underneath.
 *
 * @example
 * isWrapper(node) ? node.expression : node
 */
export declare function isWrapper(node: MaybeNode): node is Wrapper;
/**
 * The expression inside parentheses and erased TypeScript assertion
 * wrappers: `((x as any))!` unwraps to `x`. Returns the node itself
 * when nothing wraps it.
 */
export declare function unwrap(node: Expression): Expression;
/**
 * True when `node` is a call whose callee is an `Identifier` named
 * `name`, one of `name` when given an array. The callee is read
 * through {@link unwrap}.
 *
 * @example
 * isCallOf(node, "require")
 * isCallOf(node, ["defineConfig", "defineProject"])
 */
export declare function isCallOf(node: MaybeNode, name: string | readonly string[]): node is CallExpression;
/**
 * Every binding `Identifier` a pattern introduces, in source order:
 * the pattern itself, destructuring leaves, defaults' targets, and
 * rest elements.
 */
export declare function bindingIdentifiers(pattern: BindingPattern | null | undefined): Identifier[];
/** Every node of the given type(s) under `root`, in source order. */
export declare function findAll<K extends NodeType>(root: Node, types: K | readonly K[]): NodeOfType<K>[];
export {};
