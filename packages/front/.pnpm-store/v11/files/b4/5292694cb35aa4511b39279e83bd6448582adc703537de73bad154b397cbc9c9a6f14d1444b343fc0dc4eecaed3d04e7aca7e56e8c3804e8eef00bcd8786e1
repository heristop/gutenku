"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClassProperty = generateClassProperty;
exports.generateStyleImports = generateStyleImports;
const codeFeatures_1 = require("../codeFeatures");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
function* generateClassProperty(source, classNameWithDot, offset, propertyType) {
    yield `${utils_1.newLine} & { `;
    const boundary = yield* boundary_1.Boundary.start(source, offset, offset + classNameWithDot.length, codeFeatures_1.codeFeatures.navigation);
    yield `'`;
    yield [classNameWithDot.slice(1), source, offset + 1, boundary.features];
    yield `'`;
    yield boundary.end();
    yield `: ${propertyType}`;
    yield ` }`;
}
function* generateStyleImports(style) {
    if (typeof style.src === 'object') {
        yield `${utils_1.newLine} & typeof import(`;
        const boundary = yield* boundary_1.Boundary.start('main', style.src.offset, style.src.offset + style.src.text.length, codeFeatures_1.codeFeatures.navigationAndVerification);
        yield `'`;
        yield [style.src.text, 'main', style.src.offset, boundary.features];
        yield `'`;
        yield boundary.end();
        yield `).default`;
    }
    for (const { text, offset } of style.imports) {
        yield `${utils_1.newLine} & typeof import('`;
        yield [
            text,
            style.name,
            offset,
            codeFeatures_1.codeFeatures.navigationAndVerification,
        ];
        yield `').default`;
    }
}
//# sourceMappingURL=common.js.map