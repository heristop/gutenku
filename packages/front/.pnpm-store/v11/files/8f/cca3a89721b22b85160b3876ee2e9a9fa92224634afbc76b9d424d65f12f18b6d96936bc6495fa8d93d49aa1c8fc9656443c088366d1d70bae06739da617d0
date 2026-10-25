// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { path } from "../../internal/utils/path.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class Cases extends APIResource {
    /**
     * Get a safety case by ID.
     */
    retrieve(id, options) {
        return this._client.get(path `/safety/cases/${id}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
}
//# sourceMappingURL=cases.mjs.map