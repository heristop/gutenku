"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareSingleFileReplaceTscAliasPaths = void 0;
const helpers_1 = require("./helpers");
async function prepareSingleFileReplaceTscAliasPaths(options = {}) {
    const config = await (0, helpers_1.prepareConfig)(options);
    let declarationConfig;
    const declarationDir = options.declarationDir;
    if (declarationDir && declarationDir !== config.outPath) {
        declarationConfig = await (0, helpers_1.prepareConfig)({
            ...options,
            outDir: declarationDir,
            declarationDir: undefined,
            output: config.output,
            aliasTrie: undefined
        });
    }
    return ({ fileContents, filePath }) => {
        let activeConfig = config;
        const isDeclaration = declarationConfig && (filePath.endsWith('.d.ts') || (declarationDir && filePath.startsWith(declarationDir)));
        if (isDeclaration) {
            activeConfig = declarationConfig;
        }
        return (0, helpers_1.replaceAliasString)({
            config: activeConfig,
            file: filePath,
            code: fileContents,
            resolveFullPath: options === null || options === void 0 ? void 0 : options.resolveFullPaths,
            resolveFullExtension: options === null || options === void 0 ? void 0 : options.resolveFullExtension
        });
    };
}
exports.prepareSingleFileReplaceTscAliasPaths = prepareSingleFileReplaceTscAliasPaths;
//# sourceMappingURL=single-file-replacer.js.map