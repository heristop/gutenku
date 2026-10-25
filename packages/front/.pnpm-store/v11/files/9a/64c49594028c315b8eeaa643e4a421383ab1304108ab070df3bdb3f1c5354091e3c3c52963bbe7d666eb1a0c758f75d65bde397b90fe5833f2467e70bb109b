"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePackageSubpath = exports.resolveExistingRuntimePath = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("./constants");
function packageDefinesExports(packageRoot) {
    const manifestPath = (0, path_1.join)(packageRoot, 'package.json');
    if (!(0, fs_1.existsSync)(manifestPath))
        return false;
    try {
        const manifest = JSON.parse((0, fs_1.readFileSync)(manifestPath, 'utf8'));
        return Object.prototype.hasOwnProperty.call(manifest, 'exports');
    }
    catch (_a) {
        return true;
    }
}
function resolveExistingRuntimePath(params) {
    const { importPath, absolutePath, extensions } = params;
    const ext = extensions.find((candidate) => (0, fs_1.existsSync)(`${absolutePath}${candidate}`));
    if (ext)
        return `${importPath}${ext}`;
    const indexExt = extensions.find((c) => (0, fs_1.existsSync)((0, path_1.join)(absolutePath, `index${c}`)));
    if (!indexExt)
        return importPath;
    const indexPath = (0, path_1.join)(importPath, `index${indexExt}`);
    const needsDot = (importPath === '.' || importPath.startsWith('./')) && !indexPath.startsWith('./');
    if (needsDot)
        return `./${indexPath}`;
    return indexPath;
}
exports.resolveExistingRuntimePath = resolveExistingRuntimePath;
function splitPackageSubpath(importPath) {
    const parts = importPath.split('/');
    let count = 1;
    if (parts[0].startsWith(constants_1.SCOPED_PACKAGE_PREFIX))
        count = 2;
    if (parts.length <= count || parts.slice(0, count).some((p) => !p))
        return undefined;
    const subpathParts = parts.slice(count);
    if (subpathParts.some((p) => p === '.' || p === '..'))
        return undefined;
    return { packageParts: parts.slice(0, count), subpathParts };
}
function resolvePackageSubpath(params) {
    const { importPath, sourceDir, extensions } = params;
    const parsed = splitPackageSubpath(importPath);
    if (!parsed)
        return importPath;
    const { packageParts, subpathParts } = parsed;
    let dir = sourceDir;
    let isAtRoot = false;
    while (!isAtRoot) {
        const root = (0, path_1.resolve)(dir, 'node_modules', ...packageParts);
        if (packageDefinesExports(root))
            return importPath;
        const resolved = resolveExistingRuntimePath({
            importPath,
            absolutePath: (0, path_1.resolve)(root, ...subpathParts),
            extensions
        });
        if (resolved !== importPath)
            return resolved;
        const parent = (0, path_1.dirname)(dir);
        isAtRoot = parent === dir;
        dir = parent;
    }
    return importPath;
}
exports.resolvePackageSubpath = resolvePackageSubpath;
//# sourceMappingURL=package-subpath-resolver.js.map