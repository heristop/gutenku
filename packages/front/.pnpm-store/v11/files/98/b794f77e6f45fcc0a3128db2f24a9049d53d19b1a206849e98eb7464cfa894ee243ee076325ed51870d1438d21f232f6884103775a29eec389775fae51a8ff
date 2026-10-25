"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const muggle_string_1 = require("muggle-string");
const codeFeatures_1 = require("../codegen/codeFeatures");
const plugin = () => {
    return {
        version: 2.2,
        getEmbeddedCodes() {
            return [{
                    id: 'root_tags',
                    lang: 'vue-root-tags',
                }];
        },
        resolveEmbeddedCode(_fileName, ir, embeddedFile) {
            if (embeddedFile.id === 'root_tags') {
                embeddedFile.content.push([ir.content, undefined, 0, codeFeatures_1.codeFeatures.full]);
                for (const block of [
                    ir.template,
                    ir.script,
                    ir.scriptSetup,
                    ...ir.styles,
                    ...ir.customBlocks,
                ]) {
                    if (!block) {
                        continue;
                    }
                    const offset = block.content.lastIndexOf('\n', block.content.lastIndexOf('\n') - 1) + 1;
                    // fix folding range end position failed to mapping
                    (0, muggle_string_1.replaceSourceRange)(embeddedFile.content, undefined, block.startTagEnd, block.endTagStart, ir.content.slice(block.startTagEnd, block.startTagEnd + offset), [
                        '',
                        undefined,
                        block.startTagEnd + offset,
                        codeFeatures_1.codeFeatures.structure,
                    ], ir.content.slice(block.startTagEnd + offset, block.endTagStart));
                }
            }
            else {
                embeddedFile.parentCodeId ??= 'root_tags';
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=vue-root-tags.js.map