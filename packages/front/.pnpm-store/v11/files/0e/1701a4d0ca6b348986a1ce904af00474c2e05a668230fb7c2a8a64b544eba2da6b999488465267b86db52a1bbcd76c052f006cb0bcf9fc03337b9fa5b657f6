"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.substituteWildcard = exports.matchWildcard = exports.parseWildcardPattern = void 0;
function parseWildcardPattern(raw) {
    const starIndex = raw.indexOf('*');
    if (starIndex === -1) {
        return { prefix: raw, suffix: '', hasWildcard: false };
    }
    return {
        prefix: raw.slice(0, starIndex),
        suffix: raw.slice(starIndex + 1),
        hasWildcard: true
    };
}
exports.parseWildcardPattern = parseWildcardPattern;
function matchWildcard(params) {
    const { pattern, text } = params;
    if (!pattern.hasWildcard) {
        if (text === pattern.prefix) {
            return { matched: true, starValue: '' };
        }
        if (text.startsWith(`${pattern.prefix}/`)) {
            return {
                matched: true,
                starValue: text.slice(pattern.prefix.length + 1)
            };
        }
        return { matched: false, starValue: '' };
    }
    const minLength = pattern.prefix.length + pattern.suffix.length;
    const startsProperly = text.startsWith(pattern.prefix);
    const endsProperly = text.endsWith(pattern.suffix);
    if (!startsProperly || !endsProperly || text.length < minLength) {
        return { matched: false, starValue: '' };
    }
    const endCut = text.length - pattern.suffix.length;
    const starValue = text.slice(pattern.prefix.length, endCut);
    return { matched: true, starValue };
}
exports.matchWildcard = matchWildcard;
function substituteWildcard(params) {
    const { pattern, starValue } = params;
    if (!pattern.hasWildcard) {
        return pattern.prefix;
    }
    return `${pattern.prefix}${starValue}${pattern.suffix}`;
}
exports.substituteWildcard = substituteWildcard;
//# sourceMappingURL=pattern-matcher.js.map