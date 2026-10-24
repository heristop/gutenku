"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cases = void 0;
const resource_1 = require("../../core/resource.js");
const path_1 = require("../../internal/utils/path.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
class Cases extends resource_1.APIResource {
    /**
     * Get a safety case by ID.
     */
    retrieve(id, options) {
        return this._client.get((0, path_1.path) `/safety/cases/${id}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
}
exports.Cases = Cases;
//# sourceMappingURL=cases.js.map