"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newImportStatementRegex = exports.newStringRegex = void 0;
const anyQuote = `["']`;
const pathStringContent = `[^"'\r\n]+`;
const importString = `(?:${anyQuote}${pathStringContent}${anyQuote})`;
const funcStyle = `(?:\\b(?:import|require)\\s*\\(\\s*(\\/\\*.*\\*\\/\\s*)?${importString}(?:\\s*,[\\s\\S]*?)?\\s*\\))`;
const globalStyle = `(?:\\bimport\\s+${importString})`;
const globalMinimizedStyle = `(?:\\bimport${importString})`;
const fromStyle = `(?:\\bfrom\\s+${importString})`;
const fromMinimizedStyle = `(?:\\bfrom${importString})`;
const moduleStyle = `(?:\\bmodule\\s+${importString})`;
const importRegexString = `(?:${[
    funcStyle,
    globalStyle,
    globalMinimizedStyle,
    fromStyle,
    fromMinimizedStyle,
    moduleStyle
].join('|')})`;
function newStringRegex() {
    return new RegExp(`(?<pathWithQuotes>${anyQuote}(?<path>${pathStringContent})${anyQuote})`);
}
exports.newStringRegex = newStringRegex;
function newImportStatementRegex(flags = '') {
    return new RegExp(importRegexString, flags);
}
exports.newImportStatementRegex = newImportStatementRegex;
//# sourceMappingURL=import-regex.js.map