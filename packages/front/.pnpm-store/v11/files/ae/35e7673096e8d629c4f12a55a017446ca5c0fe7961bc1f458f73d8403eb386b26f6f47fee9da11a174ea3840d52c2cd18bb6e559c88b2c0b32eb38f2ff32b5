import { APIResource } from "../../../../core/resource.mjs";
import * as AgentsAPI from "../agents.mjs";
import { AgentSessionItemsPage } from "../agents.mjs";
import { type CursorPageParams, PagePromise } from "../../../../core/pagination.mjs";
import { RequestOptions } from "../../../../internal/request-options.mjs";
export declare class Items extends APIResource {
    /**
     * Lists items produced by the session's root agent, including its interactions
     * with subagents. Each subagent has its own item history. See
     * [inspecting agent output](https://developers.openai.com/api/docs/guides/agents-api/observability).
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const agentSessionItem of client.beta.agents.sessions.items.list(
     *   'session_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(sessionID: string, query?: (ItemListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<AgentSessionItemsPage, AgentsAPI.AgentSessionItem>;
    list(sessionID: string, options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<AgentSessionItemsPage, AgentsAPI.AgentSessionItem>;
}
export interface ItemListParams extends CursorPageParams {
    /**
     * The order in which resources are returned. Defaults to `desc`.
     *
     * - `asc` - Returns resources in ascending order.
     * - `desc` - Returns resources in descending order.
     */
    order?: 'asc' | 'desc';
}
export declare namespace Items {
    export { type ItemListParams as ItemListParams };
}
export { type AgentSessionItemsPage };
//# sourceMappingURL=items.d.mts.map