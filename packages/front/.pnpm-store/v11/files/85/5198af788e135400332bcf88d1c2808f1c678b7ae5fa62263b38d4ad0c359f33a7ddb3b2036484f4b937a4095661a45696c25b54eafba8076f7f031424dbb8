import { isPromise, type MaybePromise } from '@whatwg-node/promise-helpers';
export declare function isIterableObject(value: unknown): value is Iterable<unknown>;
export declare function isObjectLike(value: unknown): value is {
    [key: string]: unknown;
};
export { isPromise };
export declare function mapMaybePromise<TInput, TOutput>(input: MaybePromise<TInput>, onSuccess: (value: TInput) => MaybePromise<TOutput>, onError?: (err: any) => MaybePromise<TOutput>): MaybePromise<TOutput>;
export declare function promiseReduce<T, U>(values: Iterable<T>, callbackFn: (accumulator: U, currentValue: T) => MaybePromise<U>, initialValue: MaybePromise<U>): MaybePromise<U>;
export declare function hasOwnProperty(obj: unknown, prop: PropertyKey): boolean;
/**
 * True for keys that must never be used for object-path writes because they
 * reach the prototype chain (`__proto__`, `constructor`, `prototype`).
 */
export declare function isDangerousObjectKey(key: unknown): boolean;
/**
 * True when `key` is a primitive string/number that is safe to use for
 * own-property access. Rejects non-primitives (which coerce via `ToPropertyKey`)
 * and {@link isDangerousObjectKey dangerous names}.
 */
export declare function isSafeObjectKey(key: unknown): key is string | number;
