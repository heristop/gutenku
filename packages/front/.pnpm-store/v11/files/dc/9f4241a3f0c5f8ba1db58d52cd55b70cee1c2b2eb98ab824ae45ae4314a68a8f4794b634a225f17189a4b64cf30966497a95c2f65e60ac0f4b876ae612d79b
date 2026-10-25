"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfigReferences = void 0;
const reference_path_resolver_1 = require("./reference-path-resolver");
function readConfigReferences(params) {
    const { configFile, output } = params;
    const { hasReferences, references, missing } = (0, reference_path_resolver_1.loadProjectReferenceDetails)(configFile);
    if (!hasReferences) {
        output === null || output === void 0 ? void 0 : output.debug('No references found in:', configFile);
        return [];
    }
    for (const refPath of missing) {
        output === null || output === void 0 ? void 0 : output.debug('Referenced tsconfig not found, skipping:', refPath);
    }
    for (const reference of references) {
        output === null || output === void 0 ? void 0 : output.debug('Resolved reference:', reference.configFile);
    }
    return references.map(({ configFile: referenceConfigFile }) => referenceConfigFile);
}
exports.readConfigReferences = readConfigReferences;
//# sourceMappingURL=config-references.js.map