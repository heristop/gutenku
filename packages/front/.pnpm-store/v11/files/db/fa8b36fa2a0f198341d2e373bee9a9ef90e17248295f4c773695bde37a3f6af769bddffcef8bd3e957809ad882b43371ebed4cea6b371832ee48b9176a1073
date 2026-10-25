// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../core/resource.mjs";
import * as CallsAPI from "./calls.mjs";
import { Calls } from "./calls.mjs";
import * as ClientSecretsAPI from "./client-secrets.mjs";
import { ClientSecrets, } from "./client-secrets.mjs";
import * as TranslationsAPI from "./translations/translations.mjs";
import { Translations } from "./translations/translations.mjs";
export class Realtime extends APIResource {
    constructor() {
        super(...arguments);
        this.clientSecrets = new ClientSecretsAPI.ClientSecrets(this._client);
        this.calls = new CallsAPI.Calls(this._client);
        this.translations = new TranslationsAPI.Translations(this._client);
    }
}
Realtime.ClientSecrets = ClientSecrets;
Realtime.Calls = Calls;
Realtime.Translations = Translations;
//# sourceMappingURL=realtime.mjs.map