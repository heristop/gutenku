"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeFeatures_1 = require("../codegen/codeFeatures");
const plugin = () => {
    return {
        version: 2.2,
        getEmbeddedCodes(_fileName, ir) {
            const result = [];
            for (let i = 0; i < ir.styles.length; i++) {
                const style = ir.styles[i];
                if (style) {
                    result.push({
                        id: 'style_' + i,
                        lang: style.lang,
                    });
                    if (style.bindings.length) {
                        result.push({
                            id: 'style_' + i + '_inline_ts',
                            lang: 'ts',
                        });
                    }
                }
            }
            return result;
        },
        resolveEmbeddedCode(_fileName, ir, embeddedFile) {
            if (embeddedFile.id.startsWith('style_')) {
                const index = parseInt(embeddedFile.id.split('_')[1]);
                const style = ir.styles[index];
                if (embeddedFile.id.endsWith('_inline_ts')) {
                    embeddedFile.parentCodeId = 'style_' + index;
                    for (const binding of style.bindings) {
                        embeddedFile.content.push('(', [
                            binding.text,
                            style.name,
                            binding.offset,
                            codeFeatures_1.codeFeatures.full,
                        ], ');\n');
                    }
                }
                else {
                    embeddedFile.content.push([
                        style.content,
                        style.name,
                        0,
                        codeFeatures_1.codeFeatures.full,
                    ]);
                }
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=vue-sfc-styles.js.map