"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceInputValue = coerceInputValue;
exports.coerceInputLiteral = coerceInputLiteral;
exports.coerceDefaultValue = coerceDefaultValue;
exports.replaceVariables = replaceVariables;
const cross_inspect_1 = require("cross-inspect");
const graphql_1 = require("graphql");
const errors_js_1 = require("./errors.js");
const jsutils_js_1 = require("./jsutils.js");
function coerceInputValue(inputValue, type) {
    if ((0, graphql_1.isNonNullType)(type)) {
        if (inputValue == null) {
            return;
        }
        return coerceInputValue(inputValue, type.ofType);
    }
    if (inputValue == null) {
        return null;
    }
    if ((0, graphql_1.isListType)(type)) {
        if (!(0, jsutils_js_1.isIterableObject)(inputValue)) {
            const coercedItem = coerceInputValue(inputValue, type.ofType);
            if (coercedItem === undefined) {
                return;
            }
            return [coercedItem];
        }
        const coercedValue = [];
        for (const itemValue of inputValue) {
            const coercedItem = coerceInputValue(itemValue, type.ofType);
            if (coercedItem === undefined) {
                return;
            }
            coercedValue.push(coercedItem);
        }
        return coercedValue;
    }
    if ((0, graphql_1.isInputObjectType)(type)) {
        if (!(0, jsutils_js_1.isObjectLike)(inputValue) || Array.isArray(inputValue)) {
            return;
        }
        const coercedValue = Object.create(null);
        const fieldDefs = type.getFields();
        let definedFieldCount = 0;
        for (const fieldName of Object.keys(inputValue)) {
            if (inputValue[fieldName] === undefined) {
                continue;
            }
            definedFieldCount++;
            if (!(0, jsutils_js_1.hasOwnProperty)(fieldDefs, fieldName)) {
                return;
            }
        }
        for (const field of Object.values(fieldDefs)) {
            const fieldValue = inputValue[field.name];
            if (fieldValue === undefined) {
                if ((0, graphql_1.isRequiredInputField)(field)) {
                    return;
                }
                const coercedDefaultValue = coerceDefaultValue(field);
                if (coercedDefaultValue !== undefined) {
                    coercedValue[field.name] = coercedDefaultValue;
                }
            }
            else {
                const coercedField = coerceInputValue(fieldValue, field.type);
                if (coercedField === undefined) {
                    return;
                }
                coercedValue[field.name] = coercedField;
            }
        }
        if (type.isOneOf) {
            const keys = Object.keys(coercedValue);
            if (definedFieldCount !== 1 || keys.length !== 1) {
                return;
            }
            const key = keys[0];
            if (coercedValue[key] === null) {
                return;
            }
        }
        return coercedValue;
    }
    const leafType = (0, graphql_1.assertLeafType)(type);
    try {
        return typeof leafType.coerceInputValue === 'function'
            ? leafType.coerceInputValue(inputValue)
            : leafType.parseValue(inputValue);
    }
    catch { }
}
function coerceInputLiteral(valueNode, type, variableValues, fragmentVariableValues) {
    if (valueNode.kind === graphql_1.Kind.VARIABLE) {
        const coercedVariableValue = getCoercedVariableValue(valueNode, variableValues, fragmentVariableValues);
        if (coercedVariableValue == null && (0, graphql_1.isNonNullType)(type)) {
            return;
        }
        return coercedVariableValue;
    }
    if ((0, graphql_1.isNonNullType)(type)) {
        if (valueNode.kind === graphql_1.Kind.NULL) {
            return;
        }
        return coerceInputLiteral(valueNode, type.ofType, variableValues, fragmentVariableValues);
    }
    if (valueNode.kind === graphql_1.Kind.NULL) {
        return null;
    }
    if ((0, graphql_1.isListType)(type)) {
        if (valueNode.kind !== graphql_1.Kind.LIST) {
            const itemValue = coerceInputLiteral(valueNode, type.ofType, variableValues, fragmentVariableValues);
            if (itemValue === undefined) {
                return;
            }
            return [itemValue];
        }
        const coercedValue = [];
        for (const itemNode of valueNode.values) {
            let itemValue = coerceInputLiteral(itemNode, type.ofType, variableValues, fragmentVariableValues);
            if (itemValue === undefined) {
                if (itemNode.kind === graphql_1.Kind.VARIABLE &&
                    getCoercedVariableValue(itemNode, variableValues, fragmentVariableValues) == null &&
                    !(0, graphql_1.isNonNullType)(type.ofType)) {
                    itemValue = null;
                }
                else {
                    return;
                }
            }
            coercedValue.push(itemValue);
        }
        return coercedValue;
    }
    if ((0, graphql_1.isInputObjectType)(type)) {
        if (valueNode.kind !== graphql_1.Kind.OBJECT) {
            return;
        }
        const coercedValue = Object.create(null);
        const fieldDefs = type.getFields();
        const hasUndefinedField = valueNode.fields.some(field => !(0, jsutils_js_1.hasOwnProperty)(fieldDefs, field.name.value));
        if (hasUndefinedField) {
            return;
        }
        const fieldNodes = new Map(valueNode.fields.map(field => [field.name.value, field]));
        for (const field of Object.values(fieldDefs)) {
            const fieldNode = fieldNodes.get(field.name);
            if (!fieldNode ||
                (fieldNode.value.kind === graphql_1.Kind.VARIABLE &&
                    isMissingVariable(fieldNode.value, variableValues, fragmentVariableValues))) {
                if ((0, graphql_1.isRequiredInputField)(field)) {
                    return;
                }
                const coercedDefaultValue = coerceDefaultValue(field);
                if (coercedDefaultValue !== undefined) {
                    coercedValue[field.name] = coercedDefaultValue;
                }
            }
            else {
                const fieldValue = coerceInputLiteral(fieldNode.value, field.type, variableValues, fragmentVariableValues);
                if (fieldValue === undefined) {
                    return;
                }
                coercedValue[field.name] = fieldValue;
            }
        }
        if (type.isOneOf) {
            const coercedKeys = Object.keys(coercedValue);
            if (fieldNodes.size !== 1 || coercedKeys.length !== 1) {
                return;
            }
            for (const [fieldName, fieldNode] of fieldNodes) {
                if (fieldNode.value.kind === graphql_1.Kind.NULL || coercedValue[fieldName] === null) {
                    return;
                }
            }
        }
        return coercedValue;
    }
    const leafType = (0, graphql_1.assertLeafType)(type);
    try {
        if (typeof leafType.coerceInputLiteral === 'function') {
            const replaced = replaceVariables(valueNode, variableValues, fragmentVariableValues);
            if (replaced == null) {
                return;
            }
            return leafType.coerceInputLiteral(replaced);
        }
        return leafType.parseLiteral(valueNode, variableValues?.coerced);
    }
    catch { }
}
function getCoercedVariableValue(variableNode, variableValues, fragmentVariableValues) {
    const varName = variableNode.name.value;
    if (fragmentVariableValues?.sources[varName] !== undefined) {
        return fragmentVariableValues.coerced[varName];
    }
    return variableValues?.coerced[varName];
}
function isMissingVariable(variableNode, variableValues, fragmentVariableValues) {
    const varName = variableNode.name.value;
    const scopedValues = fragmentVariableValues?.sources[varName] !== undefined
        ? fragmentVariableValues.coerced
        : variableValues?.coerced;
    return scopedValues?.[varName] === undefined;
}
function coerceDefaultValue(inputValue) {
    let coercedDefaultValue = inputValue._memoizedCoercedDefaultValue;
    if (coercedDefaultValue !== undefined) {
        return coercedDefaultValue;
    }
    const defaultInput = inputValue.default;
    if (defaultInput !== undefined) {
        coercedDefaultValue = defaultInput.literal
            ? coerceInputLiteral(defaultInput.literal, inputValue.type)
            : coerceInputValue(defaultInput.value, inputValue.type);
        if (coercedDefaultValue === undefined) {
            throw (0, errors_js_1.createGraphQLError)(`Expected value of type "${(0, cross_inspect_1.inspect)(inputValue.type)}" to be valid, found: ${(0, cross_inspect_1.inspect)(defaultInput.literal ?? defaultInput.value)}.`, defaultInput.literal ? { nodes: [defaultInput.literal] } : undefined);
        }
        inputValue._memoizedCoercedDefaultValue = coercedDefaultValue;
        return coercedDefaultValue;
    }
    const defaultValue = inputValue.defaultValue;
    if (defaultValue !== undefined) {
        inputValue._memoizedCoercedDefaultValue = defaultValue;
    }
    return defaultValue;
}
function replaceVariables(valueNode, variableValues, fragmentVariableValues) {
    switch (valueNode.kind) {
        case graphql_1.Kind.VARIABLE: {
            const varName = valueNode.name.value;
            const fragmentVariableValueSource = fragmentVariableValues?.sources[varName];
            if (fragmentVariableValueSource) {
                const value = fragmentVariableValueSource.value;
                if (value === undefined) {
                    const defaultValue = fragmentVariableValueSource.signature?.default;
                    if (defaultValue !== undefined) {
                        return defaultValue.literal;
                    }
                    return { kind: graphql_1.Kind.NULL };
                }
                return replaceVariables(value, variableValues, fragmentVariableValueSource.fragmentVariableValues);
            }
            const variableValueSource = variableValues?.sources[varName];
            if (variableValueSource == null) {
                return { kind: graphql_1.Kind.NULL };
            }
            if (variableValueSource.value === undefined) {
                const defaultValue = variableValueSource.signature?.default;
                if (defaultValue !== undefined) {
                    return defaultValue.literal;
                }
            }
            return valueToLiteral(variableValueSource.value, variableValueSource.signature.type);
        }
        case graphql_1.Kind.OBJECT: {
            const newFields = [];
            for (const field of valueNode.fields) {
                if (field.value.kind === graphql_1.Kind.VARIABLE) {
                    const scopedVariableSource = fragmentVariableValues?.sources[field.value.name.value] ??
                        variableValues?.sources[field.value.name.value];
                    if (scopedVariableSource?.value === undefined &&
                        scopedVariableSource?.signature?.default === undefined) {
                        continue;
                    }
                }
                const replaced = replaceVariables(field.value, variableValues, fragmentVariableValues);
                if (replaced == null) {
                    return undefined;
                }
                newFields.push({
                    kind: graphql_1.Kind.OBJECT_FIELD,
                    name: field.name,
                    value: replaced,
                    loc: field.loc,
                });
            }
            return {
                kind: graphql_1.Kind.OBJECT,
                fields: newFields,
                loc: valueNode.loc,
            };
        }
        case graphql_1.Kind.LIST: {
            const values = [];
            for (const value of valueNode.values) {
                const replaced = replaceVariables(value, variableValues, fragmentVariableValues);
                if (replaced == null) {
                    return undefined;
                }
                values.push(replaced);
            }
            return {
                kind: graphql_1.Kind.LIST,
                values,
                loc: valueNode.loc,
            };
        }
        default:
            return valueNode;
    }
}
/**
 * Convert a runtime value to an AST literal for `replaceVariables`. Prefers the
 * type's `valueToLiteral` when present; otherwise uses a JSON-like fallback that
 * honors `.toJSON()` (so `Date` round-trips). Returns `undefined` when a present
 * `valueToLiteral` hook rejects the value (graphql-js parity).
 */
function valueToLiteral(value, type) {
    if ((0, graphql_1.isNonNullType)(type)) {
        if (value == null) {
            return undefined;
        }
        return valueToLiteral(value, type.ofType);
    }
    if (value == null) {
        return { kind: graphql_1.Kind.NULL };
    }
    if ((0, graphql_1.isListType)(type)) {
        if (!(0, jsutils_js_1.isIterableObject)(value)) {
            return valueToLiteral(value, type.ofType);
        }
        const values = [];
        for (const item of value) {
            const itemNode = valueToLiteral(item, type.ofType);
            if (itemNode == null) {
                return undefined;
            }
            values.push(itemNode);
        }
        return { kind: graphql_1.Kind.LIST, values };
    }
    if ((0, graphql_1.isInputObjectType)(type)) {
        if (!(0, jsutils_js_1.isObjectLike)(value)) {
            return undefined;
        }
        const fields = [];
        for (const field of Object.values(type.getFields())) {
            const fieldValue = value[field.name];
            if (fieldValue === undefined) {
                continue;
            }
            const fieldNode = valueToLiteral(fieldValue, field.type);
            if (fieldNode == null) {
                return undefined;
            }
            fields.push({
                kind: graphql_1.Kind.OBJECT_FIELD,
                name: { kind: graphql_1.Kind.NAME, value: field.name },
                value: fieldNode,
            });
        }
        return { kind: graphql_1.Kind.OBJECT, fields };
    }
    const leafType = (0, graphql_1.assertLeafType)(type);
    // Match graphql-js: only use the generic fallback when the type has no
    // `valueToLiteral`. If the hook exists but returns nullish or throws, treat
    // that as conversion failure (do not fall back).
    if (typeof leafType.valueToLiteral === 'function') {
        try {
            return leafType.valueToLiteral(value) ?? undefined;
        }
        catch {
            return undefined;
        }
    }
    return defaultScalarValueToLiteral(value);
}
function defaultScalarValueToLiteral(value) {
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
        const stringNum = String(value);
        return integerStringRegExp.test(stringNum)
            ? { kind: graphql_1.Kind.INT, value: stringNum }
            : { kind: graphql_1.Kind.FLOAT, value: stringNum };
    }
    if (typeof value === 'object') {
        if (typeof value.toJSON === 'function') {
            return defaultScalarValueToLiteral(value.toJSON());
        }
        if ((0, jsutils_js_1.isIterableObject)(value)) {
            return {
                kind: graphql_1.Kind.LIST,
                values: Array.from(value, defaultScalarValueToLiteral),
            };
        }
        const fields = [];
        for (const [fieldName, fieldValue] of Object.entries(value)) {
            if (fieldValue !== undefined) {
                fields.push({
                    kind: graphql_1.Kind.OBJECT_FIELD,
                    name: { kind: graphql_1.Kind.NAME, value: fieldName },
                    value: defaultScalarValueToLiteral(fieldValue),
                });
            }
        }
        return { kind: graphql_1.Kind.OBJECT, fields };
    }
    return { kind: graphql_1.Kind.NULL };
}
const integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;
