"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCamelized = generateCamelized;
const shared_1 = require("@vue/shared");
function* generateCamelized(code, source, offset, features) {
    const parts = code.split('-');
    if (!features.__combineToken) {
        features = { ...features, __combineToken: Symbol() };
    }
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part !== '') {
            if (i === 0) {
                yield [part, source, offset, features];
            }
            else {
                yield [(0, shared_1.capitalize)(part), source, offset, features];
            }
        }
        offset += part.length + 1;
    }
}
//# sourceMappingURL=camelized.js.map