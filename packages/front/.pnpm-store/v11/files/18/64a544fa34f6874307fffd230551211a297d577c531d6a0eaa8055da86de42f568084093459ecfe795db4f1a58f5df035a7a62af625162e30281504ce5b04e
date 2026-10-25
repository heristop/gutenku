import { locatedError as _locatedError, GraphQLError } from 'graphql';
function withCoordinate(error, coordinate) {
    if (coordinate != null && error.coordinate == null) {
        Object.defineProperties(error, {
            coordinate: { value: coordinate, enumerable: true, configurable: true },
        });
    }
    return error;
}
export function getSchemaCoordinate(error) {
    return error.coordinate;
}
export function locatedError(rawError, nodes, path, info) {
    const error = _locatedError(rawError, nodes, path);
    return withCoordinate(error, info ? `${info.parentType.name}.${info.fieldName}` : undefined);
}
export function relocatedError(originalError, path, info) {
    return withCoordinate(new GraphQLError(originalError.message, {
        nodes: originalError.nodes,
        source: originalError.source,
        positions: originalError.positions,
        path: path == null ? originalError.path : path,
        originalError,
        extensions: originalError.extensions,
    }), info ? `${info.parentType.name}.${info.fieldName}` : originalError.coordinate);
}
