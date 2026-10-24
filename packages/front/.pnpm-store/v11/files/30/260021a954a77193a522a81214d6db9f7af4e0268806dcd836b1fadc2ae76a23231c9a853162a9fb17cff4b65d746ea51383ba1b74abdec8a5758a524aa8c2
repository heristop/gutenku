"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNestedBaseUrlPath = void 0;
const path_1 = require("path");
const normalizePath = require("normalize-path");
function isRootOrParentBaseUrl(normalizedBase) {
    return !normalizedBase || normalizedBase === '.' || normalizedBase.startsWith('..');
}
function resolveNestedBaseUrlPath(path, config) {
    const normalizedBase = (0, path_1.normalize)(config.baseUrl);
    if (isRootOrParentBaseUrl(normalizedBase))
        return undefined;
    const cleanPath = path.replace(/\*.*$/, '');
    const cleanBase = config.baseUrl.replace(/^(\.\/|\/)/, '');
    const strippedBase = cleanBase.replace(/^src\//, '');
    const candidates = [
        normalizePath((0, path_1.normalize)(`${config.outDir}/${cleanBase}`)),
        normalizePath((0, path_1.normalize)(`${config.outDir}/${strippedBase}`)),
        config.outDir
    ];
    for (const candidate of candidates) {
        const fullCandidate = normalizePath((0, path_1.normalize)(`${candidate}/${cleanPath}`));
        if (config.pathCache.existsResolvedAlias(fullCandidate)) {
            return candidate;
        }
    }
    return undefined;
}
exports.resolveNestedBaseUrlPath = resolveNestedBaseUrlPath;
//# sourceMappingURL=path-base-nested.js.map