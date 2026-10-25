"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeReplacers = exports.getDefaultReplacers = void 0;
function getDefaultReplacers(baseUrl) {
    return {
        default: {
            enabled: true
        },
        'base-url': {
            enabled: !!baseUrl
        }
    };
}
exports.getDefaultReplacers = getDefaultReplacers;
function mergeReplacers(params) {
    const { defaultReplacers, replacers, cmdReplacers } = params;
    const merged = {
        ...defaultReplacers,
        ...replacers
    };
    cmdReplacers === null || cmdReplacers === void 0 ? void 0 : cmdReplacers.forEach((file) => {
        merged[file] = {
            enabled: true,
            file
        };
    });
    return merged;
}
exports.mergeReplacers = mergeReplacers;
//# sourceMappingURL=replacer-options.js.map