"use strict";
// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesWS = void 0;
const tslib_1 = require("../../internal/tslib.js");
const WS = tslib_1.__importStar(require("ws"));
const ws_adapter_node_1 = require("../../internal/ws-adapter-node.js");
const ws_base_1 = require("./ws-base.js");
const responses_ws_credentials_1 = require("../../internal/responses-ws-credentials.js");
class ResponsesWS extends ws_base_1.ResponsesWSBase {
    constructor(client, options) {
        if (!WS?.WebSocket) {
            throw new Error('ResponsesWS from "openai/resources/responses/ws" requires the "ws" package but it could not be loaded.');
        }
        const { reconnect, maxQueueSize, ...wsOptions } = options ?? {};
        super(client, { reconnect, maxQueueSize });
        this._credentials = new responses_ws_credentials_1.ResponsesWebSocketCredentials();
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
        return new ws_adapter_node_1.NodeWebSocket(new WS.WebSocket(url, socketOptions));
    }
    async _prepareReconnectSocket() {
        if (!this._client._hasApiKeyProvider()) {
            return super._prepareReconnectSocket();
        }
        return this._credentials.prepare(this._client, (0, ws_adapter_node_1.snapshotNodeWebSocketOptions)(this._wsOptions), (...args) => this._authHeaders(...args), (url, headers) => this._createSocket(url, headers));
    }
}
exports.ResponsesWS = ResponsesWS;
//# sourceMappingURL=ws.js.map