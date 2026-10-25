import { NODE_TYPES } from "./generated.js";
/**
 * One constructor per node type, its fields derived from the node type
 * itself. `start` and `end` default to 0, which `ctx.replace` treats
 * as span-less and fills from the replaced node.
 *
 * @example
 * b.Identifier({ name: "x" })
 * b.ExpressionStatement({ expression: b.Identifier({ name: "x" }) })
 */
export const b = Object.fromEntries(NODE_TYPES.map((type) => [
    type,
    (fields) => ({ type, start: 0, end: 0, ...fields }),
]));
