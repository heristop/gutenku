import { ALIAS_GROUPS } from "./aliases.js";
import { NODE_TYPES } from "./generated.js";
const _exhaustive = [{}, {}];
void _exhaustive;
function aliasGuard(name) {
    const set = new Set(ALIAS_GROUPS[name]);
    return (node) => node != null && set.has(node.type);
}
const concrete = Object.fromEntries(NODE_TYPES.map((type) => [type, (node) => node != null && node.type === type]));
/**
 * Type guards, one per concrete node `type` plus alias and shape
 * guards. Every guard accepts `null` and `undefined` and narrows.
 *
 * @example
 * is.CallExpression(node)
 * is.Identifier(node, "require")
 * is.Expression(node)
 * is.StringLiteral(node)
 */
export const is = {
    ...concrete,
    /** True when `node.type` is one of `types`, narrowing to that union. */
    oneOf: (node, types) => node != null && types.some((type) => type === node.type),
    /** An `Identifier`, optionally with the exact `name`. */
    Identifier: (node, name) => node?.type === "Identifier" && (name === undefined || node.name === name),
    Expression: aliasGuard("Expression"),
    Statement: aliasGuard("Statement"),
    Declaration: aliasGuard("Declaration"),
    ModuleDeclaration: aliasGuard("ModuleDeclaration"),
    Function: aliasGuard("Function"),
    Class: aliasGuard("Class"),
    Method: aliasGuard("Method"),
    Loop: aliasGuard("Loop"),
    Pattern: aliasGuard("Pattern"),
    JSX: aliasGuard("JSX"),
    TSType: aliasGuard("TSType"),
    StringLiteral: (node) => node?.type === "Literal" && typeof node.value === "string",
    NumericLiteral: (node) => node?.type === "Literal" && typeof node.value === "number",
    BooleanLiteral: (node) => node?.type === "Literal" && typeof node.value === "boolean",
    NullLiteral: (node) => node?.type === "Literal" && node.raw === "null",
    BigIntLiteral: (node) => node?.type === "Literal" && "bigint" in node,
    RegExpLiteral: (node) => node?.type === "Literal" && "regex" in node,
    ComputedMemberExpression: (node) => node?.type === "MemberExpression" && node.computed,
    StaticMemberExpression: (node) => node?.type === "MemberExpression" && !node.computed && node.property.type === "Identifier",
    PrivateFieldExpression: (node) => node?.type === "MemberExpression" && node.property.type === "PrivateIdentifier",
    Directive: (node) => node?.type === "ExpressionStatement" && node.directive != null,
};
