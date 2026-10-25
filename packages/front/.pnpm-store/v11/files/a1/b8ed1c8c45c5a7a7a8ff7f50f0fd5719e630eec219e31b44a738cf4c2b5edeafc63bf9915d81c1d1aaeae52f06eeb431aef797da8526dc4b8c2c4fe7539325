import { APIResource } from "../../../../../core/resource.mjs";
import * as AgentsAPI from "../../agents.mjs";
import { AgentSessionItemsPage } from "../../agents.mjs";
import { ConversationCursorPage, type ConversationCursorPageParams, PagePromise } from "../../../../../core/pagination.mjs";
import { RequestOptions } from "../../../../../internal/request-options.mjs";
export declare class Items extends APIResource {
    /**
     * Lists items belonging to one root-agent turn, including its interactions with
     * subagents. See
     * [inspecting agent output](https://developers.openai.com/api/docs/guides/agents-api/observability).
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const agentSessionItem of client.beta.agents.sessions.turns.items.list(
     *   'turn_id',
     *   { session_id: 'session_id' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(turnID: string, params: ItemListParams, options?: RequestOptions): PagePromise<AgentSessionItemsConversationCursorPage, AgentsAPI.AgentSessionItem>;
}
export type AgentSessionItemsConversationCursorPage = ConversationCursorPage<AgentsAPI.AgentSessionItem>;
export interface ItemListParams extends ConversationCursorPageParams {
    /**
     * Path param: The ID of the session that owns the turn.
     */
    session_id: string;
    /**
     * Query param: The order in which resources are returned. Defaults to `desc`.
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