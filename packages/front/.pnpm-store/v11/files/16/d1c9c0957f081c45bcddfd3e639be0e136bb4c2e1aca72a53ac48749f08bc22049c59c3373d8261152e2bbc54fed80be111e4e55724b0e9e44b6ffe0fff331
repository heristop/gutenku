"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProjectConfig = void 0;
const config_loader_1 = require("./config-loader");
const config_overrides_1 = require("./config-overrides");
const project_config_1 = require("./project-config");
function buildProjectConfig(params) {
    const { configFile, output, options } = params;
    const loaded = (0, config_loader_1.loadConfig)({ file: configFile, output });
    const { baseUrl = '', outDir, declarationDir, paths, replacers, resolveFullPaths, verbose, fileExtensions } = loaded;
    (0, config_overrides_1.applyConfigOverrides)({
        options,
        output,
        fileExtensions,
        resolveFullPaths,
        verbose
    });
    const effectiveOutDir = (0, config_overrides_1.resolveEffectiveOutDir)({
        options,
        outDir,
        declarationDir,
        output
    });
    const projectConfig = (0, project_config_1.createProjectConfig)({
        configFile,
        baseUrl,
        outDir: effectiveOutDir,
        options,
        fileExtensions
    });
    output.debug('loaded project config:', projectConfig);
    const config = (0, project_config_1.createFinalConfig)({
        projectConfig,
        output,
        paths,
        aliasTrie: options.aliasTrie
    });
    output.debug('loaded full config:', config);
    return { config, replacers };
}
exports.buildProjectConfig = buildProjectConfig;
//# sourceMappingURL=config-builder.js.map