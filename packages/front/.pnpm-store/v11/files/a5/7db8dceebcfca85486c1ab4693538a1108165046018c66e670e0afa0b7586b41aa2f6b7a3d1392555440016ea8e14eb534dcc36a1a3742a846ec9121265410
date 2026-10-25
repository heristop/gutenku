"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteImportStatement = exports.formatRelativeAliasPath = void 0;
const path_1 = require("path");
const utils_1 = require("../utils");
const normalizePath = require("normalize-path");
function formatRelativeAliasPath(file, absoluteAliasPath) {
    let relativePath = normalizePath((0, path_1.relative)((0, path_1.dirname)(file), absoluteAliasPath));
    if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
    }
    return relativePath;
}
exports.formatRelativeAliasPath = formatRelativeAliasPath;
function rewriteImportStatement(params) {
    var _a, _b, _c;
    const { orig, alias, relativeAliasPath, requiredModule } = params;
    if (requiredModule) {
        const specifierRegex = /(["'])(?<path>[^"'\r\n]+)\1/;
        const match = orig.match(specifierRegex);
        if (match && ((_a = match.groups) === null || _a === void 0 ? void 0 : _a.path) === requiredModule) {
            const quote = match[1];
            const quotedOld = `${quote}${requiredModule}${quote}`;
            const quotedNew = `${quote}${normalizePath(relativeAliasPath)}${quote}`;
            return orig.replace(quotedOld, quotedNew);
        }
    }
    let index = orig.indexOf(alias.prefix);
    if (!alias.prefix) {
        const specifierRegex = /(?<quoted>["'](?<path>[^"'\r\n]+)["'])/;
        const match = orig.match(specifierRegex);
        const specifier = (_b = match === null || match === void 0 ? void 0 : match.groups) === null || _b === void 0 ? void 0 : _b.path;
        if (specifier) {
            index = orig.indexOf(specifier);
        }
    }
    const prefixLength = alias.prefix.length;
    const newImportScript = `${orig.substring(0, index)}${relativeAliasPath}/${orig.substring(index + prefixLength)}`;
    const moduleMatch = newImportScript.match((0, utils_1.newStringRegex)());
    const modulePath = (_c = moduleMatch === null || moduleMatch === void 0 ? void 0 : moduleMatch.groups) === null || _c === void 0 ? void 0 : _c.path;
    if (!modulePath) {
        return newImportScript;
    }
    return newImportScript.replace(modulePath, normalizePath(modulePath));
}
exports.rewriteImportStatement = rewriteImportStatement;
//# sourceMappingURL=default.replacer.rewrite.js.map