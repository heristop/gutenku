// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import * as InputItemsAPI from "./input-items.mjs";
import { InputItems } from "./input-items.mjs";
import * as InputTokensAPI from "./input-tokens.mjs";
import { InputTokens } from "./input-tokens.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { path } from "../../../internal/utils/path.mjs";
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
/**
 * Create and manage model responses.
 */
export class Responses extends APIResource {
    constructor() {
        super(...arguments);
        this.inputItems = new InputItemsAPI.InputItems(this._client);
        this.inputTokens = new InputTokensAPI.InputTokens(this._client);
    }
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/responses?beta=true', resolveResourceRequestOptions(options, (options) => withBodyFinalization({
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'openai-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
            stream: params.stream ?? false,
            __security: { bearerAuth: true },
        }, { streamFromBody: true })));
    }
    retrieve(responseID, params = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(params, ['betas', 'include', 'include_obfuscation', 'starting_after', 'stream'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            params = {};
        }
        params = params;
        const { betas, ...query } = params ?? {};
        return this._client.get(path `/responses/${responseID}?beta=true`, resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'openai-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
            stream: params?.stream ?? false,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Deletes a model response with the given ID.
     *
     * @example
     * ```ts
     * await client.beta.responses.delete(
     *   'resp_677efb5139a88190b512bc3fef8e535d',
     * );
     * ```
     */
    delete(responseID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.delete(path `/responses/${responseID}?beta=true`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([
                {
                    Accept: '*/*',
                    ...(betas?.toString() != null ? { 'openai-beta': betas?.toString() } : undefined),
                },
                options?.headers,
            ]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Cancels a model response with the given ID. Only responses created with the
     * `background` parameter set to `true` can be cancelled.
     * [Learn more](https://developers.openai.com/api/docs/guides/background).
     *
     * @example
     * ```ts
     * const betaResponse = await client.beta.responses.cancel(
     *   'resp_677efb5139a88190b512bc3fef8e535d',
     * );
     * ```
     */
    cancel(responseID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/responses/${responseID}/cancel?beta=true`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'openai-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Compact a conversation. Returns a compacted response object.
     *
     * Learn when and how to compact long-running conversations in the
     * [conversation state guide](https://developers.openai.com/api/docs/guides/conversation-state#managing-the-context-window).
     * For ZDR-compatible compaction details, see
     * [Compaction (advanced)](https://developers.openai.com/api/docs/guides/conversation-state#compaction-advanced).
     *
     * @example
     * ```ts
     * const betaCompactedResponse =
     *   await client.beta.responses.compact({
     *     model: 'gpt-6-astra',
     *   });
     * ```
     */
    compact(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/responses/compact?beta=true', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'openai-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
            __security: { bearerAuth: true },
        })));
    }
}
Responses.InputItems = InputItems;
Responses.InputTokens = InputTokens;
//# sourceMappingURL=responses.mjs.map