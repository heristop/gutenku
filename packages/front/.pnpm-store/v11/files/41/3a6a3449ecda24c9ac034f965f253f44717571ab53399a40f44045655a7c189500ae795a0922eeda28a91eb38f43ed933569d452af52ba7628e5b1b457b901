// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { path } from "../../../internal/utils/path.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class Content extends APIResource {
    /**
     * Retrieve Container File Content
     */
    retrieve(fileID, params, options) {
        const { container_id } = params;
        return this._client.get(path `/containers/${container_id}/files/${fileID}/content`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            headers: buildHeaders([{ Accept: 'application/binary' }, options?.headers]),
            __security: { bearerAuth: true },
            __binaryResponse: true,
        })));
    }
}
//# sourceMappingURL=content.mjs.map