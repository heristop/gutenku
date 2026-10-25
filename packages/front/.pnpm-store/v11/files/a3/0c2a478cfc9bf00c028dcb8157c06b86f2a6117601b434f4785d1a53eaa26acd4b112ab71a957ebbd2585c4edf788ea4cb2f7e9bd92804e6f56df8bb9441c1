"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePathsWithoutBaseUrl = exports.applyBaseConfigDirToPaths = exports.resolveDirectoryPath = exports.replaceConfigDirPlaceholder = void 0;
const path_1 = require("path");
function replaceConfigDirPlaceholder(path, configDir) {
    return path.replace(/\$\{configDir\}/g, configDir);
}
exports.replaceConfigDirPlaceholder = replaceConfigDirPlaceholder;
function resolveDirectoryPath(dir, configDir, baseConfigDir) {
    let replaced = dir;
    if (baseConfigDir !== null) {
        replaced = replaceConfigDirPlaceholder(dir, baseConfigDir);
    }
    if ((0, path_1.isAbsolute)(replaced)) {
        return replaced;
    }
    return (0, path_1.join)(configDir, replaced);
}
exports.resolveDirectoryPath = resolveDirectoryPath;
function applyBaseConfigDirToPaths(paths, baseConfigDir) {
    for (const key in paths) {
        paths[key] = paths[key].map((path) => replaceConfigDirPlaceholder(path, baseConfigDir));
    }
    return paths;
}
exports.applyBaseConfigDirToPaths = applyBaseConfigDirToPaths;
function resolvePathsWithoutBaseUrl(params) {
    const { paths, configDir, rootDir } = params;
    const resolvedRootDir = (0, path_1.resolve)(configDir, rootDir);
    for (const key in paths) {
        paths[key] = paths[key].map((path) => (0, path_1.relative)(resolvedRootDir, (0, path_1.resolve)(configDir, path)));
    }
    return paths;
}
exports.resolvePathsWithoutBaseUrl = resolvePathsWithoutBaseUrl;
//# sourceMappingURL=config-paths.js.map