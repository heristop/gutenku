"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Safety = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const AlertsAPI = tslib_1.__importStar(require("./alerts.js"));
const alerts_1 = require("./alerts.js");
const CasesAPI = tslib_1.__importStar(require("./cases.js"));
const cases_1 = require("./cases.js");
class Safety extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.cases = new CasesAPI.Cases(this._client);
        this.alerts = new AlertsAPI.Alerts(this._client);
    }
}
exports.Safety = Safety;
Safety.Cases = cases_1.Cases;
Safety.Alerts = alerts_1.Alerts;
//# sourceMappingURL=safety.js.map