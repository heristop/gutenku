// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
var _Webhooks_instances, _Webhooks_validateSecret, _Webhooks_getRequiredHeader;
import { __classPrivateFieldGet } from "../../internal/tslib.mjs";
import { APIResource } from "../../core/resource.mjs";
import * as EventTypesAPI from "./event-types.mjs";
import { EventTypes } from "./event-types.mjs";
import { CursorPage } from "../../core/pagination.mjs";
import { path } from "../../internal/utils/path.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { verifyWebhookSignature, webhookSignatureRequiresSigning } from "../../lib/webhook-signature.mjs";
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
export class Webhooks extends APIResource {
    constructor() {
        super(...arguments);
        _Webhooks_instances.add(this);
        this.eventTypes = new EventTypesAPI.EventTypes(this._client);
    }
    /**
     * Creates a webhook endpoint for the authenticated project.
     *
     * @example
     * ```ts
     * const webhookEndpointWithSecret =
     *   await client.webhooks.create({
     *     event_types: ['batch.completed'],
     *     name: 'x',
     *     url: 'https://',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/webhook_endpoints', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Retrieves a webhook endpoint for the authenticated project.
     *
     * @example
     * ```ts
     * const webhookEndpoint = await client.webhooks.retrieve(
     *   'whe_123',
     * );
     * ```
     */
    retrieve(webhookEndpointID, options) {
        return this._client.get(path `/webhook_endpoints/${webhookEndpointID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    /**
     * Updates a webhook endpoint for the authenticated project.
     *
     * @example
     * ```ts
     * const webhookEndpoint = await client.webhooks.update('whe_123');
     * ```
     */
    update(webhookEndpointID, body = {}, options) {
        return this._client.post(path `/webhook_endpoints/${webhookEndpointID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    list(query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'limit'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList('/webhook_endpoints', (CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Deletes a webhook endpoint for the authenticated project.
     *
     * @example
     * ```ts
     * const deletedWebhookEndpoint = await client.webhooks.delete(
     *   'whe_123',
     * );
     * ```
     */
    delete(webhookEndpointID, options) {
        return this._client.delete(path `/webhook_endpoints/${webhookEndpointID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    /**
     * Rotates the signing secret for a webhook endpoint in the authenticated project.
     *
     * @example
     * ```ts
     * const webhookEndpointWithSecret =
     *   await client.webhooks.rotateSecret('whe_123');
     * ```
     */
    rotateSecret(webhookEndpointID, body = {}, options) {
        return this._client.post(path `/webhook_endpoints/${webhookEndpointID}/rotate_secret`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Sends a sample event to a webhook endpoint for the authenticated project.
     *
     * @example
     * ```ts
     * const webhookEndpointTestResult =
     *   await client.webhooks.test('whe_123', {
     *     event_type: 'batch.completed',
     *   });
     * ```
     */
    test(webhookEndpointID, body, options) {
        return this._client.post(path `/webhook_endpoints/${webhookEndpointID}/test`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Validates that the given payload was sent by OpenAI and parses the payload.
     */
    async unwrap(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
        await this.verifySignature(payload, headers, secret, tolerance);
        return JSON.parse(payload);
    }
    /**
     * Validates whether or not the webhook payload was sent by OpenAI.
     *
     * An error will be raised if the webhook payload was not sent by OpenAI.
     *
     * @param payload - The webhook payload
     * @param headers - The webhook headers
     * @param secret - The webhook secret (optional, will use client secret if not provided)
     * @param tolerance - Maximum age of the webhook in seconds (default: 300 = 5 minutes)
     */
    async verifySignature(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
        if (typeof crypto === 'undefined' ||
            typeof crypto.subtle?.importKey !== 'function' ||
            typeof crypto.subtle.verify !== 'function') {
            throw new Error('Webhook signature verification is only supported when the `crypto` global is defined');
        }
        __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_validateSecret).call(this, secret);
        const headersObj = buildHeaders([headers]).values;
        const signatureHeader = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, 'webhook-signature');
        const timestamp = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, 'webhook-timestamp');
        const webhookId = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, 'webhook-id');
        if (webhookSignatureRequiresSigning(signatureHeader) && typeof crypto.subtle.sign !== 'function') {
            throw new Error('Webhook signature verification is only supported when the `crypto` global is defined');
        }
        return await verifyWebhookSignature(payload, signatureHeader, timestamp, webhookId, secret, tolerance);
    }
}
_Webhooks_instances = new WeakSet(), _Webhooks_validateSecret = function _Webhooks_validateSecret(secret) {
    if (typeof secret !== 'string' || secret.length === 0) {
        throw new Error(`The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function`);
    }
}, _Webhooks_getRequiredHeader = function _Webhooks_getRequiredHeader(headers, name) {
    if (!headers) {
        throw new Error(`Headers are required`);
    }
    const value = headers.get(name);
    if (value === null || value === undefined) {
        throw new Error(`Missing required header: ${name}`);
    }
    return value;
};
Webhooks.EventTypes = EventTypes;
//# sourceMappingURL=webhooks.mjs.map