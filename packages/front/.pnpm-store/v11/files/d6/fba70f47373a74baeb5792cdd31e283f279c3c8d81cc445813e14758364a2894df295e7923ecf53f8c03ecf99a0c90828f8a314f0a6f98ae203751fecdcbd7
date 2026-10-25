"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
exports.isIterableObject = isIterableObject;
exports.isObjectLike = isObjectLike;
exports.mapMaybePromise = mapMaybePromise;
exports.promiseReduce = promiseReduce;
exports.hasOwnProperty = hasOwnProperty;
exports.isDangerousObjectKey = isDangerousObjectKey;
exports.isSafeObjectKey = isSafeObjectKey;
const promise_helpers_1 = require("@whatwg-node/promise-helpers");
Object.defineProperty(exports, "isPromise", { enumerable: true, get: function () { return promise_helpers_1.isPromise; } });
function isIterableObject(value) {
    // Match graphql-js: only treat as iterable when the iterator is callable.
    // `Symbol.iterator in value` is true for `{ [Symbol.iterator]: null }`.
    return (value != null &&
        typeof value === 'object' &&
        typeof value[Symbol.iterator] === 'function');
}
function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
function mapMaybePromise(input, onSuccess, onError) {
    return (0, promise_helpers_1.handleMaybePromise)(() => input, onSuccess, onError);
}
function promiseReduce(values, callbackFn, initialValue) {
    let accumulator = initialValue;
    for (const value of values) {
        accumulator = (0, promise_helpers_1.handleMaybePromise)(() => accumulator, resolved => callbackFn(resolved, value));
    }
    return accumulator;
}
function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
/**
 * True for keys that must never be used for object-path writes because they
 * reach the prototype chain (`__proto__`, `constructor`, `prototype`).
 */
function isDangerousObjectKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
}
/**
 * True when `key` is a primitive string/number that is safe to use for
 * own-property access. Rejects non-primitives (which coerce via `ToPropertyKey`)
 * and {@link isDangerousObjectKey dangerous names}.
 */
function isSafeObjectKey(key) {
    if (typeof key !== 'string' && typeof key !== 'number') {
        return false;
    }
    return !isDangerousObjectKey(key);
}
