/**
 * Local GraphQL 17 coercion expects `variableValues` as `{ coerced, sources }`.
 * Flat maps are wrapped only on graphql-js >= 17.
 *
 * When the executor already built real `sources`, pass them through. Otherwise
 * build synthetic sources from the flat map on each call so mutating and
 * reusing the same map stays correct.
 */
export declare function toGraphQLJSVariableValues(variableValues: any, variableSources?: Record<string, unknown>): any;
