import type { WebSocketLike } from "./ws-adapter.js";
import type { RawWebSocketData, SendQueue } from "./ws.js";
interface SocketOwner {
    socket: WebSocketLike;
}
type OnError = (message: string, cause?: unknown) => void;
/** Sends or queues an application event using the existing connection state. */
export declare function sendWebSocketEvent<T>(owner: SocketOwner, event: T, queue: SendQueue<T>, isReconnecting: () => boolean, onError: OnError): void;
/** Sends or snapshots a raw frame using the same admission rules as application events. */
export declare function sendRawWebSocketData<T>(owner: SocketOwner, data: RawWebSocketData, queue: SendQueue<T>, isReconnecting: () => boolean, onError: OnError): void;
/** Flushes queued frames with the caller's existing failed-send policy. */
export declare function flushWebSocketSendQueue<T>(owner: SocketOwner, queue: SendQueue<T>, onError: OnError, options?: {
    requeueFailed?: boolean;
}): void;
/** Resolves when the socket opens, or rejects if it errors or closes first. */
export declare function waitForWebSocketOpen(socket: WebSocketLike): Promise<void>;
export {};
//# sourceMappingURL=ws-connection.d.ts.map