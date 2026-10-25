"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeDeep = mergeDeep;
const helpers_js_1 = require("./helpers.js");
const jsutils_js_1 = require("./jsutils.js");
function isMergeDeepOptions(value) {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}
function normalizeRespectSymbols(respectSymbols) {
    return {
        enumerable: respectSymbols?.enumerable ?? false,
        nonEnumerable: respectSymbols?.nonEnumerable ?? false,
    };
}
function normalizeMergeDeepOptions(respectPrototypeOrOptions, respectArrays = false, respectArrayLength = false, respectNonEnumerableSymbols = false) {
    if (isMergeDeepOptions(respectPrototypeOrOptions)) {
        return {
            respectPrototype: respectPrototypeOrOptions.respectPrototype ?? false,
            respectArrays: respectPrototypeOrOptions.respectArrays ?? false,
            respectArrayLength: respectPrototypeOrOptions.respectArrayLength ?? false,
            respectSymbols: normalizeRespectSymbols(respectPrototypeOrOptions.respectSymbols),
        };
    }
    return {
        respectPrototype: respectPrototypeOrOptions ?? false,
        respectArrays,
        respectArrayLength,
        // Legacy 5th positional arg maps to non-enumerable-only symbol handling.
        respectSymbols: {
            enumerable: false,
            nonEnumerable: respectNonEnumerableSymbols,
        },
    };
}
function mergeDeep(sources, respectPrototypeOrOptions = false, respectArrays = false, respectArrayLength = false, respectNonEnumerableSymbols = false) {
    const options = normalizeMergeDeepOptions(respectPrototypeOrOptions, respectArrays, respectArrayLength, respectNonEnumerableSymbols);
    return mergeDeepWithOptions(sources, options);
}
function mergeDeepWithOptions(sources, options) {
    const { respectPrototype, respectArrayLength, respectSymbols } = options;
    const respectEnumerableSymbols = respectSymbols.enumerable;
    const respectNonEnumerableSymbols = respectSymbols.nonEnumerable;
    if (sources.length === 0) {
        return;
    }
    // Single-source is an identity return (historical behavior). Symbol policy below only
    // applies when merging two or more sources; stripping here would require cloning.
    if (sources.length === 1) {
        return sources[0];
    }
    let expectedLength;
    let allArrays = true;
    const areArraysInTheSameLength = sources.every(source => {
        if (Array.isArray(source)) {
            if (expectedLength === undefined) {
                expectedLength = source.length;
                return true;
            }
            else if (expectedLength === source.length) {
                return true;
            }
        }
        else {
            allArrays = false;
        }
        return false;
    });
    if (respectArrayLength && areArraysInTheSameLength) {
        return new Array(expectedLength).fill(null).map((_, index) => mergeDeepWithOptions(sources.map(source => source[index]), options));
    }
    if (allArrays) {
        return sources.flat(1);
    }
    let output;
    let firstObjectSource;
    if (respectPrototype) {
        firstObjectSource = sources.find(source => isObject(source));
        if (firstObjectSource) {
            if (output == null) {
                output = {};
            }
            Object.setPrototypeOf(output, Object.create(Object.getPrototypeOf(firstObjectSource)));
        }
    }
    for (const source of sources) {
        if (source === undefined) {
            continue;
        }
        if (isObject(source)) {
            if (output == null) {
                output = {};
            }
            if (firstObjectSource) {
                const outputPrototype = Object.getPrototypeOf(output);
                const sourcePrototype = Object.getPrototypeOf(source);
                if (sourcePrototype) {
                    for (const key of Object.getOwnPropertyNames(sourcePrototype)) {
                        const descriptor = Object.getOwnPropertyDescriptor(sourcePrototype, key);
                        if ((0, helpers_js_1.isSome)(descriptor)) {
                            Object.defineProperty(outputPrototype, key, descriptor);
                        }
                    }
                }
            }
            for (const key in source) {
                // never let a source key reach the prototype chain
                if ((0, jsutils_js_1.isDangerousObjectKey)(key)) {
                    continue;
                }
                // An own key present with value `undefined` is an explicit override and must win,
                // distinct from the key being altogether absent from `source`. Assigning directly
                // (rather than recursing through mergeDeep) avoids the top-level `source === undefined`
                // skip above, which would otherwise silently discard this override and keep the prior
                // value.
                if (Object.prototype.hasOwnProperty.call(output, key) && source[key] !== undefined) {
                    output[key] = mergeDeepWithOptions([output[key], source[key]], options);
                }
                else {
                    output[key] = source[key];
                }
            }
            if (output != null && (respectEnumerableSymbols || respectNonEnumerableSymbols)) {
                for (const sym of Object.getOwnPropertySymbols(source)) {
                    const descriptor = Object.getOwnPropertyDescriptor(source, sym);
                    if (!descriptor.enumerable) {
                        if (respectNonEnumerableSymbols) {
                            // Keep intermediate non-enumerable symbols replaceable so later sources can
                            // still win. Exact source descriptors (non-writable / non-configurable) would
                            // otherwise freeze the first value for the rest of the merge.
                            if (Object.prototype.hasOwnProperty.call(output, sym)) {
                                const existing = Object.getOwnPropertyDescriptor(output, sym);
                                if (existing.configurable) {
                                    Object.defineProperty(output, sym, {
                                        value: source[sym],
                                        writable: true,
                                        enumerable: false,
                                        configurable: true,
                                    });
                                }
                                else if (existing.writable || existing.set) {
                                    output[sym] = source[sym];
                                }
                            }
                            else {
                                Object.defineProperty(output, sym, {
                                    value: source[sym],
                                    writable: true,
                                    enumerable: false,
                                    configurable: true,
                                });
                            }
                        }
                        continue;
                    }
                    if (!respectEnumerableSymbols) {
                        continue;
                    }
                    const hasOwnSymbol = Object.prototype.hasOwnProperty.call(output, sym);
                    if (hasOwnSymbol && source[sym] !== undefined) {
                        const existing = Object.getOwnPropertyDescriptor(output, sym);
                        const mergedValue = mergeDeepWithOptions([output[sym], source[sym]], options);
                        if (existing.writable || existing.set) {
                            output[sym] = mergedValue;
                        }
                        else if (existing.configurable) {
                            Object.defineProperty(output, sym, {
                                value: mergedValue,
                                writable: true,
                                enumerable: true,
                                configurable: true,
                            });
                        }
                        // Non-configurable read-only properties cannot be updated; keep the prior value.
                    }
                    else if (!hasOwnSymbol) {
                        output[sym] = source[sym];
                    }
                    else {
                        // Explicit undefined override, matching string-key behavior.
                        const existing = Object.getOwnPropertyDescriptor(output, sym);
                        if (existing.writable || existing.set) {
                            output[sym] = source[sym];
                        }
                        else if (existing.configurable) {
                            Object.defineProperty(output, sym, {
                                value: source[sym],
                                writable: true,
                                enumerable: true,
                                configurable: true,
                            });
                        }
                    }
                }
            }
        }
        else if (Array.isArray(source)) {
            if (!Array.isArray(output)) {
                output = source;
            }
            else {
                output = mergeDeepWithOptions([output, source], options);
            }
        }
        else {
            output = source;
        }
    }
    return output;
}
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
