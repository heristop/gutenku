"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUnicode = generateUnicode;
const boundary_1 = require("./boundary");
function* generateUnicode(code, offset, features) {
    if (needToUnicode(code)) {
        const boundary = yield* boundary_1.Boundary.start('template', offset, offset + code.length, features);
        yield toUnicode(code);
        yield boundary.end();
    }
    else {
        yield [code, 'template', offset, features];
    }
}
function needToUnicode(str) {
    return str.includes('\\') || str.includes('\n');
}
function toUnicode(str) {
    return str.split('').map(value => {
        const temp = value.charCodeAt(0).toString(16).padStart(4, '0');
        if (temp.length > 2) {
            return '\\u' + temp;
        }
        return value;
    }).join('');
}
//# sourceMappingURL=unicode.js.map