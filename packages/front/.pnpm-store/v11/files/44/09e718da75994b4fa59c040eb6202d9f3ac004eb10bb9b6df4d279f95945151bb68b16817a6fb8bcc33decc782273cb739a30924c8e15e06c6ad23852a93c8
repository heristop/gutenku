"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValueAstFromType = void 0;
const graphql_1 = require("graphql");
const astFromValue_js_1 = require("./astFromValue.js");
const astFromValueUntyped_js_1 = require("./astFromValueUntyped.js");
/**
 * `defaultValueAstFromType` extracts default value from `GraphQLArgument` or `GraphQLInputField`, if available.
 *
 * Handles both graphql@16 (`defaultValue`) and graphql@17 (`default`) shapes.
 */
const defaultValueAstFromType = (arg) => {
    // graphql >= v17 has `default` instead of `defaultValue`
    // So for backward compatibility with v16, we are using `arg.default as any`, otherwise, TypeScript report type error
    if ('default' in arg) {
        if (!arg.default) {
            return undefined;
        }
        if ('value' in arg.default) {
            return (0, astFromValueUntyped_js_1.astFromValueUntyped)(arg.default.value) ?? undefined;
        }
        const value = (0, graphql_1.valueFromASTUntyped)(arg.default.literal);
        return (0, astFromValue_js_1.astFromValue)(value, arg.type) ?? undefined;
    }
    // graphql < v17 has `defaultValue` instead of `default`
    return arg.defaultValue !== undefined
        ? ((0, astFromValue_js_1.astFromValue)(arg.defaultValue, arg.type) ?? undefined)
        : undefined;
};
exports.defaultValueAstFromType = defaultValueAstFromType;
