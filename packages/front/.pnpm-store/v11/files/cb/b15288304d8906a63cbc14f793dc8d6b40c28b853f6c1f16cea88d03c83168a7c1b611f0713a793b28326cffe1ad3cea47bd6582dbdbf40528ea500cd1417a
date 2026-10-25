"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTscAliasOptions = void 0;
const path_1 = require("path");
function applyTscAliasOptions(params) {
    var _a, _b, _c;
    const { config, tscAliasConfig, configDir } = params;
    if (tscAliasConfig === null || tscAliasConfig === void 0 ? void 0 : tscAliasConfig.replacers)
        config.replacers = tscAliasConfig.replacers;
    if (tscAliasConfig === null || tscAliasConfig === void 0 ? void 0 : tscAliasConfig.resolveFullPaths) {
        config.resolveFullPaths = tscAliasConfig.resolveFullPaths;
    }
    if (tscAliasConfig === null || tscAliasConfig === void 0 ? void 0 : tscAliasConfig.verbose)
        config.verbose = tscAliasConfig.verbose;
    config.fileExtensions = (_a = tscAliasConfig === null || tscAliasConfig === void 0 ? void 0 : tscAliasConfig.fileExtensions) !== null && _a !== void 0 ? _a : {};
    const replacerFile = (_c = (_b = config.replacers) === null || _b === void 0 ? void 0 : _b.pathReplacer) === null || _c === void 0 ? void 0 : _c.file;
    if (replacerFile) {
        config.replacers.pathReplacer.file = (0, path_1.join)(configDir, replacerFile);
    }
}
exports.applyTscAliasOptions = applyTscAliasOptions;
//# sourceMappingURL=tsc-alias-options.js.map