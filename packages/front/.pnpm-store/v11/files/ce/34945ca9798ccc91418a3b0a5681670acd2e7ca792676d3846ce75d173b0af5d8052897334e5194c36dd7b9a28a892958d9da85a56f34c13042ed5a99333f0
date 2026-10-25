"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Realtime = void 0;
const tslib_1 = require("../../internal/tslib.js");
const resource_1 = require("../../core/resource.js");
const CallsAPI = tslib_1.__importStar(require("./calls.js"));
const calls_1 = require("./calls.js");
const ClientSecretsAPI = tslib_1.__importStar(require("./client-secrets.js"));
const client_secrets_1 = require("./client-secrets.js");
const TranslationsAPI = tslib_1.__importStar(require("./translations/translations.js"));
const translations_1 = require("./translations/translations.js");
class Realtime extends resource_1.APIResource {
    constructor() {
        super(...arguments);
        this.clientSecrets = new ClientSecretsAPI.ClientSecrets(this._client);
        this.calls = new CallsAPI.Calls(this._client);
        this.translations = new TranslationsAPI.Translations(this._client);
    }
}
exports.Realtime = Realtime;
Realtime.ClientSecrets = client_secrets_1.ClientSecrets;
Realtime.Calls = calls_1.Calls;
Realtime.Translations = translations_1.Translations;
//# sourceMappingURL=realtime.js.map