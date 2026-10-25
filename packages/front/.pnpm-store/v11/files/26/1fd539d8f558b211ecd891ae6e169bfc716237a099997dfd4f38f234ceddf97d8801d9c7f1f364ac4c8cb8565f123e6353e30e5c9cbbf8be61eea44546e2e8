"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateObjectProperty = generateObjectProperty;
const shared_1 = require("@vue/shared");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const camelized_1 = require("../utils/camelized");
const stringLiteralKey_1 = require("../utils/stringLiteralKey");
const interpolation_1 = require("./interpolation");
function* generateObjectProperty(options, ctx, code, offset, features, shouldCamelize = false, shouldBeConstant = false) {
    if (code.startsWith('[') && code.endsWith(']')) {
        if (shouldBeConstant) {
            yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, features, code.slice(1, -1), offset + 1, `[${names_1.names.tryAsConstant}(`, `)]`);
        }
        else {
            yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, features, code, offset);
        }
    }
    else if (shouldCamelize) {
        if (utils_1.identifierRE.test((0, shared_1.camelize)(code))) {
            yield* (0, camelized_1.generateCamelized)(code, 'template', offset, features);
        }
        else {
            const boundary = yield* boundary_1.Boundary.start('template', offset, offset + code.length, features);
            yield `'`;
            yield* (0, camelized_1.generateCamelized)(code, 'template', offset, boundary.features);
            yield `'`;
            yield boundary.end();
        }
    }
    else {
        if (utils_1.identifierRE.test(code)) {
            yield [code, 'template', offset, features];
        }
        else {
            yield* (0, stringLiteralKey_1.generateStringLiteralKey)(code, offset, features);
        }
    }
}
//# sourceMappingURL=objectProperty.js.map