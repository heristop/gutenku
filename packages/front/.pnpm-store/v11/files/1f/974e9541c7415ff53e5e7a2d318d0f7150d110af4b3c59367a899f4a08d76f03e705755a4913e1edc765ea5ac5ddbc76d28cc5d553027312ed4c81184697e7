"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadReplacer = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const normalizePath = require("normalize-path");
async function importReplacer(params) {
    var _a;
    const { config, file, targetPath } = params;
    const replacerModule = await (_a = targetPath, Promise.resolve().then(() => require(_a)));
    config.output.debug('Imported replacerModule:', replacerModule);
    const replacerFunction = replacerModule.default;
    if (typeof replacerFunction == 'function') {
        config.replacers.push(replacerFunction);
        config.output.info(`Added replacer "${file}"`);
        return;
    }
    config.output.error(`Failed to import replacer "${file}", not in replacer format.`);
}
async function tryImportReplacer(params) {
    const { config, targetPath } = params;
    try {
        await importReplacer(params);
        config.output.debug('Imported replacer:', targetPath);
        return true;
    }
    catch (_a) { }
    return false;
}
async function loadReplacer(params) {
    const { cwd, file, nodeModules } = params;
    const isRelativePath = !(0, path_1.isAbsolute)(file);
    const path = isRelativePath ? normalizePath((0, path_1.join)(cwd, file)) : file;
    if ((0, fs_1.existsSync)(path) && (await tryImportReplacer({ ...params, targetPath: path }))) {
        return true;
    }
    if (!isRelativePath) {
        return false;
    }
    for (const nodeModule of nodeModules) {
        const targetPath = (0, path_1.join)(cwd, nodeModule, file);
        if (await tryImportReplacer({ ...params, targetPath })) {
            return true;
        }
    }
    return false;
}
exports.loadReplacer = loadReplacer;
//# sourceMappingURL=replacer-loader.js.map