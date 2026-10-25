"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveEffectiveOutDir = exports.applyConfigOverrides = void 0;
function applyConfigOverrides(params) {
    var _a, _b;
    const { options, output, fileExtensions, resolveFullPaths, verbose } = params;
    if (((_a = options === null || options === void 0 ? void 0 : options.fileExtensions) === null || _a === void 0 ? void 0 : _a.inputGlob) && fileExtensions) {
        fileExtensions.inputGlob = options.fileExtensions.inputGlob;
    }
    if (((_b = options === null || options === void 0 ? void 0 : options.fileExtensions) === null || _b === void 0 ? void 0 : _b.outputCheck) && fileExtensions) {
        fileExtensions.outputCheck = options.fileExtensions.outputCheck;
    }
    output.verbose = verbose;
    if (options.resolveFullPaths || resolveFullPaths) {
        output.debug('resolveFullPaths is active');
        options.resolveFullPaths = true;
    }
}
exports.applyConfigOverrides = applyConfigOverrides;
function resolveEffectiveOutDir(params) {
    var _a, _b;
    const { options, outDir, declarationDir, output } = params;
    const effectiveOutDir = (_a = options.outDir) !== null && _a !== void 0 ? _a : outDir;
    if (declarationDir && effectiveOutDir !== declarationDir) {
        (_b = options.declarationDir) !== null && _b !== void 0 ? _b : (options.declarationDir = declarationDir);
    }
    output.assert(effectiveOutDir, 'compilerOptions.outDir is not set');
    return effectiveOutDir;
}
exports.resolveEffectiveOutDir = resolveEffectiveOutDir;
//# sourceMappingURL=config-overrides.js.map