import type { OpenAI } from "../client.js";
export interface DeferredAPIKeyCache {
    client: Pick<OpenAI, 'apiKey'>;
    providerKey?: string;
    commit: () => string | null;
}
interface RealtimeAPIKeyCacheContext {
    run: <T>(cache: DeferredAPIKeyCache | undefined, operation: () => T) => T;
    getStore: () => DeferredAPIKeyCache | undefined;
}
declare const realtimeCacheContext: unique symbol;
type CredentialClient = Pick<OpenAI, 'apiKey'> & {
    [realtimeCacheContext]?: RealtimeAPIKeyCacheContext;
};
/** Installs the Node transport's invocation context without loading Node in the base client. @internal */
export declare function setRealtimeAPIKeyCacheContext(context: RealtimeAPIKeyCacheContext): void;
/** Reserves a deferred commit when the base hook is entered for this invocation. @internal */
export declare function getDeferredRealtimeAPIKeyCache(client: CredentialClient): DeferredAPIKeyCache | undefined;
/** Applies the Bedrock getter's validation when a captured credential does not enter the cache. @internal */
export declare function validateCapturedAPIKey(client: Pick<OpenAI, 'apiKey'>, credential: string | null): string | null;
/** Selects a captured credential without treating an explicit null as absent. @internal */
export declare function getRealtimeAPIKey(client: Pick<OpenAI, 'apiKey'> | undefined, captured: string | null | undefined): string | null | undefined;
/**
 * Captures the key belonging to this request or factory invocation while retaining the
 * existing boolean credential-hook contract. Legacy overrides that do not
 * capture a key keep their shared-property behavior and remain responsible for
 * synchronizing concurrent credential updates.
 * @internal
 */
export declare function resolveRealtimeAPIKey(client: CredentialClient & Pick<OpenAI, '_callApiKey'>, deferCache?: boolean): Promise<{
    apiKey: string | null;
    isProvider: boolean;
    commit: () => string | null;
}>;
export {};
//# sourceMappingURL=realtime-credentials.d.ts.map