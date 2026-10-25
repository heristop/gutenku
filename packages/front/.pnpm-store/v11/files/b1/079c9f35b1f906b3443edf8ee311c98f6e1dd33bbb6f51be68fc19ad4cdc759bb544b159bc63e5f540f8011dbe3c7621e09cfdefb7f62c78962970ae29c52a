"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgumentValues = getArgumentValues;
const cross_inspect_1 = require("cross-inspect");
const graphql_1 = require("graphql");
const coerceInputs_js_1 = require("./coerceInputs.js");
const errors_js_1 = require("./errors.js");
const graphqlJSCompat_js_1 = require("./graphqlJSCompat.js");
const jsutils_js_1 = require("./jsutils.js");
/**
 * Prepares an object map of argument values given a list of argument
 * definitions and list of argument AST nodes.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 *
 * On graphql-js@17+, uses a local copy of graphql-js input coercion so
 * `default` / `coerceInputLiteral` work without importing those optional
 * exports. On older peers, uses the legacy `defaultValue` + `valueFromAST`
 * path.
 */
function getArgumentValues(def, node, variableValues = {}, 
/**
 * Optional GraphQL 17 variable sources (declared type + original input) from
 * the executor. When omitted, synthetic sources are built from the flat
 * coerced map for callers that only have runtime values.
 */
variableSources) {
    if (graphql_1.versionInfo.major >= 17) {
        return getArgumentValuesGraphQL17(def, node, variableValues, variableSources);
    }
    return getArgumentValuesLegacy(def, node, variableValues);
}
function getArgumentValuesGraphQL17(def, node, variableValues, variableSources) {
    const coercedValues = {};
    const argumentNodes = node.arguments ?? [];
    const argNodeMap = new Map(argumentNodes.map(arg => [arg.name.value, arg]));
    const wrappedVariableValues = (0, graphqlJSCompat_js_1.toGraphQLJSVariableValues)(variableValues, variableSources);
    for (const arg of def.args) {
        const argumentNode = argNodeMap.get(arg.name);
        if (!argumentNode) {
            const defaultValue = (0, coerceInputs_js_1.coerceDefaultValue)(arg);
            if (defaultValue !== undefined) {
                coercedValues[arg.name] = defaultValue;
            }
            else if ((0, graphql_1.isNonNullType)(arg.type)) {
                throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" of required type "${(0, cross_inspect_1.inspect)(arg.type)}" ` + 'was not provided.', { nodes: [node] });
            }
            continue;
        }
        const valueNode = argumentNode.value;
        let isNull = valueNode.kind === graphql_1.Kind.NULL;
        if (valueNode.kind === graphql_1.Kind.VARIABLE) {
            const variableName = valueNode.name.value;
            if (variableValues == null || !(0, jsutils_js_1.hasOwnProperty)(variableValues, variableName)) {
                const defaultValue = (0, coerceInputs_js_1.coerceDefaultValue)(arg);
                if (defaultValue !== undefined) {
                    coercedValues[arg.name] = defaultValue;
                }
                else if ((0, graphql_1.isNonNullType)(arg.type)) {
                    throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" of required type "${(0, cross_inspect_1.inspect)(arg.type)}" ` +
                        `was provided the variable "$${variableName}" which was not provided a runtime value.`, { nodes: [valueNode] });
                }
                continue;
            }
            isNull = variableValues[variableName] == null;
        }
        if (isNull && (0, graphql_1.isNonNullType)(arg.type)) {
            throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" of non-null type "${(0, cross_inspect_1.inspect)(arg.type)}" ` + 'must not be null.', { nodes: [valueNode] });
        }
        const coercedValue = (0, coerceInputs_js_1.coerceInputLiteral)(valueNode, arg.type, wrappedVariableValues);
        if (coercedValue === undefined) {
            throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" has invalid value ${(0, graphql_1.print)(valueNode)}.`, {
                nodes: [valueNode],
            });
        }
        coercedValues[arg.name] = coercedValue;
    }
    return coercedValues;
}
/**
 * Pre-graphql-js@17 argument coercion: `defaultValue` + `valueFromAST`.
 */
function getArgumentValuesLegacy(def, node, variableValues) {
    const coercedValues = {};
    const argumentNodes = node.arguments ?? [];
    const argNodeMap = new Map(argumentNodes.map(arg => [arg.name.value, arg]));
    for (const arg of def.args) {
        const argumentNode = argNodeMap.get(arg.name);
        if (!argumentNode) {
            if (arg.defaultValue !== undefined) {
                coercedValues[arg.name] = arg.defaultValue;
            }
            else if ((0, graphql_1.isNonNullType)(arg.type)) {
                throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" of required type "${(0, cross_inspect_1.inspect)(arg.type)}" ` + 'was not provided.', {
                    nodes: [node],
                });
            }
            continue;
        }
        const valueNode = argumentNode.value;
        let isNull = valueNode.kind === graphql_1.Kind.NULL;
        if (valueNode.kind === graphql_1.Kind.VARIABLE) {
            const variableName = valueNode.name.value;
            if (variableValues == null || !(0, jsutils_js_1.hasOwnProperty)(variableValues, variableName)) {
                if (arg.defaultValue !== undefined) {
                    coercedValues[arg.name] = arg.defaultValue;
                }
                else if ((0, graphql_1.isNonNullType)(arg.type)) {
                    throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" of required type "${(0, cross_inspect_1.inspect)(arg.type)}" ` +
                        `was provided the variable "$${variableName}" which was not provided a runtime value.`, {
                        nodes: [valueNode],
                    });
                }
                continue;
            }
            isNull = variableValues[variableName] == null;
        }
        if (isNull && (0, graphql_1.isNonNullType)(arg.type)) {
            throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" of non-null type "${(0, cross_inspect_1.inspect)(arg.type)}" ` + 'must not be null.', {
                nodes: [valueNode],
            });
        }
        const coercedValue = (0, graphql_1.valueFromAST)(valueNode, arg.type, variableValues);
        if (coercedValue === undefined) {
            throw (0, errors_js_1.createGraphQLError)(`Argument "${arg.name}" has invalid value ${(0, graphql_1.print)(valueNode)}.`, {
                nodes: [valueNode],
            });
        }
        coercedValues[arg.name] = coercedValue;
    }
    return coercedValues;
}
