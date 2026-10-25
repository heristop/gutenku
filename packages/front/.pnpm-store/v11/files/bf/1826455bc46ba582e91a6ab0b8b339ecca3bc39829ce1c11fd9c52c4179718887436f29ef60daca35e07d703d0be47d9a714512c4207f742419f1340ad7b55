"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importReplacerEntry = void 0;
const replacer_loader_1 = require("./replacer-loader");
function isDefaultReplacer(params) {
    const { defaultReplacers, entry } = params;
    const [name] = entry;
    return Object.keys(defaultReplacers).includes(name);
}
async function importDefaultReplacer(params) {
    var _a;
    const { config, entry } = params;
    const [name] = entry;
    config.output.debug('Loading default replacer:', entry);
    const replacerModule = await (_a = `../replacers/${name}.replacer`, Promise.resolve().then(() => require(_a)));
    config.replacers.push(replacerModule.default);
}
async function importReplacerEntry(params) {
    const { config, defaultReplacers, entry, cwd, nodeModules } = params;
    const [, options] = entry;
    if (!options.enabled) {
        return;
    }
    if (isDefaultReplacer({ defaultReplacers, entry })) {
        await importDefaultReplacer({ config, entry });
    }
    const file = options === null || options === void 0 ? void 0 : options.file;
    if (!file) {
        config.output.debug('Replacer has no file:', entry);
        return;
    }
    const isLoaded = await (0, replacer_loader_1.loadReplacer)({
        config,
        file,
        cwd,
        nodeModules
    });
    if (!isLoaded) {
        config.output.error(`Failed to import replacer "${file}"`);
    }
}
exports.importReplacerEntry = importReplacerEntry;
//# sourceMappingURL=replacer-entry.js.map