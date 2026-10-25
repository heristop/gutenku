"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescriptionNode = getDescriptionNode;
const graphql_1 = require("graphql");
function isMeaningfulDescription(description) {
    return description.trim().length > 0;
}
function getDescriptionNode(obj) {
    // Prefer the runtime `description` over a stale `astNode` description.
    // Schema transforms (e.g. mapSchema) update config descriptions without rewriting astNode (#5508).
    // Skip empty/whitespace-only strings so loaders that set `description: ""` do not print `""""""`.
    if (typeof obj.description === 'string') {
        if (!isMeaningfulDescription(obj.description)) {
            return undefined;
        }
        return {
            kind: graphql_1.Kind.STRING,
            value: obj.description,
            block: true,
        };
    }
    if (obj.astNode?.description && isMeaningfulDescription(obj.astNode.description.value)) {
        return {
            ...obj.astNode.description,
            block: true,
        };
    }
}
