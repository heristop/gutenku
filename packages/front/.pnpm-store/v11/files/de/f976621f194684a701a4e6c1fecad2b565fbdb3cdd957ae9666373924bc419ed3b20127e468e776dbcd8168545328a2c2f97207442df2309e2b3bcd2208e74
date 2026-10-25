// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import { multipartFormRequestOptions } from "../../internal/uploads.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
function withBodyFinalization(options, finalization) {
    return { ...options, __metadata: { ...options.__metadata, ...finalization } };
}
/**
 * Turn audio into text or text into audio.
 */
export class Transcriptions extends APIResource {
    create(body, options) {
        return this._client.post('/audio/transcriptions', resolveResourceRequestOptions(options, (options) => multipartFormRequestOptions(withBodyFinalization(((request) => ({ ...request, __metadata: { model: body.model } }))({
            body,
            ...options,
            stream: body.stream ?? false,
            __security: { bearerAuth: true },
        }), { streamFromBody: true }), this._client)));
    }
}
//# sourceMappingURL=transcriptions.mjs.map