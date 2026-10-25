import type { GraphQLError } from 'graphql';
import { getArgumentValues } from 'graphql';
import type { VariableValues } from './types.js';
type FlatVariableMap = {
    readonly [variable: string]: unknown;
};
/**
 * GraphQL 17 `getArgumentValues` expects `{ coerced, sources }`; GraphQL 16 accepts a flat map.
 * Pass execution `variableValues` (often a flat record) through this helper before calling
 * `getArgumentValues`.
 */
export declare function asGetArgumentValuesVariables(variableValues: FlatVariableMap | null | undefined): Parameters<typeof getArgumentValues>[2];
/**
 * Normalize `getVariableValues` success/error shapes across GraphQL 16 (`{ coerced }`) and
 * GraphQL 17 (`{ variableValues: { coerced, sources } }`) for helpers like `shouldIncludeNode`.
 */
export declare function coerceGetVariableValuesResult(result: {
    errors?: ReadonlyArray<GraphQLError>;
    variableValues?: VariableValues;
    coerced?: FlatVariableMap;
}): {
    readonly errors: ReadonlyArray<GraphQLError>;
} | {
    readonly variableValues: VariableValues;
};
export {};
