"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const fs_1 = require("fs");
const get_tsconfig_1 = require("get-tsconfig");
const mylas_1 = require("mylas");
const path_1 = require("path");
const compiler_options_1 = require("./compiler-options");
const tsc_alias_options_1 = require("./tsc-alias-options");
function loadConfig(params) {
    var _a;
    const { file, output, baseConfigDir = null } = params;
    if (!(0, fs_1.existsSync)(file))
        output.error(`File ${file} not found`, true);
    output.debug('Loading config file:', file);
    const tsConfig = (0, get_tsconfig_1.parseTsconfig)(file);
    tsConfig.compilerOptions = {
        rootDir: '.',
        ...((_a = tsConfig.compilerOptions) !== null && _a !== void 0 ? _a : {})
    };
    const baseTsConfig = mylas_1.Json.loadS(file, true);
    const { compilerOptions = {}, 'tsc-alias': tscAliasConfig } = tsConfig;
    const configDir = (0, path_1.dirname)(file);
    output.debug('configDir', configDir);
    const config = {};
    (0, compiler_options_1.applyCompilerOptions)({
        config,
        compilerOptions,
        baseTsConfig,
        configDir,
        baseConfigDir
    });
    (0, tsc_alias_options_1.applyTscAliasOptions)({ config, tscAliasConfig, configDir });
    output.debug('loaded config (from file):', config);
    return config;
}
exports.loadConfig = loadConfig;
//# sourceMappingURL=config-loader.js.map