"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utils_1 = require("../utils");
const path_validator_1 = require("../utils/path-validator");
const normalizePath = require("normalize-path");
function replaceBaseUrlImport(args) {
    var _a, _b, _c;
    const { orig, file, config } = args;
    const requiredModule = (_b = (_a = orig.match((0, utils_1.newStringRegex)())) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.path;
    config.output.debug('base-url replacer - requiredModule: ', requiredModule);
    config.output.assert(typeof requiredModule === 'string', `Unexpected import statement pattern ${orig}`);
    if (requiredModule.startsWith('.')) {
        config.output.debug('base-url replacer - already resolved');
        return orig;
    }
    const targetPath = (0, path_1.join)(config.outPath, requiredModule);
    try {
        require.resolve(requiredModule, { paths: [(0, path_1.dirname)(file)] });
        return orig;
    }
    catch (_d) { }
    if (!(0, path_validator_1.isImportablePath)(targetPath, config.pathCache.fileExtensions)) {
        return orig;
    }
    let relativePath = normalizePath((0, path_1.relative)((0, path_1.dirname)(file), config.outPath));
    if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
    }
    config.output.debug('base-url replacer - relativePath: ', relativePath);
    const index = orig.indexOf(requiredModule);
    const newImportScript = `${orig.substring(0, index)}${relativePath}/${orig.substring(index)}`;
    config.output.debug('base-url replacer - newImportScript: ', newImportScript);
    const moduleMatch = newImportScript.match((0, utils_1.newStringRegex)());
    const modulePath = (_c = moduleMatch === null || moduleMatch === void 0 ? void 0 : moduleMatch.groups) === null || _c === void 0 ? void 0 : _c.path;
    if (!modulePath)
        return newImportScript;
    config.output.debug('base-url replacer - modulePath: ', modulePath);
    return newImportScript.replace(modulePath, normalizePath(modulePath));
}
exports.default = replaceBaseUrlImport;
//# sourceMappingURL=base-url.replacer.js.map