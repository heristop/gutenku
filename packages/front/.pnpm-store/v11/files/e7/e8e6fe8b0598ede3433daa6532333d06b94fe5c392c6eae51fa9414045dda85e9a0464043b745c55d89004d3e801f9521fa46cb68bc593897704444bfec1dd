"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceSourceImportPaths = exports.resolveFullImportPaths = exports.newStringRegex = exports.newImportStatementRegex = void 0;
const path_1 = require("path");
const constants_1 = require("./constants");
const import_regex_1 = require("./import-regex");
Object.defineProperty(exports, "newImportStatementRegex", { enumerable: true, get: function () { return import_regex_1.newImportStatementRegex; } });
Object.defineProperty(exports, "newStringRegex", { enumerable: true, get: function () { return import_regex_1.newStringRegex; } });
const package_subpath_resolver_1 = require("./package-subpath-resolver");
const normalizePath = require("normalize-path");
function runtimeExtensions(preferredExtension) {
    return Array.from(new Set([preferredExtension, ...constants_1.DEFAULT_RUNTIME_EXTENSIONS]));
}
class ImportPathResolver {
    constructor(source, sourcePath) {
        this.source = source;
        this.sourcePath = sourcePath;
    }
    get sourceDir() {
        return (0, path_1.dirname)(this.sourcePath);
    }
    replaceSourceImportPaths(replacer) {
        this.source = this.source.replace((0, import_regex_1.newImportStatementRegex)('g'), replacer);
        return this;
    }
    resolveFullImportPaths(ext = constants_1.DEFAULT_IMPORT_EXTENSION) {
        this.replaceSourceImportPaths((importStatement) => {
            const match = importStatement.match((0, import_regex_1.newStringRegex)());
            if (!match)
                return importStatement;
            const { path, pathWithQuotes } = match.groups;
            const fullPath = normalizePath(this.resolveFullPath(path, ext));
            return importStatement.replace(pathWithQuotes, pathWithQuotes.replace(path, fullPath));
        });
        return this;
    }
    resolveFullPath(importPath, ext = constants_1.DEFAULT_IMPORT_EXTENSION) {
        const extensions = runtimeExtensions(ext);
        if (extensions.some((extension) => importPath.endsWith(extension)))
            return importPath;
        if (!importPath.startsWith('.')) {
            return (0, package_subpath_resolver_1.resolvePackageSubpath)({ importPath, sourceDir: this.sourceDir, extensions });
        }
        return (0, package_subpath_resolver_1.resolveExistingRuntimePath)({
            importPath,
            absolutePath: (0, path_1.resolve)(this.sourceDir, importPath),
            extensions
        });
    }
    static resolveFullImportPaths(code, path, ext = constants_1.DEFAULT_IMPORT_EXTENSION) {
        return new ImportPathResolver(code, path).resolveFullImportPaths(ext).source;
    }
    static replaceSourceImportPaths(code, path, replacer) {
        return new ImportPathResolver(code, path).replaceSourceImportPaths(replacer).source;
    }
}
ImportPathResolver.newStringRegex = import_regex_1.newStringRegex;
ImportPathResolver.newImportStatementRegex = import_regex_1.newImportStatementRegex;
exports.resolveFullImportPaths = ImportPathResolver.resolveFullImportPaths;
exports.replaceSourceImportPaths = ImportPathResolver.replaceSourceImportPaths;
//# sourceMappingURL=import-path-resolver.js.map