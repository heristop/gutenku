import { WebSocketConnection } from "./ws-connection-controller.mjs";
import type { WebSocketLike } from "./ws-adapter.mjs";
import type { ReconnectingEvent, UnsentMessage } from "./ws.mjs";
/** Optional transport recovery. Reconnecting creates a new session; it does not restore server state. */
export interface RealtimeRecoveryOptions {
    /** Enable automatic transport recovery. Default: false. */
    reconnect?: boolean | undefined;
    /** Additional attempts over the connection's entire lifetime. Default: 5. */
    maxReconnectAttempts?: number | undefined;
    /** Initial retry delay in milliseconds. Default: 500. */
    reconnectInitialDelay?: number | undefined;
    /** Maximum retry delay in milliseconds. Default: 8000. */
    reconnectMaxDelay?: number | undefined;
    /** Bytes retained while disconnected. Default: 0 (reject instead of retaining). */
    maxQueueBytes?: number | undefined;
}
/** Validate opt-in settings before opening a socket. */
export declare function validateRealtimeRecovery(options: RealtimeRecoveryOptions, url?: URL): void;
/** Adapts the existing protocol controller to Realtime's explicit restoration/flush policy. */
export declare function createRealtimeRecovery<TSocket extends WebSocketLike & {
    readonly platformSocket: unknown;
}, TEvent>(owner: {
    socket: TSocket['platformSocket'];
    url: URL;
}, options: RealtimeRecoveryOptions, hooks: {
    buildURL: () => URL;
    adaptSocket: (socket: TSocket['platformSocket']) => TSocket;
    prepare: () => Promise<(url: URL) => TSocket['platformSocket']>;
    onError: (message: string, cause?: unknown) => void;
    onReconnecting: (event: ReconnectingEvent) => void;
    onReconnected: () => void;
    shouldReconnect?: (code: number) => boolean;
    onClose: (code: number, reason: string, unsent: UnsentMessage<TEvent>[]) => void;
}): WebSocketConnection<TSocket, TEvent, never, Error>;
//# sourceMappingURL=realtime-recovery.d.mts.map