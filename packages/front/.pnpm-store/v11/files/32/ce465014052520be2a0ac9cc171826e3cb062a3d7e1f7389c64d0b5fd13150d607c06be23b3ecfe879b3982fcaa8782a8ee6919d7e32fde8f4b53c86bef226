"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCompilerOptions = void 0;
const config_paths_1 = require("./config-paths");
function applyCompilerOptions(params) {
    var _a;
    const { config, compilerOptions, baseTsConfig, configDir, baseConfigDir } = params;
    const { baseUrl, outDir, declarationDir, paths, rootDir } = compilerOptions;
    const effectiveOutDir = outDir || ((_a = baseTsConfig === null || baseTsConfig === void 0 ? void 0 : baseTsConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.outDir);
    if (effectiveOutDir) {
        let rawOutDir = effectiveOutDir;
        if (baseConfigDir !== null) {
            rawOutDir = outDir;
        }
        config.outDir = (0, config_paths_1.resolveDirectoryPath)(rawOutDir, configDir, baseConfigDir);
    }
    if (paths) {
        if (baseConfigDir !== null) {
            config.paths = (0, config_paths_1.applyBaseConfigDirToPaths)(paths, baseConfigDir);
        }
        else {
            config.paths = paths;
        }
    }
    if (baseUrl) {
        if (baseConfigDir !== null) {
            config.baseUrl = (0, config_paths_1.replaceConfigDirPlaceholder)(baseUrl, baseConfigDir);
        }
        else {
            config.baseUrl = baseUrl;
        }
    }
    else if (config.paths && Object.keys(config.paths).length !== 0) {
        config.baseUrl = rootDir;
        (0, config_paths_1.resolvePathsWithoutBaseUrl)({
            paths: config.paths,
            configDir,
            rootDir: rootDir
        });
    }
    if (declarationDir) {
        config.declarationDir = (0, config_paths_1.resolveDirectoryPath)(declarationDir, configDir, baseConfigDir);
    }
}
exports.applyCompilerOptions = applyCompilerOptions;
//# sourceMappingURL=compiler-options.js.map