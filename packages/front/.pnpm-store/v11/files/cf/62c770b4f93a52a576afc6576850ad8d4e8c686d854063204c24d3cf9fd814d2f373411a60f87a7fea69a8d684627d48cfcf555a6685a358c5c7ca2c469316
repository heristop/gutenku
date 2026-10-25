import { assertValidBedrockBearerCredential, brand_privateBedrockClient } from "./bedrock.mjs";
// Only the key crosses module formats: the context belongs to each participating client.
const realtimeCacheContext = Symbol.for('openai.realtimeAPIKeyCacheContext');
let cacheContext;
/** Installs the Node transport's invocation context without loading Node in the base client. @internal */
export function setRealtimeAPIKeyCacheContext(context) {
    cacheContext = context;
}
/** Reserves a deferred commit when the base hook is entered for this invocation. @internal */
export function getDeferredRealtimeAPIKeyCache(client) {
    const deferred = client[realtimeCacheContext]?.getStore();
    return deferred?.client === client ? deferred : undefined;
}
/** Applies the Bedrock getter's validation when a captured credential does not enter the cache. @internal */
export function validateCapturedAPIKey(client, credential) {
    if (credential !== null && brand_privateBedrockClient in client) {
        assertValidBedrockBearerCredential(credential);
    }
    return credential;
}
/** Selects a captured credential without treating an explicit null as absent. @internal */
export function getRealtimeAPIKey(client, captured) {
    return captured === undefined ? client?.apiKey : captured;
}
/**
 * Captures the key belonging to this request or factory invocation while retaining the
 * existing boolean credential-hook contract. Legacy overrides that do not
 * capture a key keep their shared-property behavior and remain responsible for
 * synchronizing concurrent credential updates.
 * @internal
 */
export async function resolveRealtimeAPIKey(client, deferCache = false) {
    let apiKey;
    const current = {
        client,
        commit: () => (apiKey === undefined ? client.apiKey : apiKey),
    };
    const capture = (resolved) => {
        apiKey = resolved;
    };
    const invoke = () => client._callApiKey(capture);
    const context = client[realtimeCacheContext] ?? cacheContext;
    if (deferCache && context && !client[realtimeCacheContext]) {
        Object.defineProperty(client, realtimeCacheContext, { value: context });
    }
    // An HTTP or ordinary Realtime request nested inside a WebSocket hook owns its own cache writes.
    const isProvider = await (context ? context.run(deferCache ? current : undefined, invoke) : invoke());
    return {
        apiKey: apiKey === undefined ? client.apiKey : apiKey,
        isProvider,
        commit: () => {
            const hookKey = current.providerKey !== undefined && apiKey !== undefined && apiKey !== current.providerKey
                ? validateCapturedAPIKey(client, apiKey)
                : undefined;
            const cached = current.commit();
            return hookKey === undefined ? validateCapturedAPIKey(client, cached) : hookKey;
        },
    };
}
//# sourceMappingURL=realtime-credentials.mjs.map