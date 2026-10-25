// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../core/resource.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class ClientSecrets extends APIResource {
    /**
     * Create a Realtime translation client secret with an associated translation
     * session configuration.
     *
     * Client secrets are short-lived tokens that can be passed to a client app, such
     * as a web frontend or mobile client, which grants access to the Realtime
     * Translation API without leaking your main API key. You can configure a custom
     * TTL for each client secret.
     *
     * Returns the created client secret and the effective translation session object.
     * The client secret is a string that looks like `ek_1234`.
     *
     * @example
     * ```ts
     * const realtimeTranslationClientSecretCreateResponse =
     *   await client.realtime.translations.clientSecrets.create(
     *     { session: { model: 'model' } },
     *   );
     * ```
     */
    create(body, options) {
        return this._client.post('/realtime/translations/client_secrets', resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { bearerAuth: true },
        })));
    }
}
//# sourceMappingURL=client-secrets.mjs.map