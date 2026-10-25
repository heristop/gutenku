"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importReplacers = exports.replaceAliasString = exports.replaceAlias = void 0;
const mylas_1 = require("mylas");
const replacer_entry_1 = require("./replacer-entry");
const replacer_options_1 = require("./replacer-options");
var replace_alias_1 = require("./replace-alias");
Object.defineProperty(exports, "replaceAlias", { enumerable: true, get: function () { return replace_alias_1.replaceAlias; } });
Object.defineProperty(exports, "replaceAliasString", { enumerable: true, get: function () { return replace_alias_1.replaceAliasString; } });
async function importReplacers(params) {
    const { config, replacers, cmdReplacers } = params;
    config.output.debug('Started loading replacers');
    const cwd = process.cwd();
    const nodeModules = mylas_1.Dir.nodeModules({ cwd });
    config.output.debug('Found node_modules:', nodeModules);
    const defaultReplacers = (0, replacer_options_1.getDefaultReplacers)(config.baseUrl);
    config.output.debug('Added replacers to list from command-line filepaths:', cmdReplacers);
    const merged = (0, replacer_options_1.mergeReplacers)({
        defaultReplacers,
        replacers,
        cmdReplacers
    });
    config.output.debug('Reading replacers config');
    const entries = Object.entries(merged);
    for await (const entry of entries) {
        await (0, replacer_entry_1.importReplacerEntry)({
            config,
            defaultReplacers,
            entry,
            cwd,
            nodeModules
        });
    }
    config.output.debug('Loaded replacers:', config.replacers);
}
exports.importReplacers = importReplacers;
//# sourceMappingURL=replacers.js.map