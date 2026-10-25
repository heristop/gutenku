// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../../core/resource.mjs";
import { buildHeaders } from "../../../../internal/headers.mjs";
import { path } from "../../../../internal/utils/path.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class Events extends APIResource {
    /**
     * Submits message, cancellation, tool-result, or computer-use approval-response
     * events to a managed agent session. Cancellation can recover a still-open turn
     * whose backend execution has ended by marking it cancelled and abandoning
     * unpublished outputs. Saved results, published files, and existing terminal
     * outcomes are preserved. HTTP 202 confirms acceptance, not durable completion.
     * See
     * [session events](https://developers.openai.com/api/docs/guides/agents-api/sessions/events).
     *
     * @example
     * ```ts
     * await client.beta.agents.sessions.events.create(
     *   'session_id',
     *   {
     *     events: [
     *       {
     *         request_id: 'request_id',
     *         response: {
     *           action: 'submit',
     *           fields: [
     *             { field_id: 'field_id', value: 'value' },
     *           ],
     *           type: 'browser_authentication',
     *         },
     *         type:
     *           'agent.session.input.computer_use_approval_request_result',
     *       },
     *     ],
     *   },
     * );
     * ```
     */
    create(sessionID, params, options) {
        const { 'Idempotency-Key': idempotencyKey, ...body } = params;
        return this._client.post(path `/agents/sessions/${sessionID}/events`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: buildHeaders([
                {
                    'OpenAI-Beta': 'agents=v1',
                    Accept: '*/*',
                    ...(idempotencyKey != null ? { 'Idempotency-Key': idempotencyKey } : undefined),
                },
                options?.headers,
            ]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Streams live events for an agent session. See
     * [session events](https://developers.openai.com/api/docs/guides/agents-api/sessions/events).
     *
     * @example
     * ```ts
     * const agentSessionEvent =
     *   await client.beta.agents.sessions.events.stream(
     *     'session_id',
     *   );
     * ```
     */
    stream(sessionID, options) {
        return this._client.get(path `/agents/sessions/${sessionID}/events`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([
                { 'OpenAI-Beta': 'agents=v1', Accept: 'text/event-stream' },
                options?.headers,
            ]),
            stream: true,
            __security: { bearerAuth: true },
        })));
    }
}
//# sourceMappingURL=events.mjs.map