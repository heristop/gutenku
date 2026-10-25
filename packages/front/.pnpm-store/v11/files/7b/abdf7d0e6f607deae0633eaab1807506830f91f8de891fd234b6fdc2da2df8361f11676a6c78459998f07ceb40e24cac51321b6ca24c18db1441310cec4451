"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGraphQLJSVariableValues = toGraphQLJSVariableValues;
const graphql_1 = require("graphql");
const jsutils_js_1 = require("./jsutils.js");
const isGraphQLJS17OrAbove = graphql_1.versionInfo.major >= 17;
// Converts an arbitrary runtime value to a GraphQL AST literal for the
// synthetic `anyValueType` below. Prefer `.toJSON()` (same as JSON.stringify)
// so values like `Date` round-trip instead of flattening to `{}`.
function valueToASTLiteral(value) {
    if (value == null) {
        return { kind: graphql_1.Kind.NULL };
    }
    if (typeof value === 'boolean') {
        return { kind: graphql_1.Kind.BOOLEAN, value };
    }
    if (typeof value === 'string') {
        return { kind: graphql_1.Kind.STRING, value, block: false };
    }
    if (typeof value === 'bigint') {
        return { kind: graphql_1.Kind.INT, value: value.toString() };
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            return { kind: graphql_1.Kind.NULL };
        }
        // `Number.isInteger(1e21)` is true, but `String(1e21)` is `"1e+21"`, which
        // is not a valid IntValue. Choose the AST kind from the serialized form.
        const stringNum = String(value);
        return integerStringRegExp.test(stringNum)
            ? { kind: graphql_1.Kind.INT, value: stringNum }
            : { kind: graphql_1.Kind.FLOAT, value: stringNum };
    }
    if (typeof value === 'object') {
        if (typeof value.toJSON === 'function') {
            return valueToASTLiteral(value.toJSON());
        }
        if ((0, jsutils_js_1.isIterableObject)(value)) {
            return {
                kind: graphql_1.Kind.LIST,
                values: Array.from(value, valueToASTLiteral),
            };
        }
        const fields = [];
        for (const [fieldName, fieldValue] of Object.entries(value)) {
            if (fieldValue !== undefined) {
                fields.push({
                    kind: graphql_1.Kind.OBJECT_FIELD,
                    name: { kind: graphql_1.Kind.NAME, value: fieldName },
                    value: valueToASTLiteral(fieldValue),
                });
            }
        }
        return { kind: graphql_1.Kind.OBJECT, fields };
    }
    return { kind: graphql_1.Kind.NULL };
}
// Throwaway scalar used only as `sources[varName].signature.type` when the
// caller has a flat coerced map and no declared variable types. Local
// `replaceVariables` uses this type's `valueToLiteral` to rebuild nested
// variable literals inside custom-scalar arguments.
// `serialize` is required when constructing scalars on graphql-js@14.
const anyValueType = new graphql_1.GraphQLScalarType({
    name: '_GraphQLToolsAnyValue',
    serialize: (value) => value,
    valueToLiteral: valueToASTLiteral,
});
function buildVariableSources(variableValues) {
    const sources = Object.create(null);
    for (const varName of Object.keys(variableValues)) {
        sources[varName] = { signature: { type: anyValueType }, value: variableValues[varName] };
    }
    return sources;
}
/**
 * Local GraphQL 17 coercion expects `variableValues` as `{ coerced, sources }`.
 * Flat maps are wrapped only on graphql-js >= 17.
 *
 * When the executor already built real `sources`, pass them through. Otherwise
 * build synthetic sources from the flat map on each call so mutating and
 * reusing the same map stays correct.
 */
function toGraphQLJSVariableValues(variableValues, variableSources) {
    if (variableValues == null || !isGraphQLJS17OrAbove) {
        return variableValues;
    }
    if (variableSources) {
        return { coerced: variableValues, sources: variableSources };
    }
    return {
        coerced: variableValues,
        sources: buildVariableSources(variableValues),
    };
}
const integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;
