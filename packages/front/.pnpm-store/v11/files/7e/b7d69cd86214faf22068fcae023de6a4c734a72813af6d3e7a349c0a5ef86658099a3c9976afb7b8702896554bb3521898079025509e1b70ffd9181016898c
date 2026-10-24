"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decisions = void 0;
const resource_1 = require("../core/resource.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
class Decisions extends resource_1.APIResource {
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
exports.Decisions = Decisions;
//# sourceMappingURL=decisions.js.map