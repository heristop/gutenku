"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translations = void 0;
const resource_1 = require("../../core/resource.js");
const uploads_1 = require("../../internal/uploads.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
/**
 * Turn audio into text or text into audio.
 */
class Translations extends resource_1.APIResource {
    create(body, options) {
        return this._client.post('/audio/translations', resolveResourceRequestOptions(options, (options) => (0, uploads_1.multipartFormRequestOptions)(((request) => ({ ...request, __metadata: { model: body.model } }))({
            body,
            ...options,
            __security: { bearerAuth: true },
        }), this._client)));
    }
}
exports.Translations = Translations;
//# sourceMappingURL=translations.js.map