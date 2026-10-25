"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceTscAliasPaths = void 0;
const plimit_lit_1 = require("plimit-lit");
const helpers_1 = require("./helpers");
const alias_scanner_1 = require("./helpers/alias-scanner");
const watcher_1 = require("./watcher");
const OpenFilesLimit = (0, plimit_lit_1.pLimit)(500);
async function replaceTscAliasPaths(options = {}) {
    const config = await (0, helpers_1.prepareConfig)(options);
    const output = config.output;
    const posixOutput = config.outPath.replace(/\\/g, '/').replace(/\/+$/g, '');
    const globPattern = (0, alias_scanner_1.buildScanPattern)(posixOutput, config.inputGlob, options.declarationDir);
    output.debug('Search pattern:', globPattern);
    const files = (0, alias_scanner_1.scanProjectFiles)(globPattern);
    output.debug('Found files:', files);
    const replaceList = await Promise.all(files.map((file) => OpenFilesLimit(() => (0, helpers_1.replaceAlias)({
        config,
        file,
        resolveFullPath: options === null || options === void 0 ? void 0 : options.resolveFullPaths,
        resolveFullExtension: options === null || options === void 0 ? void 0 : options.resolveFullExtension
    }))));
    output.info(`${replaceList.filter(Boolean).length} files were affected!`);
    if (options.watch) {
        (0, watcher_1.setupFileWatcher)({ config, options, globPattern, onRestart: replaceTscAliasPaths });
    }
    if (options.declarationDir && options.declarationDir !== config.outPath) {
        await replaceTscAliasPaths({
            ...options,
            outDir: options.declarationDir,
            declarationDir: undefined,
            output: config.output,
            aliasTrie: undefined
        });
    }
    if (options.followReferences) {
        const { runOnReferences } = await Promise.resolve().then(() => require('./helpers/references-resolver'));
        await runOnReferences({
            configFile: config.configFile,
            options,
            output: config.output,
            visited: new Set([config.configFile])
        });
    }
}
exports.replaceTscAliasPaths = replaceTscAliasPaths;
//# sourceMappingURL=alias-paths-replacer.js.map