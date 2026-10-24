"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRealtimeTranslationWS = void 0;
const tslib_1 = require("../../internal/tslib.js");
const WS = tslib_1.__importStar(require("ws"));
const EventEmitter_1 = require("../../lib/EventEmitter.js");
const x509_workload_identity_auth_1 = require("../../internal/auth/x509-workload-identity-auth.js");
const bedrock_1 = require("../../internal/bedrock.js");
const detect_platform_1 = require("../../internal/detect-platform.js");
const realtime_credentials_1 = require("../../internal/realtime-credentials.js");
const ws_1 = require("../../internal/ws.js");
const ws_adapter_1 = require("../../internal/ws-adapter.js");
const ws_adapter_node_1 = require("../../internal/ws-adapter-node.js");
const websocket_binding_1 = require("../../resources/realtime/translations/websocket-binding.js");
const internal_base_1 = require("../internal-base.js");
function parseEvent(data) {
    let event;
    try {
        event = JSON.parse(data);
    }
    catch {
        throw new internal_base_1.OpenAIRealtimeError('Could not parse translation WebSocket event as JSON.', null);
    }
    if (typeof event !== 'object' ||
        event === null ||
        Array.isArray(event) ||
        typeof Object.getOwnPropertyDescriptor(event, 'type')?.value !== 'string') {
        throw new internal_base_1.OpenAIRealtimeError('Translation event must be an object with a string type.', null);
    }
    // SAFETY: The envelope was checked above; payload fields remain unknown until selected by event type.
    return event;
}
/** Copies a freshly parsed JSON tree's containers, sharing its immutable string payloads. */
function copyEvent(event) {
    const copy = { ...event };
    const containers = [copy];
    for (const container of containers) {
        for (const [key, value] of Object.entries(container)) {
            if (typeof value === 'object' && value !== null) {
                const child = Array.isArray(value) ? [...value] : { ...value };
                Object.defineProperty(container, key, {
                    value: child,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
                containers.push(child);
            }
        }
    }
    return copy;
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isString(value) {
    return typeof value === 'string';
}
function hasRequiredFields(value, fields) {
    return (isObject(value) &&
        Object.entries(fields).every(([key, check]) => check(Object.getOwnPropertyDescriptor(value, key)?.value)));
}
function hasOptionalFields(value, fields) {
    return (isObject(value) &&
        Object.entries(fields).every(([key, check]) => {
            const field = Object.getOwnPropertyDescriptor(value, key);
            return field === undefined || check(field.value);
        }));
}
const inputAudioFields = {
    transcription: (value) => value === null || hasRequiredFields(value, { model: isString }),
    noise_reduction: (value) => value === null ||
        hasRequiredFields(value, {
            type: (kind) => kind === 'near_field' || kind === 'far_field',
        }),
};
const audioFields = {
    input: (value) => hasOptionalFields(value, inputAudioFields),
    output: (value) => hasOptionalFields(value, { language: isString }),
};
const sessionFields = {
    id: isString,
    model: isString,
    expires_at: (value) => typeof value === 'number',
    type: (value) => value === 'translation',
    audio: (value) => hasOptionalFields(value, audioFields),
};
function isOptionalNullableString(value) {
    return value === undefined || value === null || isString(value);
}
function isOptionalNumber(value) {
    return value === undefined || typeof value === 'number';
}
const errorFields = {
    message: isString,
    type: isString,
    code: isOptionalNullableString,
    event_id: isOptionalNullableString,
    param: isOptionalNullableString,
};
const commonFields = { type: isString, event_id: isString };
const deltaFields = {
    ...commonFields,
    delta: isString,
    elapsed_ms: (value) => value === null || isOptionalNumber(value),
};
const sessionEventFields = {
    ...commonFields,
    session: (value) => hasRequiredFields(value, sessionFields),
};
// Regeneration that adds an event or field must also update its dispatcher.
const translationEventFields = {
    'session.closed': commonFields,
    'session.input_transcript.delta': deltaFields,
    'session.output_transcript.delta': deltaFields,
    'session.output_audio.delta': {
        ...deltaFields,
        channels: isOptionalNumber,
        format: (value) => value === undefined || value === 'pcm16',
        sample_rate: isOptionalNumber,
    },
    'session.created': sessionEventFields,
    'session.updated': sessionEventFields,
    error: { ...commonFields, error: (value) => hasRequiredFields(value, errorFields) },
};
/** Check the required fields before exposing an envelope through a typed listener. */
function isCompleteTranslationEvent(event) {
    // SAFETY: Only the above schema-checked map's own data properties can supply a validator.
    const fields = Object.getOwnPropertyDescriptor(translationEventFields, event.type)?.value;
    return fields !== undefined && hasRequiredFields(event, fields);
}
function buildTranslationURL(client, model) {
    if (typeof model !== 'string' || !model) {
        throw new Error('A translation model is required.');
    }
    const request = (0, websocket_binding_1.prepareRequest)({ model });
    const endpoint = new URL(client.baseURL);
    endpoint.pathname = `${endpoint.pathname.replace(/\/$/u, '')}${request.path}`;
    const url = new URL(client.buildURL(endpoint.toString(), request.query));
    if (url.protocol !== 'https:') {
        throw new Error('The translation endpoint must use HTTPS.');
    }
    if (url.searchParams.has('intent')) {
        throw new Error('Realtime translation does not accept an intent query parameter.');
    }
    url.hash = '';
    url.protocol = 'wss:';
    return url;
}
/**
 * Node.js translation WebSocket. Install the optional `ws` peer dependency.
 * Wait for `socket` to open before sending. Events are never buffered or replayed.
 * Compression is off by default; set `options.perMessageDeflate` to opt in.
 */
// oxlint-disable-next-line unicorn/prefer-event-target -- Reuse the SDK typed emitter and its public on/off event contract.
class OpenAIRealtimeTranslationWS extends EventEmitter_1.EventEmitter {
    constructor(url, options) {
        super();
        /** Sends the protocol close once; use `finish` to await trailing output. */
        this.session = { close: () => this.send({ type: 'session.close' }) };
        this._inputClosed = false;
        this._terminalReceived = false;
        this._terminalDelivered = false;
        this._transportClosed = false;
        this._onMessage = (data) => {
            if (this._terminalReceived) {
                return;
            }
            const wireData = data.toString();
            let event;
            try {
                event = parseEvent(wireData);
            }
            catch (error) {
                // SAFETY: parseEvent only throws normalized, payload-free OpenAIRealtimeError instances.
                this._reportError(error);
                return;
            }
            const { type } = event;
            const typed = isCompleteTranslationEvent(event);
            const terminal = type === 'session.closed' && typed;
            if (terminal) {
                this._inputClosed = true;
                this._terminalReceived = true;
            }
            try {
                try {
                    // Raw listeners may mutate their event. Keep typed dispatch and finish
                    // anchored to the original validated wire event, including nested data.
                    if (this._hasListener('event')) {
                        this._emit('event', typed ? copyEvent(event) : event);
                    }
                }
                finally {
                    if (type === 'error' && typed) {
                        // SAFETY: The error envelope is preserved as server data, as for other Realtime events.
                        // oxlint-disable-next-line anti-slop/no-chained-type-assertions -- Forward server error fields unchanged through the existing Realtime error wrapper.
                        const apiErrorEvent = event;
                        const error = new internal_base_1.OpenAIRealtimeError(`Translation API error: ${apiErrorEvent.error.message}`, apiErrorEvent);
                        this._reportError(error);
                    }
                    else if (type !== 'error' && typed) {
                        // SAFETY: The wire discriminator selects its listener; future event names remain visible on `event`.
                        this._emit(type, event);
                    }
                }
            }
            finally {
                if (terminal) {
                    this._terminalDelivered = true;
                    try {
                        this._closeTransport();
                    }
                    finally {
                        this._settleFinish();
                    }
                }
            }
        };
        this._onError = (cause) => {
            // Closing before open also emits a ws error. The caller already requested
            // cleanup; _onClose still records an incomplete drain for a later finish().
            if (this._closeTimer !== undefined && !this._terminalReceived && !this._failure) {
                return;
            }
            const error = new internal_base_1.OpenAIRealtimeError('Translation WebSocket transport failed.', null);
            Object.defineProperty(error, 'cause', { value: cause, writable: true, configurable: true });
            this._fail(error);
            // finish already rejects transport failures; don't report that same failure a second time.
            if (this._hasListener('error') || !this._finishPromise) {
                this._reportError(error);
            }
        };
        this._onClose = (code) => {
            const reportPrematureClose = !this._terminalReceived && !this._failure && !this._finishPromise && this._closeTimer === undefined;
            this._inputClosed = true;
            this._transportClosed = true;
            clearTimeout(this._closeTimer);
            this.socket.off('message', this._onMessage);
            this.socket.off('error', this._onError);
            this.socket.off('close', this._onClose);
            if (!this._terminalReceived) {
                this._failure ?? (this._failure = new internal_base_1.OpenAIRealtimeError('Translation WebSocket closed before session.closed.', null));
            }
            else if (code !== 1000 && code !== 1001 && code !== 1005) {
                this._failure ?? (this._failure = new internal_base_1.OpenAIRealtimeError('Translation transport closed abnormally after session.closed.', null));
            }
            this._settleFinish();
            if (reportPrematureClose && this._failure) {
                this._reportError(this._failure);
            }
        };
        this._onAbort = () => {
            const error = new internal_base_1.OpenAIRealtimeError('Translation finish was aborted.', null);
            Object.defineProperty(error, 'cause', {
                value: this._signal?.reason,
                writable: true,
                configurable: true,
            });
            this._fail(error);
        };
        this.url = url;
        this.socket = new ws_adapter_node_1.NodeWebSocket(new WS.WebSocket(url, options));
        this.socket.on('message', this._onMessage);
        this.socket.on('error', this._onError);
        this.socket.on('close', this._onClose);
    }
    /** Resolves the API key and starts connecting; resolves before the socket opens. */
    static async create(client, props) {
        // SAFETY: Probe optional host capabilities without requiring Node ambient types in published source.
        const scope = globalThis;
        if ((0, detect_platform_1.isRunningInBrowser)() || !scope.process?.versions?.node) {
            throw new Error('Realtime translation WebSockets require Node.js.');
        }
        (0, x509_workload_identity_auth_1.assertX509WebSocketSupported)(client);
        // SAFETY: OpenAI owns these options; this read only rejects unsupported authentication modes.
        const clientOptions = client['_options'];
        if ((0, internal_base_1.isAzure)(client) ||
            bedrock_1.brand_privateBedrockClient in client ||
            clientOptions.provider ||
            clientOptions.workloadIdentity) {
            throw new Error('Realtime translation WebSockets require an ordinary OpenAI API-key client.');
        }
        const url = buildTranslationURL(client, props.model);
        const { apiKey } = await (0, realtime_credentials_1.resolveRealtimeAPIKey)(client);
        if (!apiKey) {
            throw new Error('Realtime translation WebSockets require an API key.');
        }
        const headers = new Map(Object.entries(client._buildWebSocketHeaders({ Authorization: `Bearer ${apiKey}` })));
        for (const [name, value] of Object.entries(props.options?.headers ?? {})) {
            if (value === null) {
                headers.delete(name.toLowerCase());
            }
            else if (value !== undefined) {
                headers.set(name.toLowerCase(), value);
            }
        }
        const { maxPayload, perMessageDeflate, ...nativeOptions } = props.options ?? {};
        const options = {
            ...nativeOptions,
            maxPayload: maxPayload ?? 0,
            perMessageDeflate: perMessageDeflate ?? false,
            headers: Object.fromEntries(headers),
            followRedirects: false,
        };
        (0, ws_1.snapshotWebSocketCredentials)(options);
        return new OpenAIRealtimeTranslationWS(url, options);
    }
    /** Sends a typed event, future event envelope, or raw JSON envelope after the socket opens. */
    send(event) {
        const data = typeof event === 'string' ? event : JSON.stringify(event);
        const envelope = parseEvent(data);
        if (envelope.type === 'session.close') {
            if (this._inputClosed) {
                return;
            }
            this._inputClosed = true;
        }
        else if (this._inputClosed) {
            throw new internal_base_1.OpenAIRealtimeError('Translation input is closed.', null);
        }
        try {
            if (this.socket.readyState !== ws_adapter_1.ReadyState.OPEN) {
                throw new Error('The translation WebSocket is not open.');
            }
            this.socket.send(data);
        }
        catch {
            const error = new internal_base_1.OpenAIRealtimeError('Could not send translation WebSocket event.', null);
            this._fail(error);
            throw error;
        }
    }
    /**
     * Stops input, sends `session.close` once, and delivers all events through `session.closed`.
     * The first call owns the finite deadline and optional cancellation signal. Repeated calls
     * share its result. API error events remain observable and do not end the drain.
     * A timeout, abort, or transport failure rejects; no connection or input is replayed.
     * Resolves after terminal delivery and transport closure. The deadline includes transport
     * cleanup; a stalled close handshake is terminated and rejects the operation.
     */
    finish({ timeoutMs, signal }) {
        if (this._finishPromise) {
            return this._finishPromise;
        }
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2147483647) {
            return Promise.reject(new Error('timeoutMs must be a positive finite WebSocket deadline of at most 2147483647.'));
        }
        // oxlint-disable-next-line promise/avoid-new -- The existing socket dispatcher settles this completion; there is no second event reader.
        this._finishPromise = new Promise((resolve, reject) => {
            this._resolveFinish = resolve;
            this._rejectFinish = reject;
        });
        if (this._transportClosed) {
            this._settleFinish();
            return this._finishPromise;
        }
        clearTimeout(this._closeTimer);
        this._closeTimer = undefined;
        this._signal = signal;
        this._finishTimer = setTimeout(() => {
            this._fail(new internal_base_1.OpenAIRealtimeError('Timed out finishing the translation session and closing its transport.', null));
        }, timeoutMs);
        signal?.addEventListener('abort', this._onAbort, { once: true });
        if (signal?.aborted) {
            this._onAbort();
        }
        else if (!this._terminalReceived && !this._failure) {
            try {
                this.session.close();
            }
            catch {
                // send already records the failure and terminates the connection.
            }
        }
        this._settleFinish();
        return this._finishPromise;
    }
    /** Closes the transport without waiting for terminal output. Prefer `finish` for a complete session. */
    close() {
        this._inputClosed = true;
        this._closeTransport();
    }
    _reportError(error) {
        if (this._hasListener('error')) {
            this._emit('error', error);
        }
        else {
            error.message += " Bind an error listener, e.g. connection.on('error', (error) => ...).";
            // oxlint-disable-next-line promise/no-promise-in-callback -- Match Realtime's explicit unhandled rejection contract when no SDK listener or completion operation observes the error.
            Promise.reject(error);
        }
    }
    _fail(error) {
        this._inputClosed = true;
        this._failure ?? (this._failure = error);
        this._settleFinish();
        if (this.socket.readyState !== ws_adapter_1.ReadyState.CLOSED) {
            this.socket.platformSocket.terminate();
        }
    }
    _settleFinish() {
        if (!this._transportClosed || (!this._failure && !this._terminalDelivered)) {
            return;
        }
        clearTimeout(this._finishTimer);
        this._signal?.removeEventListener('abort', this._onAbort);
        this._signal = undefined;
        if (this._failure) {
            this._rejectFinish?.(this._failure);
        }
        else {
            this._resolveFinish?.();
        }
        this._resolveFinish = undefined;
        this._rejectFinish = undefined;
    }
    _closeTransport() {
        if (this.socket.readyState === ws_adapter_1.ReadyState.CLOSED || this.socket.readyState === ws_adapter_1.ReadyState.CLOSING) {
            return;
        }
        if (!this._finishPromise) {
            this._closeTimer = setTimeout(() => {
                const error = new internal_base_1.OpenAIRealtimeError('Timed out closing the translation transport.', null);
                this._fail(error);
                this._reportError(error);
            }, 1000);
            const timer = this._closeTimer;
            if (typeof timer === 'object' &&
                timer !== null &&
                'unref' in timer &&
                typeof timer.unref === 'function') {
                timer.unref();
            }
        }
        try {
            this.socket.close(1000, 'OK');
        }
        catch {
            const error = new internal_base_1.OpenAIRealtimeError('Could not close the translation transport.', null);
            this._fail(error);
            this._emit('error', error);
        }
    }
}
exports.OpenAIRealtimeTranslationWS = OpenAIRealtimeTranslationWS;
//# sourceMappingURL=ws.js.map