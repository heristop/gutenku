// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
var _ResponsesWSBase_instances, _ResponsesWSBase_connection, _ResponsesWSBase_onMessage;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../internal/tslib.mjs";
import { ResponsesEmitter, WebSocketError, buildURL } from "./internal-base.mjs";
import { WebSocketConnection } from "../../internal/ws-connection-controller.mjs";
import { recordWebSocketError, rawByteLength, } from "../../internal/ws.mjs";
const webSocketEventPayloads = new WeakMap();
const webSocketEventBytes = new WeakMap();
/** Uses immutable wire size, or JSON accounting for a custom emitter. @internal */
export function getWebSocketEventBytes(event) {
    return webSocketEventBytes.get(event) ?? rawByteLength(JSON.stringify(event));
}
/** Original JSON, available only during synchronous event notification.
 * @internal
 */
export function getWebSocketEventPayload(event) {
    return webSocketEventPayloads.get(event);
}
export class ResponsesWSBase extends ResponsesEmitter {
    constructor(client, options) {
        super();
        _ResponsesWSBase_instances.add(this);
        _ResponsesWSBase_connection.set(this, void 0);
        this._client = client;
        this._parameters = undefined;
        const owner = this;
        __classPrivateFieldSet(this, _ResponsesWSBase_connection, new WebSocketConnection(this, {
            buildURL: () => buildURL(this._client, this._parameters ?? {}),
            createSocket: (url) => this._createSocket(url, this._authHeaders()),
            get parameters() {
                return owner._parameters;
            },
            set parameters(parameters) {
                owner._parameters = parameters;
            },
            isErrorEvent: (event) => event.type === 'error',
            onMessage: (data, isBinary) => __classPrivateFieldGet(this, _ResponsesWSBase_instances, "m", _ResponsesWSBase_onMessage).call(this, data, isBinary),
            onError: (message, cause) => this._onError(null, message, cause),
            createError: (message) => new WebSocketError(message, null),
            subscribe: (onEvent, onRaw, onError) => {
                this.on('event', onEvent);
                this.on('raw', onRaw);
                this.on('error', onError);
            },
            unsubscribe: (onEvent, onRaw, onError) => {
                this.off('event', onEvent);
                this.off('raw', onRaw);
                this.off('error', onError);
            },
            emitReconnecting: (event) => this._emit('reconnecting', event),
            emitReconnected: () => this._emit('reconnected'),
            emitClose: (code, reason, unsent) => this._emit('close', code, reason, unsent),
            onSocketError: recordWebSocketError,
            prepareReconnectSocket: () => this._prepareReconnectSocket(),
        }, options), "f");
    }
    /** Establishes the initial WebSocket connection. */
    _connectInitial() {
        this.url = buildURL(this._client, {});
        this.socket = __classPrivateFieldGet(this, _ResponsesWSBase_connection, "f").connect();
    }
    send(event) {
        __classPrivateFieldGet(this, _ResponsesWSBase_connection, "f").send(event);
    }
    sendRaw(data) {
        __classPrivateFieldGet(this, _ResponsesWSBase_connection, "f").sendRaw(data);
    }
    close(props) {
        __classPrivateFieldGet(this, _ResponsesWSBase_connection, "f").close(props);
    }
    /**
     * Returns an async iterator over WebSocket lifecycle and message events,
     * providing an alternative to the event-based `.on()` API.
     * The iterator will exit if the socket closes but exiting the iterator
     * does not close the socket.
     *
     * Pass `maxBufferedEvents` to limit queued records for this iterator, including
     * lifecycle events. Overflow discards its backlog and rejects `next()` with a
     * WebSocketError; the shared socket and other iterators remain active.
     * Omitted means unlimited. This is an event-count limit, not a byte limit.
     *
     * @example
     * ```ts
     * for await (const event of client.stream()) {
     *   switch (event.type) {
     *     case 'message':
     *       console.log('received:', event.message);
     *       break;
     *     case 'error':
     *       console.error(event.error);
     *       break;
     *     case 'close':
     *       console.log('connection closed');
     *       break;
     *   }
     * }
     * ```
     */
    stream(options) {
        return options === undefined ? this[Symbol.asyncIterator]() : this[Symbol.asyncIterator](options);
    }
    [(_ResponsesWSBase_connection = new WeakMap(), _ResponsesWSBase_instances = new WeakSet(), Symbol.asyncIterator)](options) {
        return __classPrivateFieldGet(this, _ResponsesWSBase_connection, "f").iterate(options);
    }
    _prepareReconnectSocket() {
        const authHeaders = this._authHeaders();
        return Promise.resolve((url) => this._createSocket(url, authHeaders));
    }
    _authHeaders(apiKey = this._client.apiKey) {
        return typeof apiKey === 'string' && apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    }
}
_ResponsesWSBase_onMessage = function _ResponsesWSBase_onMessage(data, isBinary) {
    if (isBinary) {
        this._emit('raw', data);
        return;
    }
    // Coerce to string in case the adapter delivers a typed-array for text frames.
    const text = typeof data === 'string' ? data : String(data);
    let event;
    try {
        event = JSON.parse(text);
    }
    catch {
        this._emit('raw', data);
        return;
    }
    if (event === null ||
        typeof event !== 'object' ||
        Array.isArray(event) ||
        !Object.prototype.hasOwnProperty.call(event, 'type') ||
        typeof event.type !== 'string') {
        this._onError(null, 'received invalid WebSocket event: expected an object with an own string type', undefined);
        return;
    }
    const eventType = event.type;
    const errorEvent = event.type === 'error' ? event : undefined;
    const reservedEventType = eventType === 'raw' ||
        eventType === 'close' ||
        eventType === 'event' ||
        eventType === 'reconnecting' ||
        eventType === 'reconnected' ||
        eventType === 'open' ||
        eventType === 'error';
    if (reservedEventType && eventType !== 'error') {
        this._onError(null, 'received reserved WebSocket event type', undefined);
        return;
    }
    webSocketEventBytes.set(event, rawByteLength(data));
    webSocketEventPayloads.set(event, text);
    try {
        this._emit('event', event);
    }
    finally {
        webSocketEventPayloads.delete(event);
    }
    if (errorEvent) {
        this._onError(errorEvent);
    }
    else {
        // @ts-ignore TS isn't smart enough to get the relationship right here
        this._emit(eventType, event);
    }
};
//# sourceMappingURL=ws-base.mjs.map