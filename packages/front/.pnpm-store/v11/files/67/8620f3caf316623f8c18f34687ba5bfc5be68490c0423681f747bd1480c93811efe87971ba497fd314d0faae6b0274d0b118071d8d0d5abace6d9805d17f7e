// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class DataRetention extends APIResource {
    /**
     * Retrieves organization data retention controls.
     *
     * @example
     * ```ts
     * const organizationDataRetention =
     *   await client.admin.organization.dataRetention.retrieve();
     * ```
     */
    retrieve(options) {
        return this._client.get('/organization/data_retention', resolveResourceRequestOptions(options, (options) => ({
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    /**
     * Updates organization data retention controls.
     *
     * @example
     * ```ts
     * const organizationDataRetention =
     *   await client.admin.organization.dataRetention.update({
     *     retention_type: 'zero_data_retention',
     *   });
     * ```
     */
    update(body, options) {
        return this._client.post('/organization/data_retention', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
}
//# sourceMappingURL=data-retention.mjs.map