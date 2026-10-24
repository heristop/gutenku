"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveReferenceTargetPath = exports.findMatchingReference = exports.loadProjectReferences = exports.loadProjectReferenceDetails = exports.resolveReferencePath = void 0;
const fs_1 = require("fs");
const mylas_1 = require("mylas");
const path_1 = require("path");
const path_validator_1 = require("../utils/path-validator");
const normalizePath = require("normalize-path");
const refCache = new Map();
function emptyReferenceLoadResult() {
    return { hasReferences: false, references: [], missing: [] };
}
function loadReference(refPath, baseDir) {
    const refFile = resolveReferencePath(refPath, baseDir);
    if (!(0, fs_1.existsSync)(refFile))
        return { missing: refFile };
    const refRaw = mylas_1.Json.loadS(refFile, true);
    const refDir = (0, path_1.dirname)(refFile);
    const options = (refRaw === null || refRaw === void 0 ? void 0 : refRaw.compilerOptions) || {};
    const rootDir = (0, path_1.resolve)(refDir, options.rootDir || '.');
    const outDir = (0, path_1.resolve)(refDir, options.outDir || '.');
    return {
        reference: {
            configFile: refFile,
            rootDir: normalizePath(rootDir),
            outDir: normalizePath(outDir)
        }
    };
}
function loadUncachedProjectReferences(configFile) {
    var _a;
    const raw = mylas_1.Json.loadS(configFile, true);
    const results = ((raw === null || raw === void 0 ? void 0 : raw.references) || []).map(({ path }) => loadReference(path, (0, path_1.dirname)(configFile)));
    return {
        hasReferences: Boolean((_a = raw === null || raw === void 0 ? void 0 : raw.references) === null || _a === void 0 ? void 0 : _a.length),
        references: results.flatMap(({ reference }) => (reference ? [reference] : [])),
        missing: results.flatMap(({ missing }) => (missing ? [missing] : []))
    };
}
function resolveReferencePath(refPath, baseDir) {
    const abs = (0, path_1.isAbsolute)(refPath) ? refPath : (0, path_1.resolve)(baseDir, refPath);
    if ((0, fs_1.existsSync)((0, path_1.join)(abs, 'tsconfig.json')))
        return (0, path_1.join)(abs, 'tsconfig.json');
    return abs;
}
exports.resolveReferencePath = resolveReferencePath;
function loadProjectReferenceDetails(configFile) {
    if (!configFile || !(0, fs_1.existsSync)(configFile))
        return emptyReferenceLoadResult();
    const cached = refCache.get(configFile);
    if (cached)
        return cached;
    const result = loadUncachedProjectReferences(configFile);
    refCache.set(configFile, result);
    return result;
}
exports.loadProjectReferenceDetails = loadProjectReferenceDetails;
function loadProjectReferences(configFile) {
    return loadProjectReferenceDetails(configFile).references.map(({ rootDir, outDir }) => ({
        rootDir,
        outDir
    }));
}
exports.loadProjectReferences = loadProjectReferences;
function findMatchingReference(params) {
    const { configFile, sourcePath } = params;
    const references = loadProjectReferences(configFile);
    const normalizedSource = normalizePath(sourcePath);
    for (const ref of references) {
        const rel = normalizePath((0, path_1.relative)(ref.rootDir, normalizedSource));
        if (!rel.startsWith('..') && !(0, path_1.isAbsolute)(rel))
            return ref;
    }
    return null;
}
exports.findMatchingReference = findMatchingReference;
function resolveReferenceTargetPath(params) {
    const { reference, sourcePath, fileExtensions } = params;
    const rel = normalizePath((0, path_1.relative)(reference.rootDir, normalizePath(sourcePath)));
    const candidateOut = (0, path_1.resolve)(reference.outDir, rel);
    return (0, path_validator_1.getImportablePath)(candidateOut, fileExtensions);
}
exports.resolveReferenceTargetPath = resolveReferenceTargetPath;
//# sourceMappingURL=reference-path-resolver.js.map