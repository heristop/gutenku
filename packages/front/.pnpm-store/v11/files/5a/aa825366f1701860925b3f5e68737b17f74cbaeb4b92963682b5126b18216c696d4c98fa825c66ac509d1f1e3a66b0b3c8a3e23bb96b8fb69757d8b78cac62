"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStyleModules = generateStyleModules;
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const common_1 = require("./common");
function* generateStyleModules({ vueCompilerOptions, styles, scriptLang }, ctx) {
    const styleModules = styles.filter(style => style.module);
    if (!styleModules.length) {
        return;
    }
    ctx.generatedTypes.add(names_1.names.StyleModules);
    yield* (0, utils_1.generateTypeAlias)(names_1.names.StyleModules, scriptLang, function* () {
        yield `{${utils_1.newLine}`;
        for (const style of styleModules) {
            if (style.module === true) {
                yield `$style`;
            }
            else {
                const { text, offset } = style.module;
                if (!text) {
                    yield [
                        `$style`,
                        'main',
                        offset,
                        codeFeatures_1.codeFeatures.verification,
                    ];
                }
                else if (utils_1.identifierRE.test(text)) {
                    yield [
                        text,
                        'main',
                        offset,
                        codeFeatures_1.codeFeatures.navigationAndVerification,
                    ];
                }
                else {
                    const boundary = yield* boundary_1.Boundary.start('main', offset, offset + text.length, codeFeatures_1.codeFeatures.navigationAndVerification);
                    yield `'`;
                    yield [text, 'main', offset, boundary.features];
                    yield `'`;
                    yield boundary.end();
                }
            }
            yield `: `;
            if (!vueCompilerOptions.strictCssModules) {
                yield `Record<string, string> & `;
            }
            yield `${names_1.names.PrettifyGlobal}<{}`;
            if (vueCompilerOptions.resolveStyleImports) {
                yield* (0, common_1.generateStyleImports)(style);
            }
            for (const className of style.classNames) {
                yield* (0, common_1.generateClassProperty)(style.name, className.text, className.offset, 'string');
            }
            yield `>${utils_1.endOfLine}`;
        }
        yield `}`;
    });
}
//# sourceMappingURL=modules.js.map