import { DirectiveNode, FieldNode, GraphQLDirective, GraphQLField } from 'graphql';
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
export declare function getArgumentValues(def: GraphQLField<any, any> | GraphQLDirective, node: FieldNode | DirectiveNode, variableValues?: Record<string, any>, 
/**
 * Optional GraphQL 17 variable sources (declared type + original input) from
 * the executor. When omitted, synthetic sources are built from the flat
 * coerced map for callers that only have runtime values.
 */
variableSources?: Record<string, unknown>): Record<string, any>;
