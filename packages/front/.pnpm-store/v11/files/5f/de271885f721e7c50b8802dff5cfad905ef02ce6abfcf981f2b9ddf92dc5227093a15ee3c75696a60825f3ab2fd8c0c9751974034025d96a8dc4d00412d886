"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transcriptions = void 0;
const resource_1 = require("../../core/resource.js");
const uploads_1 = require("../../internal/uploads.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
function withBodyFinalization(options, finalization) {
    return { ...options, __metadata: { ...options.__metadata, ...finalization } };
}
/**
 * Turn audio into text or text into audio.
 */
class Transcriptions extends resource_1.APIResource {
    create(body, options) {
        return this._client.post('/audio/transcriptions', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)(withBodyFinalization(((request) => ({ ...request, __metadata: { model: body.model } }))({
            body,
            ...options,
            stream: body.stream ?? false,
            __security: { bearerAuth: true },
        }), { streamFromBody: true }), this._client)));
    }
}
exports.Transcriptions = Transcriptions;
//# sourceMappingURL=transcriptions.js.map