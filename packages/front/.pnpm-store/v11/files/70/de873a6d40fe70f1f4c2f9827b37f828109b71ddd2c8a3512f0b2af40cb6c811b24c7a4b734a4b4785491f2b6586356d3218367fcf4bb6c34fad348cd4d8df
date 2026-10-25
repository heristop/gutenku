"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifierRE = exports.endOfLine = exports.newLine = void 0;
exports.isTsLang = isTsLang;
exports.asType = asType;
exports.generateTypedVar = generateTypedVar;
exports.generateTypeAlias = generateTypeAlias;
exports.getRefBrandArgument = getRefBrandArgument;
exports.getTypeScriptAST = getTypeScriptAST;
exports.generateSfcBlockSection = generateSfcBlockSection;
exports.forEachNode = forEachNode;
const codeFeatures_1 = require("../codeFeatures");
exports.newLine = `\n`;
exports.endOfLine = `;${exports.newLine}`;
exports.identifierRE = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
function isTsLang(lang) {
    return lang === 'ts' || lang === 'tsx';
}
// `{} as T` in TS; `/** @type {T} */ ({})` in JS. The JSDoc cast keeps the
// same assertion semantics under checkJs, and requires no type-only syntax.
function asType(type, lang) {
    return isTsLang(lang) ? `{} as ${type}` : `/** @type {${type}} */ ({})`;
}
// `let name!: T;` in TS; `var name = /** @type {T} */ ({});` in JS.
function* generateTypedVar(kind, name, lang, type) {
    if (isTsLang(lang)) {
        yield `${kind} ${name}!: `;
        yield* type();
        yield exports.endOfLine;
    }
    else {
        yield `var ${name} = /** @type {`;
        yield* type();
        yield `} */ ({})${exports.endOfLine}`;
    }
}
// `type name = T;` in TS; `/** @typedef {T} name */;` in JS.
function* generateTypeAlias(name, lang, type) {
    if (isTsLang(lang)) {
        yield `type ${name} = `;
        yield* type();
        yield exports.endOfLine;
    }
    else {
        yield `/** @typedef {`;
        yield* type();
        yield `} ${name} */${exports.endOfLine}`;
    }
}
// The phantom argument that carries the component library's `Ref` brand into
// `__VLS_unwrap` / `__VLS_withDotValue`; the helper declarations cannot
// resolve the library import themselves.
function getRefBrandArgument(vueCompilerOptions, lang) {
    return asType(`import('${vueCompilerOptions.lib}').Ref<unknown>`, lang);
}
const cacheMaps = new WeakMap();
function getTypeScriptAST(ts, block, text) {
    if (!cacheMaps.has(block)) {
        cacheMaps.set(block, [block.content, new Map()]);
    }
    const cacheMap = cacheMaps.get(block);
    if (cacheMap[0] !== block.content) {
        cacheMap[0] = block.content;
        for (const [key, info] of cacheMap[1]) {
            if (info[1]) {
                info[1] = 0;
            }
            else {
                cacheMap[1].delete(key);
            }
        }
    }
    const cache = cacheMap[1].get(text);
    if (cache) {
        cache[1]++;
        return cache[0];
    }
    const ast = ts.createSourceFile('/dummy.ts', text, 99);
    cacheMap[1].set(text, [ast, 1]);
    return ast;
}
function* generateSfcBlockSection(block, start, end, features) {
    const text = block.content.slice(start, end);
    yield [text, block.name, start, features];
    // #3632
    if ('parseDiagnostics' in block.ast) {
        const textEnd = text.trimEnd().length;
        for (const diag of block.ast.parseDiagnostics) {
            const diagStart = diag.start;
            const diagEnd = diag.start + diag.length;
            if (diagStart >= textEnd && diagEnd <= end) {
                yield `;`;
                yield ['', block.name, end, codeFeatures_1.codeFeatures.verification];
                yield exports.newLine;
                break;
            }
        }
    }
}
function* forEachNode(ts, node) {
    const children = [];
    ts.forEachChild(node, child => {
        children.push(child);
    });
    for (const child of children) {
        yield child;
    }
}
//# sourceMappingURL=index.js.map