import type * as T from "@yuku-toolchain/types";
import type { Mappings } from "./sourcemap.js";
type Node = T.Node;
export interface PrintOptions {
    strip: boolean;
    minify: boolean;
    pretty: boolean;
    indent: number;
    quotes: "preserve" | "double" | "single" | "shortest";
    comments: "none" | "all" | "some" | "line" | "block";
}
export interface PrintResult {
    code: string;
    diagnostics: T.Diagnostic[];
}
export declare function print(node: Node, options: PrintOptions, mappings: Mappings | null): PrintResult;
export {};
