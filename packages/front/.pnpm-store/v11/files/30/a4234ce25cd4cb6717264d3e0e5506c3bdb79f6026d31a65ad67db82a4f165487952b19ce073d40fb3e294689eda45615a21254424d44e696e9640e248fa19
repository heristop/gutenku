"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
var _SidebandWSBase_instances, _SidebandWSBase_connection, _SidebandWSBase_onMessage;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebandWSBase = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const internal_base_1 = require("./internal-base.js");
const ws_connection_controller_1 = require("../../../internal/ws-connection-controller.js");
class SidebandWSBase extends internal_base_1.SidebandEmitter {
    constructor(client, parameters, options) {
        super();
        _SidebandWSBase_instances.add(this);
        _SidebandWSBase_connection.set(this, void 0);
        this._client = client;
        this._parameters = parameters ?? undefined;
        const owner = this;
        tslib_1.__classPrivateFieldSet(this, _SidebandWSBase_connection, new ws_connection_controller_1.WebSocketConnection(this, {
            buildURL: () => (0, internal_base_1.buildURL)(this._client, this._parameters ?? {}),
            createSocket: (url) => this._createSocket(url, this._authHeaders()),
            get parameters() {
                return owner._parameters;
            },
            set parameters(parameters) {
                owner._parameters = parameters;
            },
            isErrorEvent: (event) => event.type === 'error',
            onMessage: (data, isBinary) => tslib_1.__classPrivateFieldGet(this, _SidebandWSBase_instances, "m", _SidebandWSBase_onMessage).call(this, data, isBinary),
            onError: (message, cause) => this._onError(null, message, cause),
            createError: (message) => new internal_base_1.WebSocketError(message, null),
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
            requeueFailed: false,
            prepareReconnectSocket: () => this._prepareReconnectSocket(),
        }, options), "f");
    }
    /** Establishes the initial WebSocket connection. */
    _connectInitial() {
        this.url = (0, internal_base_1.buildURL)(this._client, this._parameters ?? {});
        this.socket = tslib_1.__classPrivateFieldGet(this, _SidebandWSBase_connection, "f").connect();
    }
    send(event) {
        tslib_1.__classPrivateFieldGet(this, _SidebandWSBase_connection, "f").send(event);
    }
    sendRaw(data) {
        tslib_1.__classPrivateFieldGet(this, _SidebandWSBase_connection, "f").sendRaw(data);
    }
    close(props) {
        tslib_1.__classPrivateFieldGet(this, _SidebandWSBase_connection, "f").close(props);
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
    [(_SidebandWSBase_connection = new WeakMap(), _SidebandWSBase_instances = new WeakSet(), Symbol.asyncIterator)](options) {
        return tslib_1.__classPrivateFieldGet(this, _SidebandWSBase_connection, "f").iterate(options);
    }
    _prepareReconnectSocket() {
        const authHeaders = this._authHeaders();
        return Promise.resolve((url) => this._createSocket(url, authHeaders));
    }
    _authHeaders(apiKey = this._client.apiKey) {
        if (typeof apiKey !== 'string' || !apiKey)
            return {};
        if (apiKey) {
            return { Authorization: `Bearer ${apiKey}` };
        }
        return {};
    }
}
exports.SidebandWSBase = SidebandWSBase;
_SidebandWSBase_onMessage = function _SidebandWSBase_onMessage(data, isBinary) {
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
    this._emit('event', event);
    if (event.type === 'error') {
        this._onError(event);
    }
    else {
        // @ts-ignore TS isn't smart enough to get the relationship right here
        this._emit(event.type, event);
    }
};
//# sourceMappingURL=ws-base.js.map