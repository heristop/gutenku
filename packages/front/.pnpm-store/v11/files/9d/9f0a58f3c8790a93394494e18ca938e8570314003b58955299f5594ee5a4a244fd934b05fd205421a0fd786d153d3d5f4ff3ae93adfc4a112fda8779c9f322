"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAliasString = exports.replaceAlias = void 0;
const fs_1 = require("fs");
const utils_1 = require("../utils");
async function replaceAlias(params) {
    const { config, file, resolveFullPath, resolveFullExtension } = params;
    config.output.debug('Starting to replace file:', file);
    const code = await fs_1.promises.readFile(file, 'utf8');
    const tempCode = replaceAliasString({
        config,
        file,
        code,
        resolveFullPath,
        resolveFullExtension
    });
    if (code !== tempCode) {
        config.output.debug('replaced file with changes:', file);
        await fs_1.promises.writeFile(file, tempCode, 'utf8');
        return true;
    }
    config.output.debug('replaced file without changes:', file);
    return false;
}
exports.replaceAlias = replaceAlias;
function replaceAliasString(params) {
    const { config, file, resolveFullPath, resolveFullExtension } = params;
    let { code } = params;
    config.replacers.forEach((replacer) => {
        code = (0, utils_1.replaceSourceImportPaths)(code, file, (orig) => replacer({
            orig,
            file,
            config
        }));
    });
    if (resolveFullPath) {
        code = (0, utils_1.resolveFullImportPaths)(code, file, resolveFullExtension);
    }
    return code;
}
exports.replaceAliasString = replaceAliasString;
//# sourceMappingURL=replace-alias.js.map