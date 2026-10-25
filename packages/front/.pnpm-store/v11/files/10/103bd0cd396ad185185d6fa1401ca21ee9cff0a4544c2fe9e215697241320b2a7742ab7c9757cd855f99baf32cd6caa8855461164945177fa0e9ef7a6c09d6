"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerts = void 0;
const resource_1 = require("../../core/resource.js");
const path_1 = require("../../internal/utils/path.js");
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
class Alerts extends resource_1.APIResource {
    /**
     * Get a safety alert belonging to the authenticated API project.
     */
    retrieve(id, options) {
        return this._client.get((0, path_1.path) `/safety/alerts/${id}`, resolveResourceRequestOptions(options, (options) => ({ ...options, __security: { bearerAuth: true } })));
    }
}
exports.Alerts = Alerts;
//# sourceMappingURL=alerts.js.map