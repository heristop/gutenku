import { valueFromASTUntyped, } from 'graphql';
import { astFromValue } from './astFromValue.js';
import { astFromValueUntyped } from './astFromValueUntyped.js';
/**
 * `defaultValueAstFromType` extracts default value from `GraphQLArgument` or `GraphQLInputField`, if available
 * This is compatible with all `graphql` versions
 *
 * The return type is `ConstValueNode` in graphql@16+,
 * but it is not available in graphql@15 so `ValueNode` is used as return type here and `as any` is often required at callsites for backwards compatibility,
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
