"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRealtimeRecovery = validateRealtimeRecovery;
exports.createRealtimeRecovery = createRealtimeRecovery;
const ws_connection_controller_1 = require("./ws-connection-controller.js");
const ws_1 = require("./ws.js");
const MAX_TIMER_DELAY_MS = 2147483647;
/** Validate opt-in settings before opening a socket. */
function validateRealtimeRecovery(options, url) {
    if (options.reconnect && (url?.searchParams.has('intent') || url?.searchParams.has('call_id'))) {
        throw new Error('Automatic Realtime recovery requires a model session');
    }
    const delays = [options.reconnectInitialDelay, options.reconnectMaxDelay];
    for (const value of [options.maxReconnectAttempts, ...delays, options.maxQueueBytes]) {
        if (value !== undefined && (!Number.isSafeInteger(value) || value < 0)) {
            throw new Error('Realtime recovery limits must be nonnegative safe integers');
        }
    }
    if (delays.some((delay) => delay !== undefined && delay > MAX_TIMER_DELAY_MS)) {
        throw new Error(`Realtime reconnect delays must not exceed ${MAX_TIMER_DELAY_MS} ms`);
    }
}
/** Adapts the existing protocol controller to Realtime's explicit restoration/flush policy. */
function createRealtimeRecovery(owner, options, hooks) {
    const first = hooks.adaptSocket(owner.socket);
    let currentSocket = first;
    const controllerOwner = {
        get socket() {
            return currentSocket;
        },
        set socket(socket) {
            currentSocket = socket;
            owner.socket = socket.platformSocket;
        },
        get url() {
            return owner.url;
        },
        set url(url) {
            owner.url = url;
        },
    };
    const controller = new ws_connection_controller_1.WebSocketConnection(controllerOwner, {
        buildURL: hooks.buildURL,
        createSocket: () => first,
        prepareReconnectSocket: async () => {
            const createSocket = await hooks.prepare();
            return (url) => hooks.adaptSocket(createSocket(url));
        },
        parameters: undefined,
        isErrorEvent: () => false,
        onMessage: () => {
            /* The Realtime wrapper owns decoding and event dispatch. */
        },
        onError: hooks.onError,
        createError: (message) => new Error(message),
        subscribe: () => {
            /* Realtime exposes its existing event emitter, not the controller iterator. */
        },
        unsubscribe: () => {
            /* Realtime exposes its existing event emitter, not the controller iterator. */
        },
        emitReconnecting: hooks.onReconnecting,
        emitReconnected: hooks.onReconnected,
        emitClose: hooks.onClose,
        requeueFailed: false,
        manualQueue: true,
        lifetimeRetries: true,
        shouldReconnect: (code) => code !== 1015 && (0, ws_1.isRecoverableClose)(code) && (hooks.shouldReconnect?.(code) ?? true),
    }, {
        maxQueueSize: options.maxQueueBytes ?? 0,
        reconnect: {
            onReconnecting: () => {
                /* The boolean enables recovery without a required user callback. */
            },
            maxRetries: options.maxReconnectAttempts ?? 5,
            initialDelay: options.reconnectInitialDelay ?? 500,
            maxDelay: options.reconnectMaxDelay ?? 8000,
        },
    });
    controller.connect(() => first, owner.url);
    return controller;
}
//# sourceMappingURL=realtime-recovery.js.map