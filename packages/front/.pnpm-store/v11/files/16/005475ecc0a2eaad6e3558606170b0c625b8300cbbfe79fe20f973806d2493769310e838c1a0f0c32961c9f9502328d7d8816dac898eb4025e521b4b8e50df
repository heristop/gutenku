import type { OpenAI } from "../client.mjs";
import type { CredentialedWebSocketOptions } from "./ws.mjs";
/** Per-connection credential snapshots shared by Node WebSocket bindings. */
export declare class WebSocketCredentials {
    private readonly connectionName;
    constructor(connectionName: string);
    private initialAuthUsedAPIKey;
    private initialAPIKey;
    private prepared;
    get preparedAPIKey(): string | null | undefined;
    trackInitialHeaders(client: OpenAI, headers: Record<string, string>, hasSocket: () => boolean): void;
    usesAPIKey(client: OpenAI, headers: Record<string, string>): boolean;
    build<Options extends CredentialedWebSocketOptions>(client: OpenAI, authHeaders: Record<string, string>, options: Options | null | undefined, initialAuthUsedAPIKey?: boolean): {
        headers: {
            [k: string]: string;
        };
        followRedirects: boolean;
    } & {
        headers: {
            [k: string]: string;
        };
    };
    prepare<Socket, Options extends CredentialedWebSocketOptions>(client: OpenAI, socketOptions: Options | null | undefined, authHeaders: (apiKey?: string | null) => Record<string, string>, createSocket: (url: URL, headers: Record<string, string>) => Socket): Promise<(url: URL) => Socket>;
}
//# sourceMappingURL=ws-credentials.d.mts.map