// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../../../core/resource.mjs";
import { ConversationCursorPage, } from "../../../../../core/pagination.mjs";
import { buildHeaders } from "../../../../../internal/headers.mjs";
import { path } from "../../../../../internal/utils/path.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class Items extends APIResource {
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
    list(turnID, params, options) {
        const { session_id, ...query } = params;
        return this._client.getAPIList(path `/agents/sessions/${session_id}/turns/${turnID}/items`, (ConversationCursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
}
//# sourceMappingURL=items.mjs.map