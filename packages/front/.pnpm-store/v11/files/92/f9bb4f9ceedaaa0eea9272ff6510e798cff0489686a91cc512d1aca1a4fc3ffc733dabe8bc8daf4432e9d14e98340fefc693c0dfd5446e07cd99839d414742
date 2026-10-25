"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeFeatures_1 = require("../codegen/codeFeatures");
const plugin = () => {
    return {
        version: 2.2,
        getEmbeddedCodes(_fileName, ir) {
            const names = [];
            if (ir.script) {
                names.push({ id: 'script_raw', lang: ir.script.lang });
            }
            if (ir.scriptSetup) {
                names.push({ id: 'scriptsetup_raw', lang: ir.scriptSetup.lang });
            }
            return names;
        },
        resolveEmbeddedCode(_fileName, ir, embeddedFile) {
            const script = embeddedFile.id === 'script_raw'
                ? ir.script
                : embeddedFile.id === 'scriptsetup_raw'
                    ? ir.scriptSetup
                    : undefined;
            if (script) {
                embeddedFile.content.push([
                    script.content,
                    script.name,
                    0,
                    codeFeatures_1.codeFeatures.structureAndFormat,
                ]);
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=vue-sfc-scripts.js.map