import { handleMaybePromise, isPromise } from '@whatwg-node/promise-helpers';
export function isIterableObject(value) {
    // Match graphql-js: only treat as iterable when the iterator is callable.
    // `Symbol.iterator in value` is true for `{ [Symbol.iterator]: null }`.
    return (value != null &&
        typeof value === 'object' &&
        typeof value[Symbol.iterator] === 'function');
}
export function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
export { isPromise };
export function mapMaybePromise(input, onSuccess, onError) {
    return handleMaybePromise(() => input, onSuccess, onError);
}
export function promiseReduce(values, callbackFn, initialValue) {
    let accumulator = initialValue;
    for (const value of values) {
        accumulator = handleMaybePromise(() => accumulator, resolved => callbackFn(resolved, value));
    }
    return accumulator;
}
export function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
/**
 * True for keys that must never be used for object-path writes because they
 * reach the prototype chain (`__proto__`, `constructor`, `prototype`).
 */
export function isDangerousObjectKey(key) {
    return key === '__proto__' || key === 'constructor' || key === 'prototype';
}
/**
 * True when `key` is a primitive string/number that is safe to use for
 * own-property access. Rejects non-primitives (which coerce via `ToPropertyKey`)
 * and {@link isDangerousObjectKey dangerous names}.
 */
export function isSafeObjectKey(key) {
    if (typeof key !== 'string' && typeof key !== 'number') {
        return false;
    }
    return !isDangerousObjectKey(key);
}
