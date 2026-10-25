"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeFeatures_1 = require("../codegen/codeFeatures");
const plugin = () => {
    return {
        version: 2.2,
        getEmbeddedCodes(_fileName, ir) {
            if (ir.template?.lang === 'html') {
                return [{
                        id: 'template',
                        lang: ir.template.lang,
                    }];
            }
            return [];
        },
        resolveEmbeddedCode(_fileName, ir, embeddedFile) {
            if (embeddedFile.id === 'template' && ir.template?.lang === 'html') {
                embeddedFile.content.push([
                    ir.template.content,
                    ir.template.name,
                    0,
                    codeFeatures_1.codeFeatures.full,
                ]);
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=vue-sfc-template.js.map