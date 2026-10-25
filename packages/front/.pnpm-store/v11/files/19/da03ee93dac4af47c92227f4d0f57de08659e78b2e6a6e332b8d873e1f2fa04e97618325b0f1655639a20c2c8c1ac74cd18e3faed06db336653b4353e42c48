"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectiveValues = getDirectiveValues;
const graphql_1 = require("graphql");
/**
 * GraphQL v17's getDirectiveValues function accepts `VariableValues`
 * while older versions accept `Record<string, any>`. This function wraps the original
 * getDirectiveValues function to provide compatibility across versions.
 */
function getDirectiveValues(directiveDef, node, variableValues) {
    if (graphql_1.versionInfo.major >= 17) {
        return (0, graphql_1.getDirectiveValues)(directiveDef, node, variableValues);
    }
    return (0, graphql_1.getDirectiveValues)(directiveDef, node, variableValues?.coerced);
}
