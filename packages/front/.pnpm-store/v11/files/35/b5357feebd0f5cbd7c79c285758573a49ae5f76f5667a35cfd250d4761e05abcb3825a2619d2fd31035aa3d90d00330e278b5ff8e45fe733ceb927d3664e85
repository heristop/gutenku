import type { Node, NodeOfType, NodeType } from "@yuku-toolchain/types";
type BuilderInput<T> = T extends Node ? Omit<T, "type" | "start" | "end"> & {
    start?: number;
    end?: number;
} : never;
type Builders = {
    [K in NodeType]: (fields: BuilderInput<NodeOfType<K>>) => NodeOfType<K>;
};
/**
 * One constructor per node type, its fields derived from the node type
 * itself. `start` and `end` default to 0, which `ctx.replace` treats
 * as span-less and fills from the replaced node.
 *
 * @example
 * b.Identifier({ name: "x" })
 * b.ExpressionStatement({ expression: b.Identifier({ name: "x" }) })
 */
export declare const b: Builders;
export {};
