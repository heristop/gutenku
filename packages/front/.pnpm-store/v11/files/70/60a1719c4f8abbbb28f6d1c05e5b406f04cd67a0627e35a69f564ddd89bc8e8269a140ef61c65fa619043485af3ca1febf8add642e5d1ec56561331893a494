"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Videos = void 0;
const resource_1 = require("../core/resource.js");
const pagination_1 = require("../core/pagination.js");
const headers_1 = require("../internal/headers.js");
const uploads_1 = require("../internal/uploads.js");
const path_1 = require("../internal/utils/path.js");
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
 * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
 */
class Videos extends resource_1.APIResource {
    /**
     * Create a new video generation job from a prompt and optional reference assets.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    create(body, options) {
        return this._client.post('/videos', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)({ body, ...options, __security: { bearerAuth: true } }, this._client)));
    }
    /**
     * Fetch the latest metadata for a generated video.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    retrieve(videoID, options) {
        return this._client.get((0, path_1.path) `/videos/${videoID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    list(query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'limit', 'order'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList('/videos', (pagination_1.ConversationCursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Permanently delete a completed or failed video and its stored assets.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    delete(videoID, options) {
        return this._client.delete((0, path_1.path) `/videos/${videoID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    /**
     * Create a character from an uploaded video.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    createCharacter(body, options) {
        return this._client.post('/videos/characters', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)({ body, ...options, __security: { bearerAuth: true } }, this._client)));
    }
    downloadContent(videoID, query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['variant'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.get((0, path_1.path) `/videos/${videoID}/content`, resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: (0, headers_1.buildHeaders)([{ Accept: 'application/binary' }, options?.headers]),
            __security: { bearerAuth: true },
            __binaryResponse: true,
        })));
    }
    /**
     * Create a new video generation job by editing a source video or existing
     * generated video.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    edit(body, options) {
        return this._client.post('/videos/edits', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)({ body, ...options, __security: { bearerAuth: true } }, this._client)));
    }
    /**
     * Create an extension of a completed video.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    extend(body, options) {
        return this._client.post('/videos/extensions', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)({ body, ...options, __security: { bearerAuth: true } }, this._client)));
    }
    /**
     * Fetch a character.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    getCharacter(characterID, options) {
        return this._client.get((0, path_1.path) `/videos/characters/${characterID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    /**
     * Create a remix of a completed video using a refreshed prompt.
     *
     * @deprecated The Sora API is scheduled to permanently shut down on September 24, 2026.
     */
    remix(videoID, body, options) {
        return this._client.post((0, path_1.path) `/videos/${videoID}/remix`, resolveResourceRequestOptions(options, (options) => (0, uploads_1.maybeMultipartFormRequestOptions)(withBodyFinalization({ body, ...options, __security: { bearerAuth: true } }, { finalizeMultipart: true }), this._client)));
    }
}
exports.Videos = Videos;
//# sourceMappingURL=videos.js.map