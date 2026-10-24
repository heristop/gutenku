"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const language_core_1 = require("@volar/language-core");
const muggle_string_1 = require("muggle-string");
const buildMappings_1 = require("../utils/buildMappings");
const parseSfc_1 = require("../utils/parseSfc");
const frontmatterRE = /^---[\s\S]*?\n---(?:\r?\n|$)/;
const codeblockRE = /(`{3}|\${2})[\s\S]+?\1/g;
const codeSnippetImportRE = /^\s*<<<\s*.+/gm;
const sfcBlockRE = /<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/g;
const htmlTagRE = /(?<=<\/?)([a-z][a-z0-9-]*)\b[^>]*(?=>)/gi;
const interpolationRE = /(?<=\{\{)[\s\S]*?(?=\}\})/g;
const inlineCodeRE = /(`{1,2})[^`\n]+\1/g;
const angleBracketRE = /<[^\s:]*:\S*>/g;
const plugin = ({ vueCompilerOptions }) => {
    return {
        version: 2.2,
        getLanguageId(fileName) {
            if (vueCompilerOptions.vitePressExtensions.some(ext => fileName.endsWith(ext))) {
                return 'markdown';
            }
        },
        isValidFile(_fileName, languageId) {
            return languageId === 'markdown';
        },
        parseSFC2(_fileName, languageId, content) {
            if (languageId !== 'markdown') {
                return;
            }
            for (const pattern of [frontmatterRE, codeblockRE, codeSnippetImportRE]) {
                content = content.replace(pattern, match => ' '.repeat(match.length));
            }
            const ambiguousRanges = [];
            for (const pattern of [inlineCodeRE, angleBracketRE]) {
                for (const { 0: text, index } of content.matchAll(pattern)) {
                    ambiguousRanges.push([index, index + text.length]);
                }
            }
            const semanticRanges = [];
            for (const pattern of [htmlTagRE, interpolationRE]) {
                for (const { 0: text, index } of content.matchAll(pattern)) {
                    semanticRanges.push([index, index + text.length]);
                }
            }
            const codes = [];
            for (const { 0: text, index } of content.matchAll(sfcBlockRE)) {
                if (ambiguousRanges.some(([start, end]) => index >= start && index < end)) {
                    continue;
                }
                codes.push([text, undefined, index]);
                codes.push('\n\n');
                content = content.slice(0, index) + ' '.repeat(text.length) + content.slice(index + text.length);
            }
            for (const [start, end] of ambiguousRanges) {
                if (semanticRanges.some(range => start >= range[0] && end <= range[1])) {
                    continue;
                }
                content = content.slice(0, start) + ' '.repeat(end - start) + content.slice(end);
            }
            codes.push('<template>\n');
            codes.push([content, undefined, 0]);
            codes.push('\n</template>');
            const mappings = (0, buildMappings_1.buildMappings)(codes);
            const mapper = new language_core_1.SourceMap(mappings);
            const sfc = (0, parseSfc_1.parse)((0, muggle_string_1.toString)(codes));
            for (const block of [
                sfc.descriptor.template,
                sfc.descriptor.script,
                sfc.descriptor.scriptSetup,
                ...sfc.descriptor.styles,
                ...sfc.descriptor.customBlocks,
            ]) {
                if (block) {
                    transformRange(block);
                }
            }
            return sfc;
            function transformRange(block) {
                const { start, end } = block.loc;
                const startOffset = start.offset;
                const endOffset = end.offset;
                start.offset = -1;
                end.offset = -1;
                for (const [offset] of mapper.toSourceLocation(startOffset)) {
                    start.offset = offset;
                    break;
                }
                for (const [offset] of mapper.toSourceLocation(endOffset)) {
                    end.offset = offset;
                    break;
                }
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=file-md.js.map