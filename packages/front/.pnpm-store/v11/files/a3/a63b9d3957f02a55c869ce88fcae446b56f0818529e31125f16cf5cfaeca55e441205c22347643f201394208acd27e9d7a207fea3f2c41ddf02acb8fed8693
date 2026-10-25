import { DirectiveNode, GraphQLDirective } from 'graphql';
import { VariableValues } from './types.cjs';
/**
 * GraphQL v17's getDirectiveValues function accepts `VariableValues`
 * while older versions accept `Record<string, any>`. This function wraps the original
 * getDirectiveValues function to provide compatibility across versions.
 */
export declare function getDirectiveValues<TVariables = Record<string, unknown>>(directiveDef: GraphQLDirective, node: {
    readonly directives?: ReadonlyArray<DirectiveNode> | undefined;
}, variableValues?: VariableValues<TVariables>): undefined | Record<string, unknown>;
