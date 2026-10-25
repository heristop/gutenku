import type { Comment, Diagnostic, Node } from "@yuku-toolchain/types";
export type Format = "pretty" | "compact";
/**
 * Quote style for string literals. `"preserve"` keeps each literal's source quote,
 * `"shortest"` picks the quote with fewer escapes, double on a tie.
 */
export type Quotes = "preserve" | "double" | "single" | "shortest";
/**
 * Comment passthrough filter. `"some"` emits legal headers, JSDoc, and `@`/`#` annotations,
 * `true` and `false` are sugar for `"all"` and `"none"`.
 */
export type Comments = boolean | "all" | "some" | "none" | "line" | "block";
export type { Comment, Diagnostic };
export interface SourceMapOptions {
    /** The original source text. Required to emit a map. */
    source: string;
    /** Output filename, embedded as the map's `file`. */
    file?: string;
    /** Source filename, embedded as the single entry of `sources`. */
    sourceFileName?: string;
    /** Prefix embedded as `sourceRoot`. */
    sourceRoot?: string;
    /** When set, embedded as the single entry of the map's `sourcesContent`. */
    sourcesContent?: string;
}
/** Minification switches. Enabled switches override `format` and `quotes`. */
export interface MinifyOptions {
    /** Emit compact whitespace. @default false */
    whitespace?: boolean;
    /** Apply size-reducing syntax rewrites (`!0`, `1e6`, `obj.foo`, ...). @default false */
    syntax?: boolean;
    /** Use shortest quotes. @default false */
    quotes?: boolean;
}
export interface GenerateOptions {
    /**
     * Drop TypeScript-only syntax and emit plain JavaScript. Constructs with no JavaScript
     * equivalent (`enum`, `namespace`, ...) are reported in `diagnostics` and elided.
     * @default false
     */
    strip?: boolean;
    /**
     * `true` enables every {@link MinifyOptions} switch for maximum minification, pass an object
     * for fine-grained control.
     * @default false
     */
    minify?: boolean | MinifyOptions;
    /** @default "pretty" */
    format?: Format;
    /** Spaces per indentation level in pretty format, from 0 to 255. @default 2 */
    indent?: number;
    /** @default "preserve" */
    quotes?: Quotes;
    /** @default "some" */
    comments?: Comments;
    sourceMap?: SourceMapOptions;
}
export interface SourceMap {
    version: 3;
    file: string | null;
    sourceRoot: string | null;
    sources: string[];
    sourcesContent: (string | null)[] | null;
    names: string[];
    mappings: string;
}
export interface GenerateResult {
    code: string;
    diagnostics: Diagnostic[];
    map: SourceMap | null;
}
/** Prints a `Program` or any single node back to source. */
export declare function generate(node: Node, options?: GenerateOptions): GenerateResult;
