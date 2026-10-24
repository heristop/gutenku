"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const default_replacer_match_1 = require("./default.replacer.match");
const default_replacer_path_1 = require("./default.replacer.path");
const default_replacer_rewrite_1 = require("./default.replacer.rewrite");
function replaceImportStatement(args) {
    var _a, _b;
    const { orig, file, config } = args;
    const requiredModule = (_b = (_a = orig.match((0, utils_1.newStringRegex)())) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.path;
    config.output.debug('default replacer - requiredModule: ', requiredModule);
    config.output.assert(typeof requiredModule === 'string', `Unexpected import statement pattern ${orig}`);
    const alias = config.aliasTrie.search(requiredModule);
    config.output.debug('default replacer - alias: ', alias);
    if (!alias)
        return orig;
    if (!(0, default_replacer_match_1.isMatchingAlias)({ requiredModule: requiredModule, alias })) {
        return orig;
    }
    const absoluteAliasPath = (0, default_replacer_path_1.findResolvedAliasPath)({
        alias,
        requiredModule: requiredModule,
        config
    });
    if (!absoluteAliasPath) {
        return orig;
    }
    const relativeAliasPath = (0, default_replacer_rewrite_1.formatRelativeAliasPath)(file, absoluteAliasPath);
    config.output.debug('default replacer - relativeAliasPath: ', relativeAliasPath);
    const result = (0, default_replacer_rewrite_1.rewriteImportStatement)({
        orig,
        alias,
        relativeAliasPath,
        requiredModule: requiredModule
    });
    config.output.debug('default replacer - newImportScript: ', result);
    return result;
}
exports.default = replaceImportStatement;
//# sourceMappingURL=default.replacer.js.map