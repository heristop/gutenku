"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agents = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const resource_1 = require("../../../core/resource.js");
const EnvironmentsAPI = tslib_1.__importStar(require("./environments/environments.js"));
const environments_1 = require("./environments/environments.js");
const SessionsAPI = tslib_1.__importStar(require("./sessions/sessions.js"));
const sessions_1 = require("./sessions/sessions.js");
const VaultsAPI = tslib_1.__importStar(require("./vaults/vaults.js"));
const vaults_1 = require("./vaults/vaults.js");
const pagination_1 = require("../../../core/pagination.js");
const headers_1 = require("../../../internal/headers.js");
const path_1 = require("../../../internal/utils/path.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
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
class Agents extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.environments = new EnvironmentsAPI.Environments(this._client);
        this.vaults = new VaultsAPI.Vaults(this._client);
        this.sessions = new SessionsAPI.Sessions(this._client);
    }
    /**
     * Creates a reusable agent without storing credentials. See
     * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
     *
     * @example
     * ```ts
     * const agent = await client.beta.agents.create({
     *   model: 'model',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/agents', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Retrieves a reusable agent by ID. See
     * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
     *
     * @example
     * ```ts
     * const agent = await client.beta.agents.retrieve('agent_id');
     * ```
     */
    retrieve(agentID, options) {
        return this._client.get((0, path_1.path) `/agents/${agentID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Updates a reusable agent. See
     * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
     *
     * @example
     * ```ts
     * const agent = await client.beta.agents.update('agent_id');
     * ```
     */
    update(agentID, body = {}, options) {
        return this._client.post((0, path_1.path) `/agents/${agentID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    list(query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'limit', 'order'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList('/agents', (pagination_1.CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Deletes a reusable agent. See
     * [agent configuration](https://developers.openai.com/api/docs/guides/agents-api/configuration).
     *
     * @example
     * ```ts
     * const agentDeleted = await client.beta.agents.delete(
     *   'agent_id',
     * );
     * ```
     */
    delete(agentID, options) {
        return this._client.delete((0, path_1.path) `/agents/${agentID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
}
exports.Agents = Agents;
Agents.Environments = environments_1.Environments;
Agents.Vaults = vaults_1.Vaults;
Agents.Sessions = sessions_1.Sessions;
//# sourceMappingURL=agents.js.map