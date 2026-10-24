"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBasePathOfAlias = void 0;
const path_1 = require("path");
const pattern_matcher_1 = require("../utils/pattern-matcher");
const path_base_nested_1 = require("./path-base-nested");
const normalizePath = require("normalize-path");
function resolveParentDirAliasPath(path, config) {
    const aliasPath = { path };
    let relConfPath = '';
    if (config.hasExtraModule && config.relConfDirPathInOutPath) {
        relConfPath = config.relConfDirPathInOutPath;
    }
    const tempBasePath = normalizePath((0, path_1.normalize)(`${config.outDir}/${relConfPath}/${config.baseUrl}`));
    const absoluteBasePath = normalizePath((0, path_1.normalize)(`${tempBasePath}/${aliasPath.path}`));
    if (config.pathCache.existsResolvedAlias(absoluteBasePath)) {
        aliasPath.isExtra = false;
        aliasPath.basePath = tempBasePath;
        return aliasPath;
    }
    aliasPath.isExtra = true;
    aliasPath.basePath = absoluteBasePath;
    return aliasPath;
}
function findBasePathOfAlias(config) {
    return (path) => {
        const aliasPath = { path };
        const pattern = (0, pattern_matcher_1.parseWildcardPattern)(path);
        aliasPath.prefix = pattern.prefix;
        aliasPath.suffix = pattern.suffix;
        aliasPath.hasWildcard = pattern.hasWildcard;
        if ((0, path_1.normalize)(aliasPath.path).includes('..')) {
            return resolveParentDirAliasPath(aliasPath.path, config);
        }
        if (aliasPath.path.match(/^(\.\/|)node_modules/g)) {
            aliasPath.basePath = (0, path_1.resolve)(config.baseUrl, 'node_modules');
            aliasPath.isExtra = false;
            return aliasPath;
        }
        if (config.hasExtraModule) {
            aliasPath.isExtra = false;
            const fullExtraPath = `${config.outDir}/${config.relConfDirPathInOutPath}/${config.baseUrl}`;
            aliasPath.basePath = normalizePath((0, path_1.normalize)(fullExtraPath));
            return aliasPath;
        }
        const nestedBase = (0, path_base_nested_1.resolveNestedBaseUrlPath)(aliasPath.path, config);
        aliasPath.basePath = nestedBase !== null && nestedBase !== void 0 ? nestedBase : config.outDir;
        aliasPath.isExtra = false;
        return aliasPath;
    };
}
exports.findBasePathOfAlias = findBasePathOfAlias;
//# sourceMappingURL=path-base.js.map