import { ASTNode, GraphQLError } from 'graphql';
import { Maybe } from './types.cjs';
declare module 'graphql' {
    interface GraphQLError {
        /**
         * An optional schema coordinate (e.g. "MyType.myField") associated with this error.
         */
        readonly coordinate?: string;
    }
}
type SchemaCoordinateInfo = {
    fieldName: string;
    parentType: {
        name: string;
    };
};
export declare function getSchemaCoordinate(error: GraphQLError): string | undefined;
export declare function locatedError(rawError: unknown, nodes: ASTNode | ReadonlyArray<ASTNode> | undefined, path: Maybe<ReadonlyArray<string | number>>, info?: SchemaCoordinateInfo | false | null | undefined): GraphQLError;
export declare function relocatedError(originalError: GraphQLError, path?: ReadonlyArray<string | number>, info?: SchemaCoordinateInfo | false | null | undefined): GraphQLError;
export {};
