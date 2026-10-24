"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStyleScopedClasses = generateStyleScopedClasses;
const names_1 = require("../names");
const styleScopedClasses_1 = require("../template/styleScopedClasses");
const utils_1 = require("../utils");
const common_1 = require("./common");
function* generateStyleScopedClasses({ vueCompilerOptions, styles, scriptLang }, ctx) {
    const { resolveStyleClassNames, resolveStyleImports } = vueCompilerOptions;
    if (!resolveStyleClassNames) {
        return;
    }
    const scopedStyles = styles.filter(style => resolveStyleClassNames === true || style.scoped);
    if (!scopedStyles.length) {
        return;
    }
    ctx.generatedTypes.add(names_1.names.StyleScopedClasses);
    const visited = new Set();
    const deferredGenerates = [];
    yield* (0, utils_1.generateTypeAlias)(names_1.names.StyleScopedClasses, scriptLang, function* () {
        yield `{}`;
        for (const style of scopedStyles) {
            if (resolveStyleImports) {
                yield* (0, common_1.generateStyleImports)(style);
            }
            for (const className of style.classNames) {
                if (!visited.has(className.text)) {
                    visited.add(className.text);
                    yield* (0, common_1.generateClassProperty)(style.name, className.text, className.offset, 'boolean');
                }
                else {
                    deferredGenerates.push((0, styleScopedClasses_1.generateStyleScopedClassReference)(style, className.text.slice(1), className.offset + 1));
                }
            }
        }
    });
    if ((0, utils_1.isTsLang)(scriptLang)) {
        // avoid TS6196: JSDoc refs don't count as usage; JS @typedefs skip the check
        yield `void ({} as ${names_1.names.StyleScopedClasses})${utils_1.endOfLine}`;
    }
    for (const generate of deferredGenerates) {
        yield* generate;
    }
}
//# sourceMappingURL=scopedClasses.js.map