"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Images = void 0;
const resource_1 = require("../core/resource.js");
const uploads_1 = require("../internal/uploads.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
function withBodyFinalization(options, finalization) {
    return { ...options, __metadata: { ...options.__metadata, ...finalization } };
}
/**
 * Given a prompt and/or an input image, the model will generate a new image.
 */
class Images extends resource_1.APIResource {
    /**
     * This endpoint is retired and no longer available. Use the image edits endpoint
     * with a GPT Image model and a prompt to create a variation of an image. The
     * request and response schemas below describe the legacy contract.
     *
     * @deprecated
     */
    createVariation(body, options) {
        return this._client.post('/images/variations', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)({ body, ...options, __security: { bearerAuth: true } }, this._client)));
    }
    edit(body, options) {
        return this._client.post('/images/edits', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)(withBodyFinalization(((requestOptions) => ({
            ...requestOptions,
            body: Object.fromEntries(Object.entries(requestOptions.body ?? {}).map(([key, value]) => [
                key,
                key === 'safety_identifier' && value === null ? undefined : value,
            ])),
        }))({
            body,
            ...options,
            stream: body.stream ?? false,
            __metadata: { ...options?.__metadata, ...(body.model == null ? {} : { model: body.model }) },
            __security: { bearerAuth: true },
        }), { streamFromBody: true }), this._client)));
    }
    generate(body, options) {
        return this._client.post('/images/generations', resolveResourceRequestOptions(options, (options) => withBodyFinalization({ body, ...options, stream: body.stream ?? false, __security: { bearerAuth: true } }, { streamFromBody: true })));
    }
}
exports.Images = Images;
//# sourceMappingURL=images.js.map