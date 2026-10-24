// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import { NextCursorPage } from "../../../core/pagination.mjs";
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
export class Roles extends APIResource {
    /**
     * Creates a custom role for the organization.
     *
     * @example
     * ```ts
     * const role = await client.admin.organization.roles.create({
     *   permissions: ['string'],
     *   role_name: 'role_name',
     * });
     * ```
     */
    create(body, options) {
        return this._client.post('/organization/roles', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    /**
     * Retrieves an organization role.
     *
     * @example
     * ```ts
     * const role = await client.admin.organization.roles.retrieve(
     *   'role_id',
     * );
     * ```
     */
    retrieve(roleID, options) {
        return this._client.get(path `/organization/roles/${roleID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    /**
     * Updates an existing organization role.
     *
     * @example
     * ```ts
     * const role = await client.admin.organization.roles.update(
     *   'role_id',
     * );
     * ```
     */
    update(roleID, body, options) {
        return this._client.post(path `/organization/roles/${roleID}`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    list(query = {}, options) {
        const normalizeRequestOptionsForQueryOptions = normalizeRequestOptionsForQuery(query, ['after', 'limit', 'order'], options);
        if (normalizeRequestOptionsForQueryOptions !== undefined) {
            options = normalizeRequestOptionsForQueryOptions;
            query = {};
        }
        query = query;
        return this._client.getAPIList('/organization/roles', (NextCursorPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    /**
     * Deletes a custom role from the organization.
     *
     * @example
     * ```ts
     * const role = await client.admin.organization.roles.delete(
     *   'role_id',
     * );
     * ```
     */
    delete(roleID, options) {
        return this._client.delete(path `/organization/roles/${roleID}`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
}
//# sourceMappingURL=roles.mjs.map