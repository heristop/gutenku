"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanProjectFiles = exports.buildScanPattern = void 0;
const globby_1 = require("globby");
function buildScanPattern(posixOutput, inputGlob, declarationDir) {
    const globPattern = [`${posixOutput}/**/*.${inputGlob}`, `!${posixOutput}/**/node_modules`];
    if (declarationDir && declarationDir !== posixOutput) {
        const posixDeclDir = declarationDir.replace(/\\/g, '/').replace(/\/+$/g, '');
        if (posixDeclDir.startsWith(posixOutput)) {
            globPattern.push(`!${posixDeclDir}/**`);
        }
    }
    return globPattern;
}
exports.buildScanPattern = buildScanPattern;
function scanProjectFiles(globPattern) {
    return (0, globby_1.sync)(globPattern, { dot: true, onlyFiles: true });
}
exports.scanProjectFiles = scanProjectFiles;
//# sourceMappingURL=alias-scanner.js.map