"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOnReferences = void 0;
const config_references_1 = require("./config-references");
async function runOnReferences(params) {
    const { configFile, options, output, visited } = params;
    const references = (0, config_references_1.readConfigReferences)({ configFile, output });
    for (const refConfigFile of references) {
        if (visited.has(refConfigFile)) {
            output.debug('Cycle detected or already processed, skipping:', refConfigFile);
            continue;
        }
        visited.add(refConfigFile);
        output.debug('Processing reference:', refConfigFile);
        const { replaceTscAliasPaths } = await Promise.resolve().then(() => require('../alias-paths-replacer'));
        await replaceTscAliasPaths({
            ...options,
            configFile: refConfigFile,
            followReferences: false,
            outDir: undefined,
            declarationDir: undefined,
            aliasTrie: undefined,
            output
        });
        await runOnReferences({
            configFile: refConfigFile,
            options,
            output,
            visited
        });
    }
}
exports.runOnReferences = runOnReferences;
//# sourceMappingURL=references-resolver.js.map