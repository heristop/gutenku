// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as ContentAPI from "./content.mjs";
import { Content } from "./content.mjs";
import * as VersionsAPI from "./versions/versions.mjs";
import { Versions, } from "./versions/versions.mjs";
import { CursorPage } from "../../core/pagination.mjs";
import { maybeMultipartFormRequestOptions } from "../../internal/uploads.mjs";
import { path } from "../../internal/utils/path.mjs";
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
export class Skills extends APIResource {
    constructor() {
        super(...arguments);
        this.content = new ContentAPI.Content(this._client);
        this.versions = new VersionsAPI.Versions(this._client);
    }
    /**
     * Create a new skill.
     */
    create(body = {}, options) {
        return this._client.post('/skills', maybeMultipartFormRequestOptions(withBodyFinalization({ body, ...options, __security: { bearerAuth: true } }, { finalizeMultipart: true }), this._client, { stripFilenames: false }));
    }
    /**
     * Get a skill by its ID.
     */
    retrieve(skillID, options) {
        return this._client.get(path `/skills/${skillID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    /**
     * Update the default version pointer for a skill.
     */
    update(skillID, body, options) {
        return this._client.post(path `/skills/${skillID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
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
        return this._client.getAPIList('/skills', (CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Delete a skill by its ID.
     */
    delete(skillID, options) {
        return this._client.delete(path `/skills/${skillID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
}
Skills.Content = Content;
Skills.Versions = Versions;
//# sourceMappingURL=skills.mjs.map