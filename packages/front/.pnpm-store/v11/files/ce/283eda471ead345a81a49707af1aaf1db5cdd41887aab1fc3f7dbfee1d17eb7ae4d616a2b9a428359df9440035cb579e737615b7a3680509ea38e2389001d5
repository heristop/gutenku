"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relativeOutPathToConfigDir = exports.getProjectDirPathInOutDir = void 0;
const globby_1 = require("globby");
const path_1 = require("path");
const path_matcher_1 = require("./path-matcher");
const normalizePath = require("normalize-path");
function getProjectDirPathInOutDir(outDir, projectDir) {
    const posixOutput = outDir.replace(/\\/g, '/');
    const dirs = (0, globby_1.sync)([
        `${posixOutput}/**/${projectDir}`,
        `!${posixOutput}/**/${projectDir}/**/${projectDir}`,
        `!${posixOutput}/**/node_modules`
    ], {
        dot: true,
        onlyDirectories: true
    });
    return (0, path_matcher_1.selectBestProjectPath)(outDir, projectDir, dirs);
}
exports.getProjectDirPathInOutDir = getProjectDirPathInOutDir;
function relativeOutPathToConfigDir(config) {
    config.configDirInOutPath = getProjectDirPathInOutDir(config.outPath, config.confDirParentFolderName);
    if (!config.configDirInOutPath)
        return;
    config.hasExtraModule = true;
    const stepsbackPath = (0, path_1.relative)(config.configDirInOutPath, config.outPath);
    const splitStepBackPath = normalizePath(stepsbackPath).split('/');
    const nbOfStepBack = splitStepBackPath.length;
    const splitConfDirInOutPath = config.configDirInOutPath.split('/');
    let i = 1;
    const splitRelPath = [];
    while (i <= nbOfStepBack) {
        splitRelPath.unshift(splitConfDirInOutPath[splitConfDirInOutPath.length - i]);
        i++;
    }
    config.relConfDirPathInOutPath = splitRelPath.join('/');
}
exports.relativeOutPathToConfigDir = relativeOutPathToConfigDir;
//# sourceMappingURL=path-project.js.map