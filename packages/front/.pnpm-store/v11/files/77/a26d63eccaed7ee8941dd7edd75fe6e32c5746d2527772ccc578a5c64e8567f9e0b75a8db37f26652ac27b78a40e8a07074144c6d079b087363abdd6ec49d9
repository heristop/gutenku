import { print } from "./printer.js";
import { encodeMappings, Mappings } from "./sourcemap.js";
const QUOTES = ["preserve", "double", "single", "shortest"];
const COMMENTS = ["none", "all", "some", "line", "block"];
/** Prints a `Program` or any single node back to source. */
export function generate(node, options = {}) {
    if (typeof node?.type !== "string") {
        throw new TypeError("Expected an AST node, such as `parse(source).program`");
    }
    const printOptions = resolveOptions(options);
    const sourceMap = options.sourceMap;
    if (sourceMap == null)
        return { ...print(node, printOptions, null), map: null };
    if (typeof sourceMap.source !== "string") {
        throw new TypeError("`sourceMap.source` must be the original source text");
    }
    const mappings = new Mappings(Math.max(sourceMap.source.length >>> 3, 1024));
    const { code, diagnostics } = print(node, printOptions, mappings);
    const map = {
        version: 3,
        file: sourceMap.file ?? null,
        sourceRoot: sourceMap.sourceRoot ?? null,
        sources: [sourceMap.sourceFileName ?? ""],
        sourcesContent: sourceMap.sourcesContent != null ? [sourceMap.sourcesContent] : null,
        names: [],
        mappings: encodeMappings(code, sourceMap.source, mappings),
    };
    return { code, diagnostics, map };
}
function resolveOptions(options) {
    const minify = options.minify === true
        ? { whitespace: true, syntax: true, quotes: true }
        : options.minify || {};
    const format = minify.whitespace === true ? "compact" : (options.format ?? "pretty");
    if (format !== "pretty" && format !== "compact") {
        throw new TypeError('`format` must be "pretty" or "compact"');
    }
    const indent = options.indent ?? 2;
    if (!Number.isInteger(indent) || indent < 0 || indent > 255) {
        throw new RangeError("`indent` must be an integer from 0 to 255");
    }
    const quotes = minify.quotes === true ? "shortest" : (options.quotes ?? "preserve");
    if (!QUOTES.includes(quotes)) {
        throw new TypeError('`quotes` must be "preserve", "double", "single", or "shortest"');
    }
    const comments = options.comments === true
        ? "all"
        : options.comments === false
            ? "none"
            : (options.comments ?? "some");
    if (!COMMENTS.includes(comments)) {
        throw new TypeError('`comments` must be a boolean or "all", "some", "none", "line", or "block"');
    }
    return {
        strip: options.strip === true,
        minify: minify.syntax === true,
        pretty: format === "pretty",
        indent,
        quotes,
        comments,
    };
}
