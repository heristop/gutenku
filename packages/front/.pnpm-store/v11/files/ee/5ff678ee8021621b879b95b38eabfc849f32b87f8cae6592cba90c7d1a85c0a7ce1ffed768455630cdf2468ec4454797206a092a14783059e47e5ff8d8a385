import { createRealtimeRecovery, validateRealtimeRecovery } from "../internal/realtime-recovery.mjs";
import { NodeWebSocket, snapshotNodeWebSocketOptions } from "../internal/ws-adapter-node.mjs";
import { resolveRealtimeAPIKey } from "../internal/realtime-credentials.mjs";
import * as WS from 'ws';
import { assertBedrockWebSocketOrigin } from "../internal/bedrock.mjs";
import { protectWebSocketOptionsFromCredentialRedirects } from "../internal/ws.mjs";
import { OpenAI } from "../index.mjs";
import { VERSION } from "../version.mjs";
import { OpenAIRealtimeEmitter, buildRealtimeURL, getAzureRealtimeConnection, isAzure, parseRealtimeEvent, } from "./internal-base.mjs";
/**
 * Connects to the Realtime API using the Node.js `ws` WebSocket implementation.
 *
 * Install the optional `ws` peer dependency before importing this entrypoint.
 * Subscribe to `socket`'s `open` and `close` events for connection lifecycle,
 * and register an SDK `error` listener for API or transport failures.
 */
export class OpenAIRealtimeWS extends OpenAIRealtimeEmitter {
    /**
     * Immediately opens a model or transcription session, or attaches to an existing call.
     *
     * Pass an existing OpenAI client as the second argument to reuse its endpoint
     * and static credentials. Clients with function-based credentials must use
     * {@link OpenAIRealtimeWS.create}; Azure clients should use
     * {@link OpenAIRealtimeWS.azure}.
     *
     * @param props Exactly one model, transcription intent, or call ID, plus `ws` client settings.
     * @param client Existing client whose endpoint and API key should be reused.
     */
    constructor(props, client) {
        super();
        validateRealtimeRecovery(props);
        if (props.reconnect && !props.model) {
            throw new Error('Automatic Realtime recovery requires a model session');
        }
        const connectionClient = client ?? new OpenAI();
        const apiKey = props.__apiKey === undefined ? connectionClient.apiKey : props.__apiKey;
        // SAFETY: The supplied OpenAI client owns _options; this read detects its existing API-key provider without changing its public surface.
        const hasProvider = typeof connectionClient?._options?.apiKey === 'function';
        if (hasProvider && !props.__resolvedApiKey) {
            throw new Error([
                'Cannot open Realtime WebSocket with a function-based apiKey.',
                'Use the .create() method so that the key is resolved before connecting.',
            ].join('\n'));
        }
        const terminalErrors = new WeakMap();
        const open = (attemptKey, resolvedApiKey, capturedURL, options = props.options) => {
            const url = capturedURL ?? buildRealtimeURL(connectionClient, props);
            validateRealtimeRecovery(props, url);
            assertBedrockWebSocketOrigin(connectionClient, url);
            if (isAzure(connectionClient) && props.__apiKey !== undefined && !attemptKey) {
                throw new Error('Azure OpenAI Realtime requires an API key');
            }
            const azureKey = isAzure(connectionClient) && !resolvedApiKey;
            const headers = {
                'User-Agent': `${connectionClient.constructor.name}/JS ${VERSION}`,
                ...options?.headers,
                // Credentials remain own data properties without invoking inherited setters.
                ...(azureKey && props.__apiKey !== undefined ? { 'api-key': attemptKey ?? '' } : {}),
                ...(azureKey ? {} : { Authorization: `Bearer ${attemptKey}` }),
            };
            const { maxPayload, ...nativeOptions } = options ?? {};
            const socketOptions = {
                perMessageDeflate: false,
                ...nativeOptions,
                maxPayload: maxPayload ?? 0,
                headers,
            };
            socketOptions.perMessageDeflate ?? (socketOptions.perMessageDeflate = false);
            const socket = new WS.WebSocket(url, protectWebSocketOptionsFromCredentialRedirects(socketOptions));
            socket.on('message', (wsEvent) => {
                if (this._recovery && (socket !== this.socket || this._recovery.isClosed)) {
                    return;
                }
                const event = (() => {
                    try {
                        const parsedEvent = parseRealtimeEvent(wsEvent.toString());
                        if (typeof parsedEvent !== 'object' ||
                            parsedEvent === null ||
                            Array.isArray(parsedEvent) ||
                            !Object.getOwnPropertyDescriptor(parsedEvent, 'type') ||
                            typeof parsedEvent.type !== 'string') {
                            throw new TypeError('Realtime WebSocket event must be an object with a string type.');
                        }
                        return parsedEvent;
                    }
                    catch (err) {
                        this._onError(null, 'could not parse websocket event', err);
                        return null;
                    }
                })();
                if (event) {
                    this._emit('event', event);
                    if (this._recovery?.isClosed) {
                        return;
                    }
                    if (event.type === 'error') {
                        this._onError(event);
                    }
                    else if (!this._recovery || !['close', 'reconnecting', 'reconnected'].includes(event.type)) {
                        // @ts-expect-error TS cannot relate the event discriminant to the mapped callback type.
                        this._emit(event.type, event);
                    }
                }
            });
            if (props.reconnect) {
                socket.on('unexpected-response', (_request, response) => {
                    if (![408, 429, 500, 502, 503, 504].includes(response.statusCode ?? 0)) {
                        terminalErrors.set(socket, new Error(`Unexpected server response: ${response.statusCode ?? 'unknown'}`));
                    }
                    response.resume();
                    socket.terminate();
                });
            }
            socket.on('error', (err) => {
                if (this._recovery) {
                    if ('code' in err &&
                        typeof err.code === 'string' &&
                        (err.code.startsWith('ERR_TLS_') ||
                            err.code.startsWith('CERT_') ||
                            [
                                'DEPTH_ZERO_SELF_SIGNED_CERT',
                                'SELF_SIGNED_CERT_IN_CHAIN',
                                'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
                                'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
                            ].includes(err.code))) {
                        terminalErrors.set(socket, err);
                    }
                    return;
                }
                this._onError(null, err.message, err);
            });
            return { url, socket };
        };
        const initial = open(apiKey, props.__resolvedApiKey === true);
        this.url = initial.url;
        this.socket = initial.socket;
        if (props.reconnect) {
            this._recovery = createRealtimeRecovery(this, props, {
                buildURL: () => buildRealtimeURL(connectionClient, props),
                adaptSocket: (socket) => new NodeWebSocket(socket),
                prepare: async () => {
                    const { maxPayload, headers, ...nativeOptions } = props.options ?? {};
                    const options = snapshotNodeWebSocketOptions({ ...nativeOptions, maxPayload, headers });
                    // SAFETY: The branch checks _callApiKey before using the client's credential resolver.
                    const credential = '_callApiKey' in connectionClient && typeof connectionClient._callApiKey === 'function'
                        ? await resolveRealtimeAPIKey(connectionClient, true)
                        : { isProvider: false, commit: () => connectionClient.apiKey };
                    return (url) => open(credential.commit(), credential.isProvider, url, options).socket;
                },
                shouldReconnect: () => !terminalErrors.has(this.socket),
                onError: (message, cause) => {
                    const terminal = terminalErrors.get(this.socket);
                    this._onError(null, terminal && terminal.message !== message ? `${message}: ${terminal.message}` : message, terminal ?? cause);
                },
                onReconnecting: (event) => this._emit('reconnecting', event),
                onReconnected: () => this._emit('reconnected'),
                onClose: (code, reason, unsent) => {
                    terminalErrors.delete(this.socket);
                    this._emit('close', code, reason, unsent);
                },
            });
        }
    }
    /**
     * Resolves a client's current API credential before opening a Realtime connection.
     *
     * Use this factory instead of the constructor when the client's `apiKey` is a function.
     *
     * @param client OpenAI client that owns the endpoint and refreshable or static credential.
     * @param props Exactly one model, transcription intent, or call ID, plus `ws` client settings.
     */
    static async create(client, props) {
        const { apiKey, isProvider: resolvedApiKey } = await resolveRealtimeAPIKey(client);
        const buildURL = props.buildRealtimeURL;
        return new OpenAIRealtimeWS({
            ...props,
            ...(buildURL
                ? { buildRealtimeURL: (connectionClient) => buildURL.call(props, connectionClient, props) }
                : {}),
            __resolvedApiKey: resolvedApiKey,
            __apiKey: apiKey,
        }, client);
    }
    /**
     * Opens an Azure deployment or transcription session, or an existing sideband call.
     *
     * Static Azure API keys are sent in the `api-key` header; function-based
     * credentials are resolved first and sent as bearer credentials. The client's
     * configured deployment is used unless a deployment, transcription intent, or call ID is supplied.
     *
     * @param client Azure OpenAI client that supplies the endpoint and credential.
     * @param props Deployment, transcription intent, or call ID, plus `ws` connection settings.
     * @throws {Error} If the Azure credential or required deployment is unavailable.
     */
    static async azure(client, props = {}) {
        const connection = getAzureRealtimeConnection(client, props);
        const { apiKey, isProvider: isApiKeyProvider } = await resolveRealtimeAPIKey(client);
        if (!apiKey) {
            throw new Error('Azure OpenAI Realtime requires an API key');
        }
        return new OpenAIRealtimeWS({
            ...connection,
            options: {
                ...props.options,
                headers: {
                    ...props.options?.headers,
                    // A credential must be an own data property without invoking an inherited setter.
                    ...(isApiKeyProvider ? {} : { 'api-key': apiKey }),
                },
            },
            __resolvedApiKey: isApiKeyProvider,
            __apiKey: apiKey,
        }, client);
    }
    /**
     * Serializes and sends a Realtime client event after the WebSocket has opened.
     * Serialization and transport failures are delivered to the SDK `error` event.
     */
    send(event) {
        if (this._recovery) {
            return this._recovery.send(event);
        }
        try {
            this.socket.send(JSON.stringify(event));
        }
        catch (err) {
            this._onError(null, 'could not send data', err);
        }
    }
    /** Explicitly flush never-attempted events after restoring the replacement session. */
    flushPending() {
        this._recovery?.flushPending();
    }
    /** Remove retained events without transmitting them. */
    takePending() {
        return this._recovery?.takePending() ?? [];
    }
    /**
     * Closes the WebSocket with status code `1000` and reason `OK` by default.
     * Connection-closing failures are delivered to the SDK `error` event.
     */
    close(props) {
        if (this._recovery) {
            return this._recovery.close(props);
        }
        try {
            this.socket.close(props?.code ?? 1000, props?.reason ?? 'OK');
        }
        catch (err) {
            this._onError(null, 'could not close the connection', err);
        }
    }
}
//# sourceMappingURL=ws.mjs.map