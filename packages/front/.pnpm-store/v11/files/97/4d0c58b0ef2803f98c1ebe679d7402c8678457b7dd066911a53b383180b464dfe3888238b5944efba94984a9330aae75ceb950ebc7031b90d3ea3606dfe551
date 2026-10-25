"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketConnection = void 0;
const error_1 = require("../core/error.js");
const EventEmitter_1 = require("../core/EventEmitter.js");
const sleep_1 = require("./utils/sleep.js");
const ws_adapter_1 = require("./ws-adapter.js");
const ws_1 = require("./ws.js");
const ws_connection_1 = require("./ws-connection.js");
/** Shared connection lifecycle; public fields and event listeners remain on the binding. */
class WebSocketConnection {
    constructor(owner, hooks, options) {
        this._isReconnecting = false;
        this._intentionallyClosed = false;
        this._closeCode = 1000;
        this._closeReason = 'OK';
        this._lastCloseCode = 1006;
        this._lastCloseReason = '';
        // Necessary to keep the public event interface clean while we manage reconnecting
        this._internalEvents = new EventEmitter_1.InternalEventEmitter();
        this._retryCount = 0;
        this._permanentClosed = false;
        this._backoff = new AbortController();
        this._owner = owner;
        this._hooks = hooks;
        this._reconnectOptions = options?.reconnect ?? null;
        this._sendQueue = new ws_1.SendQueue(options?.maxQueueSize ?? (hooks.manualQueue ? 0 : undefined), !hooks.manualQueue);
    }
    /** Whether the logical connection has emitted its terminal close. */
    get isClosed() {
        return this._permanentClosed;
    }
    takePending() {
        return this._sendQueue.drain();
    }
    flushPending() {
        if (this._intentionallyClosed ||
            this._permanentClosed ||
            this._isReconnecting ||
            this._owner.socket.readyState !== ws_adapter_1.ReadyState.OPEN) {
            this._hooks.onError('cannot flush before the WebSocket is open');
            return;
        }
        this._flushSendQueue(true);
    }
    send(event) {
        if (this._hooks.manualQueue) {
            if (this._intentionallyClosed || this._permanentClosed) {
                this._hooks.onError('cannot send on a closed WebSocket');
                return;
            }
            if (this._isReconnecting) {
                let accepted;
                try {
                    accepted = this._sendQueue.enqueue(event);
                }
                catch (error) {
                    this._hooks.onError('could not send data', error);
                    return;
                }
                if (!accepted) {
                    this._hooks.onError('send queue is full, message discarded');
                }
                return;
            }
            if (this._owner.socket.readyState === ws_adapter_1.ReadyState.CONNECTING) {
                this._hooks.onError('cannot send before the WebSocket is open');
                return;
            }
        }
        (0, ws_connection_1.sendWebSocketEvent)(this._owner, event, this._sendQueue, () => this._isReconnecting, (message, cause) => this._hooks.onError(message, cause));
    }
    sendRaw(data) {
        (0, ws_connection_1.sendRawWebSocketData)(this._owner, data, this._sendQueue, () => this._isReconnecting, (message, cause) => this._hooks.onError(message, cause));
    }
    close(props) {
        if (!this._owner.socket) {
            throw new error_1.OpenAIError('Internal error: failed to initialize socket. Please report this issue.');
        }
        this._intentionallyClosed = true;
        this._closeCode = props?.code ?? 1000;
        this._closeReason = props?.reason ?? 'OK';
        this._cancelRefresh?.();
        this._backoff.abort();
        try {
            this._owner.socket.close(this._closeCode, this._closeReason);
        }
        catch (error) {
            try {
                this._hooks.onError('could not close the connection', error);
            }
            finally {
                if (this._hooks.manualQueue) {
                    try {
                        const { socket } = this._owner;
                        if (socket.terminate) {
                            socket.terminate();
                        }
                        else {
                            socket.close();
                        }
                    }
                    finally {
                        this._emitPermanentClose(this._closeCode, this._closeReason);
                    }
                }
            }
        }
    }
    iterate(options) {
        if (!this._owner.socket) {
            throw new error_1.OpenAIError('Internal error: failed to initialize socket. Please report this issue.');
        }
        const maxBufferedEvents = (0, ws_1.getMaxBufferedEvents)(options);
        // Two-queue async iterator: `queue` buffers incoming messages,
        // `resolvers` buffers waiting next() calls. A push wakes the
        // oldest next(); a next() drains the oldest message.
        const queue = [];
        const resolvers = [];
        let queueHead = 0;
        let resolverHead = 0;
        let done = false;
        let failure;
        let currentSocket = this._owner.socket;
        const wakeResolver = () => {
            if (resolverHead >= resolvers.length) {
                return;
            }
            const resolver = resolvers[resolverHead];
            resolvers[resolverHead] = undefined;
            resolverHead += 1;
            if (resolverHead >= 64 && resolverHead * 2 >= resolvers.length) {
                resolvers.splice(0, resolverHead);
                resolverHead = 0;
            }
            resolver?.();
        };
        /* oxlint-disable eslint/no-use-before-define -- These mutually dependent callbacks are initialized before any listener is registered. */
        const push = (msg) => {
            if (done) {
                return;
            }
            if (maxBufferedEvents !== undefined && queue.length - queueHead >= maxBufferedEvents) {
                failure = this._hooks.createError(`WebSocket stream exceeded maxBufferedEvents (${maxBufferedEvents})`);
                done = true;
                queue.length = 0;
                queueHead = 0;
                cleanup();
                flushResolvers();
                return;
            }
            queue.push(msg);
            wakeResolver();
        };
        const onEvent = (event) => {
            // Protocol errors are handled by onEmitterError.
            if (this._hooks.isErrorEvent(event)) {
                return;
            }
            push({ type: 'message', message: event });
        };
        const onRaw = (data) => {
            push({ type: 'raw', data });
        };
        // All errors (API + socket) funnel through _onError → 'error' event
        const onEmitterError = (err) => {
            push({ type: 'error', error: err });
        };
        const onOpen = () => {
            push({ type: 'open' });
        };
        const onReconnecting = (evt) => {
            push({ type: 'reconnecting', reconnect: evt });
        };
        const onReconnected = () => {
            push({ type: 'reconnected' });
        };
        const flushResolvers = () => {
            while (resolverHead < resolvers.length) {
                const resolver = resolvers[resolverHead];
                resolvers[resolverHead] = undefined;
                resolverHead += 1;
                resolver?.();
            }
            resolvers.length = 0;
            resolverHead = 0;
        };
        const onClose = (code, reason, unsent) => {
            push({ type: 'close', code, reason, unsent });
            done = true;
            flushResolvers();
            cleanup();
        };
        const onSocketSwap = (_oldSocket, newSocket) => {
            if (currentSocket === newSocket) {
                return;
            }
            currentSocket.off('open', onOpen);
            newSocket.on('open', onOpen);
            currentSocket = newSocket;
        };
        const cleanup = () => {
            this._hooks.unsubscribe(onEvent, onRaw, onEmitterError);
            currentSocket.off('open', onOpen);
            this._internalEvents.off('close', onClose);
            this._internalEvents.off('socketSwap', onSocketSwap);
            this._internalEvents.off('reconnecting', onReconnecting);
            this._internalEvents.off('reconnected', onReconnected);
        };
        /* oxlint-enable eslint/no-use-before-define */
        this._hooks.subscribe(onEvent, onRaw, onEmitterError);
        this._owner.socket.on('open', onOpen);
        this._internalEvents.on('close', onClose);
        this._internalEvents.on('socketSwap', onSocketSwap);
        this._internalEvents.on('reconnecting', onReconnecting);
        this._internalEvents.on('reconnected', onReconnected);
        // Overridden registration hooks may have terminated the iterator before setup finished.
        if (done) {
            cleanup();
        }
        if (this._isReconnecting) {
            // A reconnect is already in flight. The socket may be CLOSED but the
            // instance is still alive. Emit 'reconnecting' so the iterator stays
            // open and receives the upcoming reconnected/message events.
            push({
                type: 'reconnecting',
                reconnect: { attempt: 0, maxAttempts: 0, delay: 0, closeCode: 0, parameters: undefined },
            });
        }
        else {
            switch (this._owner.socket.readyState) {
                case ws_adapter_1.ReadyState.CONNECTING: {
                    push({ type: 'connecting' });
                    break;
                }
                case ws_adapter_1.ReadyState.OPEN: {
                    push({ type: 'open' });
                    break;
                }
                case ws_adapter_1.ReadyState.CLOSING: {
                    push({ type: 'closing' });
                    break;
                }
                case ws_adapter_1.ReadyState.CLOSED: {
                    push({
                        type: 'close',
                        code: this._lastCloseCode,
                        reason: this._lastCloseReason,
                        unsent: this._sendQueue.drain(),
                    });
                    done = true;
                    cleanup();
                    break;
                }
                default: {
                    break;
                }
            }
        }
        const tryResolve = (res, reject) => {
            if (failure) {
                reject(failure);
            }
            else if (queueHead < queue.length) {
                // oxlint-disable-next-line typescript/no-non-null-assertion -- Only consumed queue slots are cleared; the length guard proves this slot is populated.
                const queued = queue[queueHead];
                queue[queueHead] = undefined;
                queueHead += 1;
                if (queueHead >= 64 && queueHead * 2 >= queue.length) {
                    queue.splice(0, queueHead);
                    queueHead = 0;
                }
                res({ value: queued, done: false });
            }
            else if (done) {
                res({ value: undefined, done: true });
            }
            else {
                return false;
            }
            return true;
        };
        const next = () => 
        // oxlint-disable-next-line promise/avoid-new -- Each next() waits for the socket callbacks to produce a record or close.
        new Promise((resolve, reject) => {
            if (tryResolve(resolve, reject)) {
                return;
            }
            resolvers.push(() => {
                tryResolve(resolve, reject);
            });
        });
        return {
            next,
            return: () => {
                done = true;
                queue.length = 0;
                queueHead = 0;
                cleanup();
                flushResolvers();
                return Promise.resolve({ value: undefined, done: true });
            },
            [Symbol.asyncIterator]() {
                return this;
            },
        };
    }
    connect(createSocket = (url) => this._hooks.createSocket(url), url = this._hooks.buildURL()) {
        this._owner.url = url;
        const socket = createSocket(this._owner.url);
        socket.on('message', (data, isBinary) => {
            if (socket === this._owner.socket) {
                this._hooks.onMessage(data, isBinary);
            }
        });
        socket.on('error', (err) => {
            if (socket !== this._owner.socket) {
                return;
            }
            this._hooks.onSocketError?.(socket, err);
            // Suppress transient errors during reconnection — the retry loop
            // already handles them and will surface a close if retries exhaust.
            if (this._isReconnecting) {
                return;
            }
            this._hooks.onError(err.message, err);
        });
        socket.on('open', () => {
            if (socket !== this._owner.socket) {
                return;
            }
            this._flushSendQueue();
        });
        socket.on('close', (code, reason) => {
            // Ignore close events from superseded sockets — a stale socket's
            // late close must not kick off a second reconnect loop.
            if (socket !== this._owner.socket) {
                return;
            }
            if (!this._intentionallyClosed && this._canReconnect(code)) {
                this._reconnect(code);
            }
            else if (!this._isReconnecting) {
                this._emitPermanentClose(code, reason);
            }
        });
        return socket;
    }
    // Reconnect is opt-in via onReconnecting so callers can pass
    // state (e.g. session IDs) into the new connection.
    _canReconnect(code) {
        if (this._intentionallyClosed || this._permanentClosed) {
            return false;
        }
        if (!this._reconnectOptions) {
            return false;
        }
        if (this._reconnectOptions.maxRetries === 0) {
            return false;
        }
        if (!this._reconnectOptions.onReconnecting) {
            return false;
        }
        return this._hooks.shouldReconnect?.(code) ?? (0, ws_1.isRecoverableClose)(code);
    }
    _reportReconnectFailure(message, cause) {
        // Preserve the legacy automatic-queue clients' reconnect error contract.
        this._hooks.onError(message, this._hooks.manualQueue ? cause : undefined);
    }
    _abortReconnect(closeCode, cause) {
        if (this._canReconnect(closeCode)) {
            return false;
        }
        this._isReconnecting = false;
        try {
            if (!this._intentionallyClosed && !this._permanentClosed) {
                this._reportReconnectFailure(`WebSocket reconnect aborted: non-recoverable close code ${closeCode}`, cause);
            }
        }
        finally {
            this._emitPermanentClose(this._intentionallyClosed ? this._closeCode : closeCode, this._intentionallyClosed ? this._closeReason : 'reconnect aborted');
        }
        return true;
    }
    _notifyReconnecting(options, initialEvent) {
        let reconnectingEvent = initialEvent;
        const { closeCode } = initialEvent;
        let overrides;
        try {
            overrides = options.onReconnecting(reconnectingEvent);
        }
        catch (error) {
            this._isReconnecting = false;
            try {
                this._hooks.onError('onReconnecting callback threw', error);
            }
            finally {
                this._emitPermanentClose(closeCode, 'onReconnecting callback threw');
            }
            return false;
        }
        if (overrides && 'abort' in overrides && overrides.abort) {
            this._isReconnecting = false;
            this._emitPermanentClose(closeCode, 'reconnect aborted by handler');
            return false;
        }
        if (overrides && 'parameters' in overrides) {
            this._hooks.parameters = overrides.parameters;
            reconnectingEvent = { ...reconnectingEvent, parameters: this._hooks.parameters };
        }
        try {
            this._hooks.emitReconnecting(reconnectingEvent);
        }
        catch (error) {
            if (this._hooks.manualQueue) {
                this._isReconnecting = false;
                try {
                    this._hooks.onError('onReconnecting callback threw', error);
                }
                finally {
                    this._emitPermanentClose(closeCode, 'onReconnecting callback threw');
                }
                return false;
            }
            try {
                this._hooks.onError('onReconnecting callback threw', error);
            }
            catch (reportingError) {
                this._isReconnecting = false;
                try {
                    this._emitPermanentClose(closeCode, 'onReconnecting callback threw');
                }
                catch {
                    // Keep the reporting failure if a later close observer also throws.
                }
                throw reportingError;
            }
        }
        this._internalEvents._emit('reconnecting', reconnectingEvent);
        return true;
    }
    _hasRetryBudget(attempt, maximum) {
        return attempt <= maximum && (!this._hooks.lifetimeRetries || this._retryCount < maximum);
    }
    _nextRetryAttempt(attempt) {
        this._retryCount += 1;
        return this._hooks.lifetimeRetries ? this._retryCount : attempt;
    }
    async _reconnect(initialCloseCode) {
        let closeCode = initialCloseCode;
        if (!this._owner.socket) {
            throw new error_1.OpenAIError('Internal error: failed to initialize socket. Please report this issue.');
        }
        if (this._isReconnecting || !this._reconnectOptions) {
            return;
        }
        this._isReconnecting = true;
        const maxRetries = this._reconnectOptions.maxRetries ?? 5;
        const initialDelay = this._reconnectOptions.initialDelay ?? 500;
        const maxDelay = this._reconnectOptions.maxDelay ?? 8000;
        let lastError;
        /* oxlint-disable eslint/no-await-in-loop -- Reconnect attempts and their credential refresh must run sequentially. */
        for (let attempt = 1; this._hasRetryBudget(attempt, maxRetries); attempt += 1) {
            const reportedAttempt = this._nextRetryAttempt(attempt);
            if (this._abortReconnect(closeCode, lastError)) {
                return;
            }
            const baseDelay = Math.min(initialDelay * 2 ** (attempt - 1), maxDelay);
            // Jitter: rand [0.75, 1.0] to spread out connection attempts without over-delaying
            const jitter = 0.75 + Math.random() * 0.25;
            const actualDelay = Math.round(baseDelay * jitter);
            const reconnectingEvent = {
                attempt: reportedAttempt,
                maxAttempts: maxRetries,
                delay: actualDelay,
                closeCode,
                parameters: this._hooks.parameters ? { ...this._hooks.parameters } : undefined,
            };
            if (!this._notifyReconnecting(this._reconnectOptions, reconnectingEvent)) {
                return;
            }
            if (this._abortReconnect(closeCode, lastError)) {
                return;
            }
            try {
                await (0, sleep_1.sleep)(actualDelay, this._backoff.signal);
            }
            catch {
                this._abortReconnect(closeCode, lastError);
                return;
            }
            if (this._abortReconnect(closeCode, lastError)) {
                return;
            }
            let closeCodePromise;
            const oldSocket = this._owner.socket;
            try {
                if (this._hooks.prepareReconnectSocket) {
                    const url = this._hooks.buildURL();
                    // oxlint-disable-next-line promise/avoid-new -- Public close cancels the pending credential refresh through this callback.
                    const canceled = new Promise((resolve) => {
                        // oxlint-disable-next-line unicorn/no-useless-undefined -- Promise<undefined> requires an explicit value in TypeScript.
                        this._cancelRefresh = () => resolve(undefined);
                    });
                    let createSocket;
                    try {
                        createSocket = await Promise.race([this._hooks.prepareReconnectSocket(), canceled]);
                    }
                    finally {
                        this._cancelRefresh = undefined;
                    }
                    if (!this._canReconnect(closeCode)) {
                        this._isReconnecting = false;
                        this._emitPermanentClose(this._closeCode, this._closeReason);
                        return;
                    }
                    this._owner.socket = this.connect(createSocket, url);
                }
                else {
                    this._owner.socket = this.connect();
                }
                // Registered synchronously after _connect() and before any
                // await so the code is captured even when ws emits 'close'
                // in the same tick as 'error' (e.g. abortHandshake).
                // oxlint-disable-next-line promise/avoid-new -- Capture close before awaiting open, including synchronous error/close pairs.
                closeCodePromise = new Promise((resolve) => {
                    this._owner.socket.once('close', resolve);
                });
                await (0, ws_connection_1.waitForWebSocketOpen)(this._owner.socket);
            }
            catch (error) {
                if (this._intentionallyClosed) {
                    // A public close observer may have thrown after lifecycle cleanup.
                    // Only emit here if the reconnect itself had not already closed.
                    if (this._isReconnecting) {
                        this._isReconnecting = false;
                        this._emitPermanentClose(this._closeCode, this._closeReason);
                    }
                    return;
                }
                lastError = error;
                if (closeCodePromise) {
                    // ws may emit 'error' before 'close', so await the code
                    // rather than reading it synchronously.
                    closeCode = await closeCodePromise;
                }
                continue;
            }
            this._isReconnecting = false;
            this._internalEvents._emit('socketSwap', oldSocket, this._owner.socket);
            this._flushSendQueue();
            try {
                this._hooks.emitReconnected();
            }
            finally {
                this._internalEvents._emit('reconnected');
            }
            return;
        }
        /* oxlint-enable eslint/no-await-in-loop */
        // All retries exhausted — surface an error so consumers can
        // distinguish retry failure from a clean close.
        this._isReconnecting = false;
        try {
            this._reportReconnectFailure(`WebSocket reconnect failed after ${maxRetries} attempts (close code: ${closeCode})`, lastError);
        }
        finally {
            this._emitPermanentClose(closeCode, `reconnect failed after ${maxRetries} attempts`);
        }
    }
    _flushSendQueue(explicit = false) {
        if (this._hooks.manualQueue && !explicit) {
            return;
        }
        (0, ws_connection_1.flushWebSocketSendQueue)(this._owner, this._sendQueue, (message, cause) => this._hooks.onError(message, cause), this._hooks.requeueFailed === undefined ? undefined : { requeueFailed: this._hooks.requeueFailed });
    }
    /**
     * Emits the public `close` event with unsent messages and the internal
     * `close` event used by the async iterator.
     */
    _emitPermanentClose(code, reason) {
        if (this._permanentClosed) {
            return;
        }
        this._permanentClosed = true;
        this._lastCloseCode = code;
        this._lastCloseReason = reason;
        const unsent = this._sendQueue.drain();
        // Internal close fires first so the async iterator is guaranteed to
        // terminate even if a public 'close' listener throws.
        this._internalEvents._emit('close', code, reason, unsent);
        this._hooks.emitClose(code, reason, unsent);
    }
}
exports.WebSocketConnection = WebSocketConnection;
//# sourceMappingURL=ws-connection-controller.js.map