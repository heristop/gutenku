import { valueFromASTUntyped, } from 'graphql';
import { astFromValue } from './astFromValue.js';
import { astFromValueUntyped } from './astFromValueUntyped.js';
/**
 * `defaultValueAstFromType` extracts default value from `GraphQLArgument` or `GraphQLInputField`, if available.
 *
 * Handles both graphql@16 (`defaultValue`) and graphql@17 (`default`) shapes.
 */
export const defaultValueAstFromType = (arg) => {
    // graphql >= v17 has `default` instead of `defaultValue`
    // So for backward compatibility with v16, we are using `arg.default as any`, otherwise, TypeScript report type error
    if ('default' in arg) {
        if (!arg.default) {
            return undefined;
        }
        if ('value' in arg.default) {
            return astFromValueUntyped(arg.default.value) ?? undefined;
        }
        const value = valueFromASTUntyped(arg.default.literal);
        return astFromValue(value, arg.type) ?? undefined;
    }
    // graphql < v17 has `defaultValue` instead of `default`
    return arg.defaultValue !== undefined
        ? (astFromValue(arg.defaultValue, arg.type) ?? undefined)
        : undefined;
};
