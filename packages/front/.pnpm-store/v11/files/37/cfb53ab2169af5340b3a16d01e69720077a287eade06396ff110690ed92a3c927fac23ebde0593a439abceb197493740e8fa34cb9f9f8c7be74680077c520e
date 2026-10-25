import { GraphQLInputType, ValueNode } from 'graphql';
/**
 * Local copies of graphql-js@17 input coercion helpers (`coerceInputValue`,
 * `coerceInputLiteral`, `coerceDefaultValue`, `replaceVariables`) so this
 * package does not optionally import those exports (which are absent on older
 * peers and break static bundlers). Behavior tracks graphql-js 17.0.2.
 */
type VariableValues = {
    coerced: Record<string, unknown>;
    sources: Record<string, any>;
};
type InputWithDefault = {
    type: GraphQLInputType;
    default?: {
        literal?: ValueNode;
        value?: unknown;
    };
    defaultValue?: unknown;
    _memoizedCoercedDefaultValue?: unknown;
};
export declare function coerceInputValue(inputValue: unknown, type: GraphQLInputType): unknown;
export declare function coerceInputLiteral(valueNode: ValueNode, type: GraphQLInputType, variableValues?: VariableValues, fragmentVariableValues?: VariableValues): unknown;
export declare function coerceDefaultValue(inputValue: InputWithDefault): unknown;
export declare function replaceVariables(valueNode: ValueNode, variableValues?: VariableValues, fragmentVariableValues?: VariableValues): ValueNode | undefined;
export {};
