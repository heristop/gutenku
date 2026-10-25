// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { multipartFormRequestOptions } from "../../internal/uploads.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
/**
 * Turn audio into text or text into audio.
 */
export class Translations extends APIResource {
    create(body, options) {
        return this._client.post('/audio/translations', resolveResourceRequestOptions(options, (options) => multipartFormRequestOptions(((request) => ({ ...request, __metadata: { model: body.model } }))({
            body,
            ...options,
            __security: { bearerAuth: true },
        }), this._client)));
    }
}
//# sourceMappingURL=translations.mjs.map