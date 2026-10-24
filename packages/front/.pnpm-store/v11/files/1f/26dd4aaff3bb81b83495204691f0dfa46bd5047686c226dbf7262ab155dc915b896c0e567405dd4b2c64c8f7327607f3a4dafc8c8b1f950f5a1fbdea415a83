"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codeFeatures_1 = require("../codegen/codeFeatures");
const plugin = () => {
    return {
        version: 2.2,
        getEmbeddedCodes(_fileName, ir) {
            return ir.customBlocks.map((customBlock, i) => ({
                id: 'custom_block_' + i,
                lang: customBlock.lang,
            }));
        },
        resolveEmbeddedCode(_fileName, ir, embeddedFile) {
            if (embeddedFile.id.startsWith('custom_block_')) {
                const index = parseInt(embeddedFile.id.slice('custom_block_'.length));
                const customBlock = ir.customBlocks[index];
                embeddedFile.content.push([
                    customBlock.content,
                    customBlock.name,
                    0,
                    codeFeatures_1.codeFeatures.full,
                ]);
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=vue-sfc-customblocks.js.map