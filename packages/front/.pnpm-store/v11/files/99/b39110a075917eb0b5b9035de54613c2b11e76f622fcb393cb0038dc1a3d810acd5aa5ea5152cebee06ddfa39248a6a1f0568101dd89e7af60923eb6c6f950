import { APIResource } from "../../../../core/resource.js";
import { CursorPage, type CursorPageParams, PagePromise } from "../../../../core/pagination.js";
import { RequestOptions } from "../../../../internal/request-options.js";
export declare class Traces extends APIResource {
    /**
     * Lists published root-turn traces as OTLP JSON, ordered by turn creation time and
     * ID. Unpublished traces are skipped. Each page returns data available when read;
     * it does not wait for late traces. Trace reads and the JSON response are limited
     * to 16 MiB per request. If the limit is exceeded, request fewer traces.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const sessionTrace of client.beta.agents.sessions.traces.list(
     *   'session_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(sessionID: string, query?: (TraceListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<SessionTracesPage, SessionTrace>;
    list(sessionID: string, options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<SessionTracesPage, SessionTrace>;
}
export type SessionTracesPage = CursorPage<SessionTrace>;
export interface SessionTrace {
    /**
     * The root turn ID. Use this ID as the pagination anchor.
     */
    id: string;
    /**
     * The Unix timestamp in seconds when the root turn was created.
     */
    created_at: number;
    /**
     * The object type, which is always `agent.session.trace`.
     */
    object: 'agent.session.trace';
    /**
     * An OTLP JSON ExportTraceServiceRequest containing resourceSpans. Only currently
     * published data is returned; later trace updates are not awaited.
     */
    otlp: {
        [key: string]: unknown;
    };
    /**
     * The session that owns this trace.
     */
    session_id: string;
}
export interface TraceListParams extends CursorPageParams {
    /**
     * The order in which resources are returned. Defaults to `desc`.
     *
     * - `asc` - Returns resources in ascending order.
     * - `desc` - Returns resources in descending order.
     */
    order?: 'asc' | 'desc';
}
export declare namespace Traces {
    export { type SessionTrace as SessionTrace, type SessionTracesPage as SessionTracesPage, type TraceListParams as TraceListParams, };
}
//# sourceMappingURL=traces.d.ts.map