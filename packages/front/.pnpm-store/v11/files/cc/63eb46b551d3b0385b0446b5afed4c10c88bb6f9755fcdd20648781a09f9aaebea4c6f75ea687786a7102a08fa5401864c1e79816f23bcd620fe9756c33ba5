"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runs = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const resource_1 = require("../../../core/resource.js");
const OutputItemsAPI = tslib_1.__importStar(require("./output-items.js"));
const output_items_1 = require("./output-items.js");
const pagination_1 = require("../../../core/pagination.js");
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
/**
 * Manage and run evals in the OpenAI platform.
 */
class Runs extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.outputItems = new OutputItemsAPI.OutputItems(this._client);
    }
    /**
     * Kicks off a new run for a given evaluation, specifying the data source, and what
     * model configuration to use to test. The datasource will be validated against the
     * schema specified in the config of the evaluation.
     */
    create(evalID, body, options) {
        return this._client.post((0, path_1.path) `/evals/${evalID}/runs`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Get an evaluation run by ID.
     */
    retrieve(runID, params, options) {
        const { eval_id } = params;
        return this._client.get((0, path_1.path) `/evals/${eval_id}/runs/${runID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    list(evalID, query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'limit', 'order', 'status'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList((0, path_1.path) `/evals/${evalID}/runs`, (pagination_1.CursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
    /**
     * Delete an eval run.
     */
    delete(runID, params, options) {
        const { eval_id } = params;
        return this._client.delete((0, path_1.path) `/evals/${eval_id}/runs/${runID}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
    /**
     * Cancel an ongoing evaluation run.
     */
    cancel(runID, params, options) {
        const { eval_id } = params;
        return this._client.post((0, path_1.path) `/evals/${eval_id}/runs/${runID}/cancel`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
}
exports.Runs = Runs;
Runs.OutputItems = output_items_1.OutputItems;
//# sourceMappingURL=runs.js.map