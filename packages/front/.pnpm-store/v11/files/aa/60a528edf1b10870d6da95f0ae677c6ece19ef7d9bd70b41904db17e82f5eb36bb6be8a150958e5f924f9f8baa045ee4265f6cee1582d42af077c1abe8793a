"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathCache = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const helpers_1 = require("../helpers");
const constants_1 = require("./constants");
const path_2 = require("./path");
const path_validator_1 = require("./path-validator");
class PathCache {
    constructor(useCache, fileExtensions, configFile) {
        this.configFile = configFile;
        this.fileExtensions = fileExtensions || [...constants_1.DEFAULT_FILE_EXTENSIONS];
        this.useCache = useCache;
        if (useCache) {
            this.existsCache = new Map();
            this.absoluteCache = new Map();
        }
    }
    existsResolvedAlias(path) {
        if (!this.useCache)
            return this.exists(path);
        if (this.existsCache.has(path)) {
            return this.existsCache.get(path);
        }
        else {
            const result = this.exists(path);
            this.existsCache.set(path, result);
            return result;
        }
    }
    getAbsoluteAliasPath(basePath, aliasPath) {
        const request = { basePath, aliasPath };
        if (!this.useCache)
            return this.getAAP(request);
        const key = `${basePath}___${aliasPath}`;
        if (this.absoluteCache.has(key))
            return this.absoluteCache.get(key);
        const result = this.getAAP(request);
        this.absoluteCache.set(key, result);
        return result;
    }
    getAAP(params) {
        const { aliasPath } = params;
        const { parentSteps, remainingPath } = (0, path_2.splitPathByParentSteps)(aliasPath);
        const basePath = (0, path_1.join)(params.basePath, parentSteps);
        const aliasPathParts = remainingPath.split('/').filter((part) => !part.match(/^\.$|^\s*$/));
        let aliasPathPart = aliasPathParts.shift() || '';
        let found = false;
        while (!(found = this.exists((0, path_1.join)(basePath, aliasPathPart))) && aliasPathParts.length) {
            aliasPathPart = aliasPathParts.shift();
        }
        if (found) {
            const absolutePath = (0, path_1.join)(basePath, aliasPathPart, aliasPathParts.join('/'));
            const importablePath = (0, path_validator_1.getImportablePath)(absolutePath, this.fileExtensions);
            if (importablePath)
                return importablePath;
            const matchingRef = (0, helpers_1.findMatchingReference)({ configFile: this.configFile, sourcePath: absolutePath });
            if (matchingRef) {
                const refPath = (0, helpers_1.resolveReferenceTargetPath)({
                    reference: matchingRef,
                    sourcePath: absolutePath,
                    fileExtensions: this.fileExtensions
                });
                if (refPath)
                    return refPath;
            }
        }
        return '---' + (0, path_1.join)(basePath, aliasPathParts.join('/'));
    }
    exists(path) {
        return (0, fs_1.existsSync)(path) || this.fileExtensions.some((extension) => (0, fs_1.existsSync)(`${path}.${extension}`));
    }
}
exports.PathCache = PathCache;
//# sourceMappingURL=path-cache.js.map