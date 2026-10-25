import { OpenAIError } from "../core/error.mjs";
import { ReadyState } from "./ws-adapter.mjs";
import { flattenRawData } from "./ws.mjs";
/** Sends or queues an application event using the existing connection state. */
export function sendWebSocketEvent(owner, event, queue, isReconnecting, onError) {
    if (!owner.socket) {
        throw new OpenAIError('Internal error: failed to initialize socket. Please report this issue.');
    }
    if (isReconnecting() || owner.socket.readyState === ReadyState.CONNECTING) {
        if (!queue.enqueue(event)) {
            onError('send queue is full, message discarded');
        }
        return;
    }
    if (owner.socket.readyState !== ReadyState.OPEN) {
        onError('cannot send on a closed WebSocket');
        return;
    }
    try {
        owner.socket.send(JSON.stringify(event));
    }
    catch (error) {
        onError('could not send data', error);
    }
}
/** Sends or snapshots a raw frame using the same admission rules as application events. */
export function sendRawWebSocketData(owner, data, queue, isReconnecting, onError) {
    if (!owner.socket) {
        throw new OpenAIError('Internal error: failed to initialize socket. Please report this issue.');
    }
    if (isReconnecting() || owner.socket.readyState === ReadyState.CONNECTING) {
        if (!queue.enqueueRaw(data)) {
            onError('send queue is full, message discarded');
        }
        return;
    }
    if (owner.socket.readyState !== ReadyState.OPEN) {
        onError('cannot send on a closed WebSocket');
        return;
    }
    try {
        owner.socket.send(flattenRawData(data));
    }
    catch (error) {
        onError('could not send data', error);
    }
}
/** Flushes queued frames with the caller's existing failed-send policy. */
export function flushWebSocketSendQueue(owner, queue, onError, options) {
    if (!owner.socket) {
        throw new OpenAIError('Internal error: failed to initialize socket. Please report this issue.');
    }
    try {
        queue.flush((data) => owner.socket.send(flattenRawData(data)), options);
    }
    catch (error) {
        onError('could not send queued data', error);
    }
}
/** Resolves when the socket opens, or rejects if it errors or closes first. */
export function waitForWebSocketOpen(socket) {
    // oxlint-disable-next-line promise/avoid-new -- Convert the existing socket event callbacks into the connection attempt's promise.
    return new Promise((resolve, reject) => {
        /* oxlint-disable eslint/no-use-before-define -- All mutually dependent callbacks are initialized before socket listeners are registered. */
        const cleanup = () => {
            socket.off('open', onOpen);
            socket.off('error', onError);
            socket.off('close', onFail);
        };
        /* oxlint-enable eslint/no-use-before-define */
        const onOpen = () => {
            cleanup();
            resolve();
        };
        const onError = (error) => {
            cleanup();
            reject(error);
        };
        const onFail = () => {
            cleanup();
            reject(new Error('socket closed before open'));
        };
        socket.once('open', onOpen);
        socket.once('error', onError);
        socket.once('close', onFail);
    });
}
//# sourceMappingURL=ws-connection.mjs.map