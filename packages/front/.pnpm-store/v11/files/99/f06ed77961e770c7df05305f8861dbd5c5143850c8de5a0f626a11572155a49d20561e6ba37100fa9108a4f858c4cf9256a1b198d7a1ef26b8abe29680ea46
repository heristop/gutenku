"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStringLiteralKey = generateStringLiteralKey;
const boundary_1 = require("./boundary");
function* generateStringLiteralKey(code, offset, features) {
    const boundary = yield* boundary_1.Boundary.start('template', offset, offset + code.length, features);
    yield `'`;
    yield [code, 'template', offset, boundary.features];
    yield `'`;
    yield boundary.end();
}
//# sourceMappingURL=stringLiteralKey.js.map