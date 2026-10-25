"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitPathByParentSteps = void 0;
function splitPathByParentSteps(filePath) {
    const match = filePath.match(/^((?:\.\.(?:\/|\\))+)(.*)/);
    if (!match) {
        return {
            parentSteps: '',
            remainingPath: filePath
        };
    }
    return {
        parentSteps: match[1],
        remainingPath: match[2]
    };
}
exports.splitPathByParentSteps = splitPathByParentSteps;
//# sourceMappingURL=path.js.map