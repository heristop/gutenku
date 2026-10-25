export type IncrementalSpec = 'v0.1' | 'v0.2';
export declare const MULTIPART_MIXED = "multipart/mixed";
export declare const DEFAULT_MULTIPART_BOUNDARY = "-";
/**
 * HTTP identifier for an incremental delivery payload format.
 *
 * Servers and HTTP executors map Accept / Content-Type parameters to `id`.
 * Payload JSON stays in `@graphql-tools/executor`. A new spec is a new row
 * here plus an executor publisher; Yoga, Hive Gateway, and HTTP executors then
 * pick it up from a utils bump without rewriting Accept negotiation. Unknown
 * values for a registered parameter name should be treated as unsupported
 * (HTTP 406).
 */
export interface IncrementalDeliverySpec {
    id: IncrementalSpec;
    parameter: string;
    value: string;
    default?: boolean;
}
export declare const INCREMENTAL_DELIVERY_SPECS: readonly IncrementalDeliverySpec[];
export declare function getDefaultIncrementalDeliverySpec(specs?: readonly IncrementalDeliverySpec[]): IncrementalDeliverySpec;
export declare function getIncrementalSpecParameterNames(specs?: readonly IncrementalDeliverySpec[]): Set<string>;
export declare function getMultipartContentType(spec?: IncrementalDeliverySpec, options?: {
    echoSpec?: boolean;
    boundary?: string;
}): string;
export declare const DEFAULT_MULTIPART_CONTENT_TYPE: string;
/**
 * Resolve registered spec parameters on a multipart media type.
 *
 * Unknown parameter names are ignored. A registered parameter with an
 * unregistered value is `'unsupported'`.
 */
export declare function lookupIncrementalDeliverySpec(params: Record<string, string>, specs?: readonly IncrementalDeliverySpec[]): IncrementalDeliverySpec | 'unsupported' | undefined;
