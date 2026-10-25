type BoxedTupleTypes<T extends any[]> = {
    [P in keyof T]: [T[P]];
}[Exclude<keyof T, keyof any[]>];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type UnboxIntersection<T> = T extends {
    0: infer U;
} ? U : never;
export interface MergeDeepRespectSymbols {
    enumerable?: boolean;
    nonEnumerable?: boolean;
}
export interface MergeDeepOptions {
    respectPrototype?: boolean;
    respectArrays?: boolean;
    respectArrayLength?: boolean;
    /**
     * How to handle own symbol keys while merging multiple sources.
     * Omitted / empty: drop symbols when merging two or more sources (historical default).
     * A single-source call is still an identity return (same object reference), including
     * any symbol keys, matching the previous `mergeDeep([x])` behavior.
     * - `enumerable`: merge enumerable symbols like string keys
     * - `nonEnumerable`: copy non-enumerable symbols via property descriptors
     */
    respectSymbols?: MergeDeepRespectSymbols;
}
export declare function mergeDeep<S extends any[]>(sources: S, options?: MergeDeepOptions): UnboxIntersection<UnionToIntersection<BoxedTupleTypes<S>>> & any;
/**
 * @deprecated Prefer the `MergeDeepOptions` object form:
 * `mergeDeep(sources, { respectPrototype, respectArrays, respectArrayLength, respectSymbols })`.
 */
export declare function mergeDeep<S extends any[]>(sources: S, respectPrototype?: boolean, respectArrays?: boolean, respectArrayLength?: boolean, respectNonEnumerableSymbols?: boolean): UnboxIntersection<UnionToIntersection<BoxedTupleTypes<S>>> & any;
export {};
