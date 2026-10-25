"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findResolvedAliasPath = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const reference_path_resolver_1 = require("../helpers/reference-path-resolver");
const utils_1 = require("../utils");
const path_validator_1 = require("../utils/path-validator");
const default_replacer_match_1 = require("./default.replacer.match");
const normalizePath = require("normalize-path");
function resolveConcreteTarget(aliasPath, starValue) {
    const targetPattern = (0, utils_1.parseWildcardPattern)(aliasPath.path);
    if (targetPattern.hasWildcard) {
        return (0, utils_1.substituteWildcard)({ pattern: targetPattern, starValue });
    }
    if (starValue) {
        const sep = aliasPath.path ? '/' : '';
        return `${aliasPath.path}${sep}${starValue}`;
    }
    return aliasPath.path;
}
function resolveExistingArtifact(aliasPath, concretePath, config) {
    var _a;
    if (aliasPath.path.match(/^(\.\/|)node_modules/))
        return null;
    const sourcePath = (0, path_1.resolve)(config.configDir, config.baseUrl, concretePath);
    if ((0, reference_path_resolver_1.findMatchingReference)({ configFile: config.configFile, sourcePath }))
        return null;
    const importablePath = (0, path_validator_1.getImportablePath)(sourcePath, config.pathCache.fileExtensions);
    if (!importablePath ||
        !config.pathCache.fileExtensions.some((extension) => importablePath.endsWith(`.${extension}`))) {
        return null;
    }
    const runtimePath = (0, utils_1.normalizePathExtension)((0, utils_1.convertDTSPathToJsExtension)(importablePath));
    if (!((_a = (0, fs_1.statSync)(runtimePath, { throwIfNoEntry: false })) === null || _a === void 0 ? void 0 : _a.isFile()))
        return null;
    return normalizePath(runtimePath);
}
function checkSingleAliasPath(params) {
    const { aliasPath, requiredModule, alias, config } = params;
    const starValue = (0, default_replacer_match_1.extractWildcardValue)(requiredModule, alias);
    const concretePath = resolveConcreteTarget(aliasPath, starValue);
    const absolutePath = config.pathCache.getAbsoluteAliasPath(aliasPath.basePath, concretePath);
    config.output.debug('default replacer - absoluteAliasPath: ', absolutePath);
    if (!absolutePath.startsWith('---')) {
        const resolvedPath = normalizePath(absolutePath);
        if (config.pathCache.existsResolvedAlias(resolvedPath))
            return resolvedPath;
    }
    config.output.debug('default replacer - Invalid path');
    return resolveExistingArtifact(aliasPath, concretePath, config);
}
function findResolvedAliasPath(params) {
    const { alias, requiredModule, config } = params;
    for (const aliasPath of alias.paths) {
        const resolved = checkSingleAliasPath({
            aliasPath,
            requiredModule,
            alias,
            config
        });
        if (resolved)
            return (0, utils_1.convertDTSPathToJsExtension)(resolved);
    }
    return null;
}
exports.findResolvedAliasPath = findResolvedAliasPath;
//# sourceMappingURL=default.replacer.path.js.map