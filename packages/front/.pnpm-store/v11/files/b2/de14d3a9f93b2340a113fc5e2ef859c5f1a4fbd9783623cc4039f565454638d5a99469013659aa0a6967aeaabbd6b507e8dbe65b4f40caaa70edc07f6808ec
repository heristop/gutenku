import * as WS from 'ws';
import { NodeWebSocket } from "../../../internal/ws-adapter-node.mjs";
import { SidebandWSBase, type SidebandWSBaseOptions, type SidebandWSParameters } from "./ws-base.mjs";
import { OpenAI } from "../../../client.mjs";
export type { WebSocketStreamOptions } from "../../../internal/ws.mjs";
export type { SidebandWSParameters, SidebandWSReconnectOptions } from "./ws-base.mjs";
/**
 * Native Node WebSocket options.
 *
 * `maxPayload` defaults to 0 (unlimited). Set a byte limit supported by `ws` to cap incoming messages.
 * `perMessageDeflate` defaults to false, including with a finite payload limit.
 * Set it to true or a `ws` configuration object to enable compression.
 */
export interface SidebandWSClientOptions extends WS.ClientOptions, SidebandWSBaseOptions {
    /** Basic authentication forwarded by the Node `ws` transport. */
    auth?: string;
}
export declare class SidebandWS extends SidebandWSBase<NodeWebSocket> {
    private _wsOptions;
    private _credentials;
    constructor(client: OpenAI, parameters: SidebandWSParameters, options?: SidebandWSClientOptions | null | undefined);
    protected _authHeaders(apiKey?: string | null): Record<string, string>;
    /**
     * Whether credentials passed to the Node transport use the SDK key.
     * The SDK recognizes its key, including copies and additions in credential headers.
     * Override and return true if your socket hook signs or otherwise irreversibly transforms it.
     * Explicit caller options and header removals still take precedence on reconnect.
     */
    protected _usesSDKAPIKey(authHeaders: Record<string, string>): boolean;
    protected _createSocket(url: URL, authHeaders: Record<string, string>): NodeWebSocket;
    protected _prepareReconnectSocket(): Promise<(url: URL) => NodeWebSocket>;
}
//# sourceMappingURL=ws.d.mts.map