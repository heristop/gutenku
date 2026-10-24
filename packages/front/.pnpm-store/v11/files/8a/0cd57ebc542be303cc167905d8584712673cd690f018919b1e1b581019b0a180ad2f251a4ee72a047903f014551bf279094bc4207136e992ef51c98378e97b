import * as WS from 'ws';
import type { OpenAI } from "../../client.js";
import { EventEmitter } from "../../lib/EventEmitter.js";
import { NodeWebSocket } from "../../internal/ws-adapter-node.js";
import type { ClientEvent as RealtimeTranslationClientEvent, ServerEvent as RealtimeTranslationServerEvent } from "../../resources/realtime/translations/websocket-binding.js";
import { OpenAIRealtimeError } from "../internal-base.js";
/** An event envelope, including event types added by the service in the future. */
export interface RealtimeTranslationEvent {
    type: string;
    [key: string]: unknown;
}
/** Options for a Node.js translation session. */
export interface RealtimeTranslationConnectOptions {
    /** Translation model used to create the session. */
    model: string;
    /** Node `ws` options. Redirects are always disabled. */
    options?: (Omit<WS.ClientOptions, 'headers'> & {
        /** Case-insensitive overrides; null removes a default and undefined preserves it. */
        headers?: Record<string, string | null | undefined> | undefined;
    }) | undefined;
}
type TranslationEvents = {
    event: (event: RealtimeTranslationServerEvent | RealtimeTranslationEvent) => void;
    error: (error: OpenAIRealtimeError) => void;
} & {
    [Type in Exclude<RealtimeTranslationServerEvent['type'], 'error'>]: (event: Extract<RealtimeTranslationServerEvent, {
        type: Type;
    }>) => void;
};
/**
 * Node.js translation WebSocket. Install the optional `ws` peer dependency.
 * Wait for `socket` to open before sending. Events are never buffered or replayed.
 * Compression is off by default; set `options.perMessageDeflate` to opt in.
 */
export declare class OpenAIRealtimeTranslationWS extends EventEmitter<TranslationEvents> {
    /** Adapter exposing lifecycle events and the underlying Node socket as `platformSocket`. */
    readonly socket: NodeWebSocket;
    /** The configured endpoint and model for this connection. */
    readonly url: URL;
    /** Sends the protocol close once; use `finish` to await trailing output. */
    readonly session: {
        close: () => void;
    };
    private _inputClosed;
    private _terminalReceived;
    private _terminalDelivered;
    private _transportClosed;
    private _failure;
    private _finishPromise;
    private _resolveFinish;
    private _rejectFinish;
    private _finishTimer;
    private _closeTimer;
    private _signal;
    private constructor();
    /** Resolves the API key and starts connecting; resolves before the socket opens. */
    static create(client: OpenAI, props: RealtimeTranslationConnectOptions): Promise<OpenAIRealtimeTranslationWS>;
    /** Sends a typed event, future event envelope, or raw JSON envelope after the socket opens. */
    send(event: RealtimeTranslationClientEvent | RealtimeTranslationEvent | string): void;
    /**
     * Stops input, sends `session.close` once, and delivers all events through `session.closed`.
     * The first call owns the finite deadline and optional cancellation signal. Repeated calls
     * share its result. API error events remain observable and do not end the drain.
     * A timeout, abort, or transport failure rejects; no connection or input is replayed.
     * Resolves after terminal delivery and transport closure. The deadline includes transport
     * cleanup; a stalled close handshake is terminated and rejects the operation.
     */
    finish({ timeoutMs, signal }: {
        timeoutMs: number;
        signal?: AbortSignal | undefined;
    }): Promise<void>;
    /** Closes the transport without waiting for terminal output. Prefer `finish` for a complete session. */
    close(): void;
    private _onMessage;
    private _onError;
    private _reportError;
    private _onClose;
    private _onAbort;
    private _fail;
    private _settleFinish;
    private _closeTransport;
}
export {};
//# sourceMappingURL=ws.d.ts.map