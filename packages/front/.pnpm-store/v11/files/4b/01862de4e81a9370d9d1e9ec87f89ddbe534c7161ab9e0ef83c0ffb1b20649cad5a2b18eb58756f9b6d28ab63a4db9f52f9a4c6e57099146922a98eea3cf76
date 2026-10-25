import { is } from "./is.js";
import { walk } from "./walk.js";
export function nameOf(node) {
    if (node == null)
        return null;
    if (node.type === "Identifier")
        return node.name;
    if (node.type === "Literal" && typeof node.value === "string")
        return node.value;
    return null;
}
/**
 * The runtime value of a `Literal` node: string, number, boolean,
 * bigint, RegExp, or null for the null literal. Undefined for
 * non-literal nodes.
 */
export function literalValue(node) {
    if (node?.type !== "Literal")
        return undefined;
    if ("bigint" in node)
        return BigInt(node.bigint);
    return node.value;
}
const WRAPPERS = new Set([
    "ParenthesizedExpression",
    "TSAsExpression",
    "TSSatisfiesExpression",
    "TSNonNullExpression",
    "TSTypeAssertion",
]);
/**
 * True when `node` is a {@link Wrapper}, the expressions {@link unwrap}
 * strips to reach the one that carries the meaning. Its `expression` is
 * the node underneath.
 *
 * @example
 * isWrapper(node) ? node.expression : node
 */
export function isWrapper(node) {
    return node != null && WRAPPERS.has(node.type);
}
/**
 * The expression inside parentheses and erased TypeScript assertion
 * wrappers: `((x as any))!` unwraps to `x`. Returns the node itself
 * when nothing wraps it.
 */
export function unwrap(node) {
    let current = node;
    while (isWrapper(current))
        current = current.expression;
    return current;
}
/**
 * True when `node` is a call whose callee is an `Identifier` named
 * `name`, one of `name` when given an array. The callee is read
 * through {@link unwrap}.
 *
 * @example
 * isCallOf(node, "require")
 * isCallOf(node, ["defineConfig", "defineProject"])
 */
export function isCallOf(node, name) {
    if (node?.type !== "CallExpression")
        return false;
    const callee = unwrap(node.callee);
    if (callee.type !== "Identifier")
        return false;
    return typeof name === "string" ? callee.name === name : name.includes(callee.name);
}
/**
 * Every binding `Identifier` a pattern introduces, in source order:
 * the pattern itself, destructuring leaves, defaults' targets, and
 * rest elements.
 */
export function bindingIdentifiers(pattern) {
    const out = [];
    const visit = (node) => {
        if (node == null)
            return;
        switch (node.type) {
            case "Identifier":
                out.push(node);
                break;
            case "ArrayPattern":
                for (const element of node.elements)
                    visit(element);
                break;
            case "ObjectPattern":
                for (const property of node.properties) {
                    visit(property.type === "RestElement" ? property.argument : property.value);
                }
                break;
            case "AssignmentPattern":
                visit(node.left);
                break;
            case "RestElement":
                visit(node.argument);
                break;
            default:
                break;
        }
    };
    visit(pattern);
    return out;
}
/** Every node of the given type(s) under `root`, in source order. */
export function findAll(root, types) {
    const wanted = typeof types === "string" ? [types] : types;
    const out = [];
    walk(root, {
        enter(node) {
            if (is.oneOf(node, wanted))
                out.push(node);
        },
    });
    return out;
}
