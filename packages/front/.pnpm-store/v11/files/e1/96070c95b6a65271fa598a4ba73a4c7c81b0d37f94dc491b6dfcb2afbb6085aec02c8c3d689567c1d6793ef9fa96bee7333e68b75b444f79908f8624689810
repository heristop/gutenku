"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAliasPath = exports.normalizePathExtension = exports.convertDTSPathToJsExtension = exports.removeJavascriptExtension = exports.getDTSPathExtension = exports.isDTS = void 0;
const path_1 = require("path");
const helpers_1 = require("../helpers");
function isDTS(extension) {
    return /\.d(\..*)?\.[mc]?ts(x)?$/.test(extension);
}
exports.isDTS = isDTS;
function getDTSPathExtension(path) {
    if (isDTS(path))
        return path;
    return path.replace(/\.([mc])?[tj]s(x)?$/, '.d.$1ts$2');
}
exports.getDTSPathExtension = getDTSPathExtension;
function removeJavascriptExtension(path) {
    if (isDTS(path))
        return path;
    return path.replace(/\.([mc])?[j]s(x)?$/, '');
}
exports.removeJavascriptExtension = removeJavascriptExtension;
function convertDTSPathToJsExtension(path) {
    return path.replace(/\.d\.([mc])?ts(x)?$/, '.$1js$2');
}
exports.convertDTSPathToJsExtension = convertDTSPathToJsExtension;
function normalizePathExtension(path) {
    const dotIndex = path.lastIndexOf('.');
    const beforeDot = path.slice(0, dotIndex);
    const afterDot = path.slice(dotIndex);
    if (afterDot.includes('/') || afterDot.includes('\\')) {
        return path;
    }
    if (isDTS(afterDot)) {
        return `${beforeDot}${afterDot}`;
    }
    const normalizedExt = afterDot.replace(/\.([mc])?ts(x)?$/, '.$1js$2');
    return `${beforeDot}${normalizedExt}`;
}
exports.normalizePathExtension = normalizePathExtension;
function normalizeAliasPath(params) {
    const { path: rawPath, config } = params;
    let path = rawPath.replace(/\*$/, '');
    path = normalizePathExtension(path);
    if ((0, path_1.isAbsolute)(path)) {
        path = (0, path_1.relative)((0, path_1.resolve)(config.configDir, config.baseUrl), path);
    }
    if ((0, path_1.normalize)(path).includes('..') && !config.configDirInOutPath) {
        (0, helpers_1.relativeOutPathToConfigDir)(config);
    }
    return path;
}
exports.normalizeAliasPath = normalizeAliasPath;
//# sourceMappingURL=alias-path-normalizer.js.map