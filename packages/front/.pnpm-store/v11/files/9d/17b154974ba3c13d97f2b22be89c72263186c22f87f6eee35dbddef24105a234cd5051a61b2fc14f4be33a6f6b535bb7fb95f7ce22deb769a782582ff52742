// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../../core/resource.mjs";
import * as ArtifactsAPI from "./artifacts.mjs";
import { Artifacts, } from "./artifacts.mjs";
import * as EventsAPI from "./events.mjs";
import { Events } from "./events.mjs";
import * as ItemsAPI from "./items.mjs";
import { Items } from "./items.mjs";
import * as TracesAPI from "./traces.mjs";
import { Traces } from "./traces.mjs";
import * as SubagentsAPI from "./subagents/subagents.mjs";
import { Subagents } from "./subagents/subagents.mjs";
import * as TurnsAPI from "./turns/turns.mjs";
import { Turns } from "./turns/turns.mjs";
import { CursorPage } from "../../../../core/pagination.mjs";
import { buildHeaders } from "../../../../internal/headers.mjs";
import { path } from "../../../../internal/utils/path.mjs";
import { AgentSessionStream, } from "../../../../lib/agents/agent-session-stream.mjs";
import { withAgentTurnResult, captureCreationTools, } from "../../../../lib/beta/agents/agent-session-create-stream.mjs";
import { captureAgentOutput } from "../../../../lib/beta/agents/parse-result.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
function withBodyFinalization(options, finalization) {
    return { ...options, __metadata: { ...options.__metadata, ...finalization } };
}
// Recognizable options across SDK runtime versions. Keep this independent of
// private RequestOptions fields so older handwritten runtimes still compile.
const normalizeRequestOptionsForQueryKeys = new Set([
    'method',
    'path',
    'query',
    'body',
    'headers',
    'maxRetries',
    'stream',
    'timeout',
    'httpAgent',
    'fetchOptions',
    'signal',
    'idempotencyKey',
    'defaultBaseURL',
    '__metadata',
    '__binaryRequest',
    '__binaryResponse',
    '__streamClass',
    '__security',
    '__synthesizeEventData',
]);
function normalizeRequestOptionsForQuery(value, queryKeys, options) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    // Optional never fields can still be explicitly undefined unless consumers
    // enable exactOptionalPropertyTypes. Snapshot data without invoking getters.
    const entries = Object.entries(Object.getOwnPropertyDescriptors(value)).filter(([, descriptor]) => descriptor.enumerable && (!('value' in descriptor) || descriptor.value !== undefined));
    const keys = entries.map(([key]) => key);
    const requestOnly = keys.some((key) => normalizeRequestOptionsForQueryKeys.has(key) && !queryKeys.includes(key));
    if (!requestOnly)
        return undefined;
    // Declared query fields, including stream, must use the query argument.
    // Mixing them with request-only options is ambiguous and could change the return type.
    if (options !== undefined ||
        keys.some((key) => !normalizeRequestOptionsForQueryKeys.has(key) || queryKeys.includes(key))) {
        throw new TypeError('Query parameters and request options must be passed as separate arguments.');
    }
    // The query position must not gain authority to change the request destination
    // or transport. Those overrides require the explicit request options argument.
    if (keys.some((key) => !['headers', 'maxRetries', 'timeout', 'signal', 'idempotencyKey', 'query'].includes(key))) {
        throw new TypeError('Pass transport overrides in the explicit request options argument.');
    }
    // Copy only the validated fields. Spreading value would reintroduce undefined
    // transport overrides, and deleting them would mutate the caller's object.
    return Object.fromEntries(entries.map(([key, descriptor]) => {
        if ('value' in descriptor)
            return [key, descriptor.value];
        return [key, descriptor.get ? Reflect.apply(descriptor.get, value, []) : undefined];
    }));
}
export class Sessions extends APIResource {
    constructor() {
        super(...arguments);
        this.subagents = new SubagentsAPI.Subagents(this._client);
        this.artifacts = new ArtifactsAPI.Artifacts(this._client);
        this.items = new ItemsAPI.Items(this._client);
        this.events = new EventsAPI.Events(this._client);
        this.traces = new TracesAPI.Traces(this._client);
        this.turns = new TurnsAPI.Turns(this._client);
    }
    create(body, options) {
        const creation = captureCreationTools(body, options);
        const output = captureAgentOutput(creation.body, creation.options);
        const request = (body, options) => this._client.post('/agents/sessions', resolveResourceRequestOptions(options, (options) => withBodyFinalization({
            body,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            stream: body.stream ?? false,
            __security: { bearerAuth: true },
        }, { streamFromBody: true })));
        return request(output.body, output.options)._thenUnwrap((data, { options }) => 
        // SAFETY: defaultParseResponse uses this same resolved flag to return the configured stream instance.
        options.stream
            ? withAgentTurnResult(data, output.format, creation.handlers
                ? { sessions: this, handlers: creation.handlers, options: output.options }
                : undefined)
            : data);
    }
    /**
     * Retrieves the current state of a managed agent session. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * const agentSession =
     *   await client.beta.agents.sessions.retrieve('session_id');
     * ```
     */
    retrieve(sessionID, options) {
        return this._client.get(path `/agents/sessions/${sessionID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Updates session metadata, model, reasoning effort, or service tier. Model
     * settings apply to subsequent turns. Omitted fields are unchanged. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * const agentSession =
     *   await client.beta.agents.sessions.update('session_id');
     * ```
     */
    update(sessionID, body = {}, options) {
        return this._client.post(path `/agents/sessions/${sessionID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    list(query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'agent_id', 'limit', 'order'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList('/agents/sessions', (CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Removes a managed agent session from the public API and returns a deletion
     * confirmation. If backend execution has ended, deletion can cancel a still-open
     * public turn and abandon unpublished outputs. Running execution must be cancelled
     * first. Physical cleanup may continue asynchronously. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * const agentSessionDeleted =
     *   await client.beta.agents.sessions.delete('session_id');
     * ```
     */
    delete(sessionID, options) {
        return this._client.delete(path `/agents/sessions/${sessionID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /** Stream one turn on an idle session with a single input writer. See AgentSessionStream for lifecycle and tool handling. */
    stream(sessionID, params, options) {
        return new AgentSessionStream(this, sessionID, params, options);
    }
}
Sessions.Subagents = Subagents;
Sessions.Artifacts = Artifacts;
Sessions.Items = Items;
Sessions.Events = Events;
Sessions.Traces = Traces;
Sessions.Turns = Turns;
//# sourceMappingURL=sessions.mjs.map