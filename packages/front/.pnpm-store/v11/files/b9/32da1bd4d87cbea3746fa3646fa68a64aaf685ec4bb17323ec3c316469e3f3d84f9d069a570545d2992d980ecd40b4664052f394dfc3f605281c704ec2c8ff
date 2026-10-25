"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sessions = void 0;
const tslib_1 = require("../../../../internal/tslib.js");
const resource_1 = require("../../../../core/resource.js");
const ArtifactsAPI = tslib_1.__importStar(require("./artifacts.js"));
const artifacts_1 = require("./artifacts.js");
const EventsAPI = tslib_1.__importStar(require("./events.js"));
const events_1 = require("./events.js");
const ItemsAPI = tslib_1.__importStar(require("./items.js"));
const items_1 = require("./items.js");
const TracesAPI = tslib_1.__importStar(require("./traces.js"));
const traces_1 = require("./traces.js");
const SubagentsAPI = tslib_1.__importStar(require("./subagents/subagents.js"));
const subagents_1 = require("./subagents/subagents.js");
const TurnsAPI = tslib_1.__importStar(require("./turns/turns.js"));
const turns_1 = require("./turns/turns.js");
const pagination_1 = require("../../../../core/pagination.js");
const headers_1 = require("../../../../internal/headers.js");
const path_1 = require("../../../../internal/utils/path.js");
const agent_session_stream_1 = require("../../../../lib/agents/agent-session-stream.js");
const agent_session_create_stream_1 = require("../../../../lib/beta/agents/agent-session-create-stream.js");
const parse_result_1 = require("../../../../lib/beta/agents/parse-result.js");
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
class Sessions extends resource_1.APIResource {
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
        const creation = (0, agent_session_create_stream_1.captureCreationTools)(body, options);
        const output = (0, parse_result_1.captureAgentOutput)(creation.body, creation.options);
        const request = (body, options) => this._client.post('/agents/sessions', resolveResourceRequestOptions(options, (options) => withBodyFinalization({
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            stream: body.stream ?? false,
            __security: { bearerAuth: true },
        }, { streamFromBody: true })));
        return request(output.body, output.options)._thenUnwrap((data, { options }) => 
        // SAFETY: defaultParseResponse uses this same resolved flag to return the configured stream instance.
        options.stream
            ? (0, agent_session_create_stream_1.withAgentTurnResult)(data, output.format, creation.handlers
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
        return this._client.get((0, path_1.path) `/agents/sessions/${sessionID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
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
        return this._client.post((0, path_1.path) `/agents/sessions/${sessionID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
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
        return this._client.getAPIList('/agents/sessions', (pagination_1.CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
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
        return this._client.delete((0, path_1.path) `/agents/sessions/${sessionID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /** Stream one turn on an idle session with a single input writer. See AgentSessionStream for lifecycle and tool handling. */
    stream(sessionID, params, options) {
        return new agent_session_stream_1.AgentSessionStream(this, sessionID, params, options);
    }
}
exports.Sessions = Sessions;
Sessions.Subagents = subagents_1.Subagents;
Sessions.Artifacts = artifacts_1.Artifacts;
Sessions.Items = items_1.Items;
Sessions.Events = events_1.Events;
Sessions.Traces = traces_1.Traces;
Sessions.Turns = turns_1.Turns;
//# sourceMappingURL=sessions.js.map