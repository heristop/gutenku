import { versionInfo } from 'graphql';
function emptySources() {
    return Object.create(null);
}
/**
 * GraphQL 17 `getArgumentValues` expects `{ coerced, sources }`; GraphQL 16 accepts a flat map.
 * Pass execution `variableValues` (often a flat record) through this helper before calling
 * `getArgumentValues`.
 */
export function asGetArgumentValuesVariables(variableValues) {
    if (variableValues == null) {
        return undefined;
    }
    if (versionInfo.major >= 17 && !('coerced' in variableValues)) {
        return {
            coerced: variableValues,
            sources: emptySources(),
        };
    }
    return variableValues;
}
/**
 * Normalize `getVariableValues` success/error shapes across GraphQL 16 (`{ coerced }`) and
 * GraphQL 17 (`{ variableValues: { coerced, sources } }`) for helpers like `shouldIncludeNode`.
 */
export function coerceGetVariableValuesResult(result) {
    if (result.errors != null && result.errors.length > 0) {
        return { errors: result.errors };
    }
    if (result.variableValues != null) {
        return { variableValues: result.variableValues };
    }
    if (result.coerced != null) {
        return {
            variableValues: {
                coerced: result.coerced,
                sources: emptySources(),
            },
        };
    }
    return {
        variableValues: {
            coerced: Object.create(null),
            sources: emptySources(),
        },
    };
}
