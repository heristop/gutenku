import { getDirectiveValues as getDirectiveValuesOrig, versionInfo, } from 'graphql';
/**
 * GraphQL v17's getDirectiveValues function accepts `VariableValues`
 * while older versions accept `Record<string, any>`. This function wraps the original
 * getDirectiveValues function to provide compatibility across versions.
 */
export function getDirectiveValues(directiveDef, node, variableValues) {
    if (versionInfo.major >= 17) {
        return getDirectiveValuesOrig(directiveDef, node, variableValues);
    }
    return getDirectiveValuesOrig(directiveDef, node, variableValues?.coerced);
}
