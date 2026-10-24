"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectBestProjectPath = void 0;
function calculateMatchLength(dirParts, posixOutParts, lastIndex) {
    let length = 0;
    for (let i = dirParts.length - 1; i >= 0; --i) {
        if (dirParts[i] !== posixOutParts[lastIndex - length]) {
            break;
        }
        length++;
    }
    return length;
}
function selectBestProjectPath(outDir, projectDir, dirs) {
    if (dirs.length === 0)
        return undefined;
    const posixOutParts = outDir.replace(/\\/g, '/').split('/');
    const lastIndex = posixOutParts.lastIndexOf(projectDir);
    const bestMatch = dirs.reduce((longest, dir) => {
        const parts = dir.split('/');
        const length = calculateMatchLength(parts, posixOutParts, lastIndex);
        if (length > longest.matchLength) {
            return { matchLength: length, dir };
        }
        return longest;
    }, { matchLength: 0, dir: dirs[0] });
    return bestMatch.dir;
}
exports.selectBestProjectPath = selectBestProjectPath;
//# sourceMappingURL=path-matcher.js.map