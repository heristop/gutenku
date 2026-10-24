import type { Provider } from "../internal/provider.mjs";
/** Configure Google's Responses endpoint on the ordinary OpenAI client. */
export interface VertexOptions {
    /** Defaults to GOOGLE_CLOUD_PROJECT. */
    project?: string | undefined;
    /** Defaults to GOOGLE_CLOUD_LOCATION. */
    location?: string | undefined;
    /** Complete API root preceding /responses; overrides project and location. */
    baseURL?: string | undefined;
    /** Invoked before every attempt, including retries. ADC is used when absent. */
    tokenProvider?: (() => string | Promise<string>) | undefined;
    /** Explicit Google auth client; otherwise uses ADC. Cannot be combined with tokenProvider. */
    credentials?: GoogleClient | undefined;
}
/** An authorized Google client owns access-token expiry and refreshing. */
export interface GoogleClient {
    getRequestHeaders: (url?: string) => Promise<Headers | Record<string, string>>;
}
/** Vertex provider with lazy optional Google ADC or application-managed refresh. */
export declare function vertex(options?: VertexOptions): Provider;
//# sourceMappingURL=vertex.d.mts.map