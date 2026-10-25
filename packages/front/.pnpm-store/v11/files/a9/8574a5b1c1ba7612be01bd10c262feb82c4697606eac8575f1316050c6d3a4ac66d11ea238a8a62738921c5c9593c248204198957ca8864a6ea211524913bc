// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import * as WS from 'ws';
import { NodeWebSocket, snapshotNodeWebSocketOptions } from "../../internal/ws-adapter-node.mjs";
import { LiveWSBase } from "./ws-base.mjs";
import { WebSocketCredentials } from "../../internal/ws-credentials.mjs";
export class LiveWS extends LiveWSBase {
    constructor(client, options) {
        if (!WS?.WebSocket) {
            throw new Error('LiveWS from "openai/resources/live/ws" requires the "ws" package but it could not be loaded.');
        }
        const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
        super(client, { reconnect, maxQueueSize });
        this._credentials = new WebSocketCredentials('Live');
        this._wsOptions = wsOptions;
        this._connectInitial();
    }
    _authHeaders(apiKey) {
        const headers = super._authHeaders(apiKey === undefined ? this._credentials.preparedAPIKey : apiKey);
        this._credentials.trackInitialHeaders(this._client, headers, () => !!this.socket);
        return headers;
    }
    /**
     * Whether credentials passed to the Node transport use the SDK key.
     * The SDK recognizes its key, including copies and additions in credential headers.
     * Override and return true if your socket hook signs or otherwise irreversibly transforms it.
     * Explicit caller options and header removals still take precedence on reconnect.
     */
    _usesSDKAPIKey(authHeaders) {
        return this._credentials.usesAPIKey(this._client, authHeaders);
    }
    _createSocket(url, authHeaders) {
        const capturedAuthHeaders = { ...authHeaders };
        const socketOptions = {
            maxPayload: 0,
            perMessageDeflate: false,
            ...this._credentials.build(this._client, capturedAuthHeaders, this._wsOptions, !this.socket ? this._usesSDKAPIKey(capturedAuthHeaders) : undefined),
        };
        socketOptions.maxPayload ?? (socketOptions.maxPayload = 0);
        socketOptions.perMessageDeflate ?? (socketOptions.perMessageDeflate = false);
        return new NodeWebSocket(new WS.WebSocket(url, socketOptions));
    }
    async _prepareReconnectSocket() {
        if (!this._client._hasApiKeyProvider()) {
            return super._prepareReconnectSocket();
        }
        return this._credentials.prepare(this._client, snapshotNodeWebSocketOptions(this._wsOptions), (...args) => this._authHeaders(...args), (url, headers) => this._createSocket(url, headers));
    }
}
//# sourceMappingURL=ws.mjs.map