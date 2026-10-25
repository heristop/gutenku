"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaCoordinate = getSchemaCoordinate;
exports.locatedError = locatedError;
exports.relocatedError = relocatedError;
const graphql_1 = require("graphql");
function withCoordinate(error, coordinate) {
    if (coordinate != null && error.coordinate == null) {
        Object.defineProperties(error, {
            coordinate: { value: coordinate, enumerable: true, configurable: true },
        });
    }
    return error;
}
function getSchemaCoordinate(error) {
    return error.coordinate;
}
function locatedError(rawError, nodes, path, info) {
    const error = (0, graphql_1.locatedError)(rawError, nodes, path);
    return withCoordinate(error, info ? `${info.parentType.name}.${info.fieldName}` : undefined);
}
function relocatedError(originalError, path, info) {
    return withCoordinate(new graphql_1.GraphQLError(originalError.message, {
        nodes: originalError.nodes,
        source: originalError.source,
        positions: originalError.positions,
        path: path == null ? originalError.path : path,
        originalError,
        extensions: originalError.extensions,
    }), info ? `${info.parentType.name}.${info.fieldName}` : originalError.coordinate);
}
