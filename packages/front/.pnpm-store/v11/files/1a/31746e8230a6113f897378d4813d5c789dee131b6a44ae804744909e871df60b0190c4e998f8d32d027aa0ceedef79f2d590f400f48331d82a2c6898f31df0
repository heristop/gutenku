// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as AlertsAPI from "./alerts.mjs";
import { Alerts } from "./alerts.mjs";
import * as CasesAPI from "./cases.mjs";
import { Cases } from "./cases.mjs";
export class Safety extends APIResource {
    constructor() {
        super(...arguments);
        this.cases = new CasesAPI.Cases(this._client);
        this.alerts = new AlertsAPI.Alerts(this._client);
    }
}
Safety.Cases = Cases;
Safety.Alerts = Alerts;
//# sourceMappingURL=safety.mjs.map