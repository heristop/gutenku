"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTsConfigExtendsOption = exports.resolveTsConfigExtendsPath = void 0;
const fs_1 = require("fs");
const mylas_1 = require("mylas");
const path_1 = require("path");
function checkExtendsDirectory(targetPath) {
    try {
        const stats = (0, fs_1.lstatSync)(targetPath);
        if (stats.isDirectory() || stats.isSymbolicLink()) {
            return (0, path_1.join)(targetPath, 'tsconfig.json');
        }
    }
    catch (_a) { }
    const jsonCandidate = `${targetPath}.json`;
    if ((0, fs_1.existsSync)(jsonCandidate)) {
        return jsonCandidate;
    }
    return undefined;
}
function resolveTsConfigExtendsPath(ext, file) {
    const tsConfigDir = (0, path_1.dirname)(file);
    const node_modules = mylas_1.Dir.nodeModules({ cwd: tsConfigDir });
    const targetPaths = node_modules.map((v) => (0, path_1.join)(tsConfigDir, v, ext));
    for (const targetPath of targetPaths) {
        if (ext.endsWith('.json')) {
            if ((0, fs_1.existsSync)(targetPath))
                return targetPath;
            continue;
        }
        const resolved = checkExtendsDirectory(targetPath);
        if (resolved)
            return resolved;
    }
}
exports.resolveTsConfigExtendsPath = resolveTsConfigExtendsPath;
function normalizeTsConfigExtendsOption(ext, file) {
    if (!ext)
        return [];
    const configDir = (0, path_1.dirname)(file);
    const exts = Array.isArray(ext) ? ext : [ext];
    return exts.map((e) => {
        if (e.startsWith('.')) {
            if (e.endsWith('.json')) {
                return (0, path_1.join)(configDir, e);
            }
            return (0, path_1.join)(configDir, `${e}.json`);
        }
        return resolveTsConfigExtendsPath(e, file);
    });
}
exports.normalizeTsConfigExtendsOption = normalizeTsConfigExtendsOption;
//# sourceMappingURL=tsconfig-extends.js.map