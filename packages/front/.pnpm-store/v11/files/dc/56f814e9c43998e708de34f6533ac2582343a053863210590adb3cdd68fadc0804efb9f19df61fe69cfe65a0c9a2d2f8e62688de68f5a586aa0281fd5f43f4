"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVueCompilerOptions = parseVueCompilerOptions;
const syntaxRE = /^\s*@(?<key>.+?)\s+(?<value>.+?)\s*$/m;
function parseVueCompilerOptions(comments) {
    const entries = comments
        .map(text => {
        try {
            const match = text.match(syntaxRE);
            if (match) {
                const { key, value } = match.groups ?? {};
                if (key === 'plugins') {
                    return;
                }
                return [key, JSON.parse(value)];
            }
        }
        catch { }
    })
        .filter(item => !!item);
    if (entries.length) {
        return Object.fromEntries(entries);
    }
}
//# sourceMappingURL=vueCompilerOptions.js.map