// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../../core/resource.mjs";
import { CursorPage } from "../../../../core/pagination.mjs";
import { buildHeaders } from "../../../../internal/headers.mjs";
import { path } from "../../../../internal/utils/path.mjs";
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
export class Templates extends APIResource {
    /**
     * Creates reusable environment configuration without returning confidential setup
     * commands or environment values. See
     * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
     *
     * @example
     * ```ts
     * const environmentTemplate =
     *   await client.beta.agents.environments.templates.create();
     * ```
     */
    create(body = {}, options) {
        return this._client.post('/agents/environments/templates', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Retrieves reusable environment configuration without returning confidential
     * values. See
     * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
     *
     * @example
     * ```ts
     * const environmentTemplate =
     *   await client.beta.agents.environments.templates.retrieve(
     *     'environment_template_id',
     *   );
     * ```
     */
    retrieve(environmentTemplateID, options) {
        return this._client.get(path `/agents/environments/templates/${environmentTemplateID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Updates reusable environment configuration without returning confidential
     * values. See
     * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
     *
     * @example
     * ```ts
     * const environmentTemplate =
     *   await client.beta.agents.environments.templates.update(
     *     'environment_template_id',
     *   );
     * ```
     */
    update(environmentTemplateID, body = {}, options) {
        return this._client.post(path `/agents/environments/templates/${environmentTemplateID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
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
        return this._client.getAPIList('/agents/environments/templates', (CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Deletes reusable environment configuration and all confidential template inputs.
     * See
     * [reusing a hosted setup](https://developers.openai.com/api/docs/guides/agents-api/tools#reuse-a-hosted-plugin-setup).
     *
     * @example
     * ```ts
     * const environmentTemplateDeleted =
     *   await client.beta.agents.environments.templates.delete(
     *     'environment_template_id',
     *   );
     * ```
     */
    delete(environmentTemplateID, options) {
        return this._client.delete(path `/agents/environments/templates/${environmentTemplateID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
}
//# sourceMappingURL=templates.mjs.map