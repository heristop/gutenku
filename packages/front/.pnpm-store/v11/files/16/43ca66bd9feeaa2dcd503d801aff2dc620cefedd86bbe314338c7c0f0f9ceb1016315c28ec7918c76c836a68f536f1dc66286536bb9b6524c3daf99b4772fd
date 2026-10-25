// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../core/resource.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class Decisions extends APIResource {
    /**
     * Use this endpoint to quickly answer classification or scoring questions about
     * some input. You can ask multiple questions in one request.
     */
    create(body, options) {
        return this._client.post('/decisions', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
}
//# sourceMappingURL=decisions.mjs.map