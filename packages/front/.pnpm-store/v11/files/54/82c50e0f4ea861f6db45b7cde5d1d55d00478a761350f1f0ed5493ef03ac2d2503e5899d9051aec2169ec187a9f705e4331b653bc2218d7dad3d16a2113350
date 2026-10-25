"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Artifacts = void 0;
const resource_1 = require("../../../../core/resource.js");
const pagination_1 = require("../../../../core/pagination.js");
const headers_1 = require("../../../../internal/headers.js");
const path_1 = require("../../../../internal/utils/path.js");
const result_artifacts_1 = require("../../../../lib/beta/agents/result-artifacts.js");
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
class Artifacts extends resource_1.APIResource {
    /**
     * Retrieves immutable metadata for one durable session artifact. See
     * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
     *
     * @example
     * ```ts
     * const sessionArtifact =
     *   await client.beta.agents.sessions.artifacts.retrieve(
     *     'artifact_id',
     *     { session_id: 'session_id' },
     *   );
     * ```
     */
    retrieve(artifactID, params, options) {
        const { session_id } = params;
        return this._client.get((0, path_1.path) `/agents/sessions/${session_id}/artifacts/${artifactID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    list(sessionID, query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'environment_id', 'limit', 'order'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList((0, path_1.path) `/agents/sessions/${sessionID}/artifacts`, (pagination_1.CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Deletes an immutable session artifact without deleting its live environment file
     * or original Files API object. See
     * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
     *
     * @example
     * ```ts
     * const sessionArtifactDeleted =
     *   await client.beta.agents.sessions.artifacts.delete(
     *     'artifact_id',
     *     { session_id: 'session_id' },
     *   );
     * ```
     */
    delete(artifactID, params, options) {
        const { session_id } = params;
        return this._client.delete((0, path_1.path) `/agents/sessions/${session_id}/artifacts/${artifactID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Downloads immutable session artifact bytes after the execution environment
     * expires. See
     * [session artifacts](https://developers.openai.com/api/docs/guides/agents-api/environments/files#openai-hosted-artifacts).
     *
     * @example
     * ```ts
     * const response =
     *   await client.beta.agents.sessions.artifacts.content(
     *     'artifact_id',
     *     { session_id: 'session_id' },
     *   );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    content(artifactID, params, options) {
        const { session_id } = params;
        return this._client.get((0, path_1.path) `/agents/sessions/${session_id}/artifacts/${artifactID}/content`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: (0, headers_1.buildHeaders)([
                { 'OpenAI-Beta': 'agents=v1', Accept: 'application/octet-stream' },
                options?.headers,
            ]),
            __security: { bearerAuth: true },
            __binaryResponse: true,
        })));
    }
    /** Beta: bind artifact lookup and downloads to a completed result's exact session and turn. */
    forResult(result) {
        return new result_artifacts_1.AgentResultArtifacts(this, result);
    }
}
exports.Artifacts = Artifacts;
//# sourceMappingURL=artifacts.js.map