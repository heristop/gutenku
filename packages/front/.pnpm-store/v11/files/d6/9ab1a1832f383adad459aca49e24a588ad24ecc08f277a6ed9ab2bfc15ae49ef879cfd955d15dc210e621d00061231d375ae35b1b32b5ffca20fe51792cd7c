// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import { ConversationCursorPage, } from "../../../core/pagination.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { path } from "../../../internal/utils/path.mjs";
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
export class Threads extends APIResource {
    /**
     * Retrieve a ChatKit thread by its identifier.
     *
     * @example
     * ```ts
     * const chatkitThread =
     *   await client.beta.chatkit.threads.retrieve('cthr_123');
     * ```
     */
    retrieve(threadID, options) {
        return this._client.get(path `/chatkit/threads/${threadID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'chatkit_beta=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    list(query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'before', 'limit', 'order', 'user'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList('/chatkit/threads', (ConversationCursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'chatkit_beta=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Delete a ChatKit thread along with its items and stored attachments.
     *
     * @example
     * ```ts
     * const thread = await client.beta.chatkit.threads.delete(
     *   'cthr_123',
     * );
     * ```
     */
    delete(threadID, options) {
        return this._client.delete(path `/chatkit/threads/${threadID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'chatkit_beta=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    listItems(threadID, query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'before', 'limit', 'order'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList(path `/chatkit/threads/${threadID}/items`, (ConversationCursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'chatkit_beta=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
}
//# sourceMappingURL=threads.mjs.map