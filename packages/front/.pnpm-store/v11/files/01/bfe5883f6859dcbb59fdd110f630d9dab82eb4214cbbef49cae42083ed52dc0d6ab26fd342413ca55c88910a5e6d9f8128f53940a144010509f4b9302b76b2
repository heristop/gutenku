"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFinalConfig = exports.createProjectConfig = exports.resolveConfigFilePath = void 0;
const path_1 = require("path");
const utils_1 = require("../utils");
const normalizePath = require("normalize-path");
function resolveConfigFilePath(configFile) {
    if (!configFile)
        return (0, path_1.resolve)(process.cwd(), 'tsconfig.json');
    if (!(0, path_1.isAbsolute)(configFile))
        return (0, path_1.resolve)(process.cwd(), configFile);
    return configFile;
}
exports.resolveConfigFilePath = resolveConfigFilePath;
function createProjectConfig(params) {
    const { configFile, baseUrl, outDir, options, fileExtensions } = params;
    const configDir = normalizePath((0, path_1.dirname)(configFile));
    return {
        configFile,
        baseUrl,
        outDir,
        configDir,
        outPath: outDir,
        confDirParentFolderName: (0, path_1.basename)(configDir),
        hasExtraModule: false,
        configDirInOutPath: null,
        relConfDirPathInOutPath: null,
        pathCache: new utils_1.PathCache(!options.watch, fileExtensions === null || fileExtensions === void 0 ? void 0 : fileExtensions.outputCheck, configFile),
        inputGlob: (fileExtensions === null || fileExtensions === void 0 ? void 0 : fileExtensions.inputGlob) || '{mjs,cjs,js,jsx,d.{mts,cts,ts,tsx}}'
    };
}
exports.createProjectConfig = createProjectConfig;
function createFinalConfig(params) {
    const { projectConfig, output, paths, aliasTrie } = params;
    return {
        ...projectConfig,
        output,
        aliasTrie: aliasTrie !== null && aliasTrie !== void 0 ? aliasTrie : utils_1.TrieNode.buildAliasTrie(projectConfig, paths),
        replacers: []
    };
}
exports.createFinalConfig = createFinalConfig;
//# sourceMappingURL=project-config.js.map