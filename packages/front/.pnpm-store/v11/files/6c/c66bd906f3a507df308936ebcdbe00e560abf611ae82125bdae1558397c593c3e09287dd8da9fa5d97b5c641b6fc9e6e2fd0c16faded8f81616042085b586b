"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isImportablePath = exports.getImportablePath = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const alias_path_normalizer_1 = require("./alias-path-normalizer");
function getImportablePath(path, fileExtensions) {
    const isValidPath = (0, fs_1.existsSync)(path);
    if (!!(0, path_1.extname)(path) && isValidPath) {
        return path;
    }
    const pathWithoutJsExt = (0, alias_path_normalizer_1.removeJavascriptExtension)(path);
    const targetFiles = fileExtensions.map((ext) => `${pathWithoutJsExt}.${ext}`);
    for (const file of targetFiles) {
        if ((0, fs_1.existsSync)(file))
            return file;
    }
    if (!isValidPath)
        return null;
    const stats = (0, fs_1.statSync)(path);
    if (stats.isDirectory()) {
        const indexFiles = fileExtensions.map((ext) => (0, path_1.join)(path, `index.${ext}`));
        for (const indexFile of indexFiles) {
            if ((0, fs_1.existsSync)(indexFile))
                return indexFile;
        }
        return null;
    }
    return path;
}
exports.getImportablePath = getImportablePath;
function isImportablePath(path, fileExtensions) {
    return !!getImportablePath(path, fileExtensions);
}
exports.isImportablePath = isImportablePath;
//# sourceMappingURL=path-validator.js.map