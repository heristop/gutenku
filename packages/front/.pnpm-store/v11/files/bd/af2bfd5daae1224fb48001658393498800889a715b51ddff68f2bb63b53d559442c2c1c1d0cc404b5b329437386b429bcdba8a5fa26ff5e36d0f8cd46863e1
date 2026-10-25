import { type GraphQLArgument, type GraphQLInputField, type ValueNode } from 'graphql';
/**
 * `defaultValueAstFromType` extracts default value from `GraphQLArgument` or `GraphQLInputField`, if available
 * This is compatible with all `graphql` versions
 *
 * The return type is `ConstValueNode` in graphql@16+,
 * but it is not available in graphql@15 so `ValueNode` is used as return type here and `as any` is often required at callsites for backwards compatibility,
 */
export declare const defaultValueAstFromType: (arg: GraphQLArgument | GraphQLInputField) => ValueNode | undefined;
