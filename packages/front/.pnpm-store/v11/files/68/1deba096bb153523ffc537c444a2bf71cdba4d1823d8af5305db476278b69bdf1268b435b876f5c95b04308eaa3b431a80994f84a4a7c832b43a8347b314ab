"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractWildcardValue = exports.isMatchingAlias = void 0;
const utils_1 = require("../utils");
function isMatchingAlias(params) {
    var _a, _b;
    const { requiredModule, alias } = params;
    const hasWildcard = (_a = alias.hasWildcard) !== null && _a !== void 0 ? _a : alias.shouldPrefixMatchWildly;
    const suffix = (_b = alias.suffix) !== null && _b !== void 0 ? _b : '';
    const { matched } = (0, utils_1.matchWildcard)({
        pattern: {
            prefix: alias.prefix,
            suffix,
            hasWildcard
        },
        text: requiredModule
    });
    return matched;
}
exports.isMatchingAlias = isMatchingAlias;
function extractWildcardValue(requiredModule, alias) {
    var _a, _b;
    const hasWildcard = (_a = alias.hasWildcard) !== null && _a !== void 0 ? _a : alias.shouldPrefixMatchWildly;
    const suffix = (_b = alias.suffix) !== null && _b !== void 0 ? _b : '';
    const { starValue } = (0, utils_1.matchWildcard)({
        pattern: {
            prefix: alias.prefix,
            suffix,
            hasWildcard
        },
        text: requiredModule
    });
    return (0, utils_1.removeJavascriptExtension)(starValue);
}
exports.extractWildcardValue = extractWildcardValue;
//# sourceMappingURL=default.replacer.match.js.map