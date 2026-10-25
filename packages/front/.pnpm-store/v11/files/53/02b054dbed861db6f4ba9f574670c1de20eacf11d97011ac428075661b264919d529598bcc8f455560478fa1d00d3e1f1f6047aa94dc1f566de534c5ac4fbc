import type { FinalizedRequestInit } from "./types.js";
import type { ProviderRequestContext } from "./provider.js";
/**
 * Resolves Vertex authentication work with caller cancellation, then applies
 * its result synchronously after the final cancellation checks.
 *
 * @internal
 */
export declare function prepareVertexAuth<T>(request: FinalizedRequestInit, context: ProviderRequestContext, operation: {
    resolve: () => Promise<T>;
    apply: (value: T) => void;
}, additionalSignals?: AbortSignal[]): Promise<void>;
//# sourceMappingURL=vertex.d.ts.map