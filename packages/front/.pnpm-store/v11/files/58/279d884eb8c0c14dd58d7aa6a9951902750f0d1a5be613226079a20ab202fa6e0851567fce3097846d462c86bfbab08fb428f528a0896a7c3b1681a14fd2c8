"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketCredentials = void 0;
const error_1 = require("../core/error.js");
const realtime_credentials_1 = require("./realtime-credentials.js");
const ws_1 = require("./ws.js");
/**
 * Keep caller credential admission distinct from the hook's final provider-key transform.
 * The latter reuses captured base headers so no caller getters are reread after the refresh.
 */
function buildCredentialedWebSocketOptions(client, authHeaders, options, prepared) {
    if (prepared) {
        return prepared.apiKey === undefined
            ? (0, ws_1.mergeWebSocketAuthHeaders)(prepared.options, authHeaders, prepared.removedHeaders)
            : (0, ws_1.buildWebSocketOptions)(client, authHeaders, prepared.options, prepared.removedHeaders, true);
    }
    if (!client._hasApiKeyProvider()) {
        return (0, ws_1.buildWebSocketOptions)(client, authHeaders, options);
    }
    const removedHeaders = new Set();
    const provided = (0, ws_1.buildWebSocketOptions)(client, {}, options, removedHeaders);
    return (0, ws_1.snapshotWebSocketCredentials)(provided, ws_1.WEBSOCKET_METADATA_HEADERS)
        ? provided
        : (0, ws_1.buildWebSocketOptions)(client, authHeaders, provided, removedHeaders, true);
}
/**
 * Classify reconnect credentials without treating the previous SDK key as a caller override.
 * Capture routing and caller options before any asynchronous key refresh.
 */
function prepareWebSocketReconnect(client, socketOptions, initialAuthUsedAPIKey) {
    const removedHeaders = new Set();
    const options = (0, ws_1.buildWebSocketOptions)(client, {}, socketOptions, removedHeaders);
    let authentication;
    if ((0, ws_1.snapshotWebSocketCredentials)(options, ws_1.WEBSOCKET_METADATA_HEADERS)) {
        authentication = 'provided';
    }
    else if (removedHeaders.has('authorization') ||
        options.headers?.['authorization'] !== undefined ||
        !initialAuthUsedAPIKey) {
        authentication = 'cached';
    }
    else {
        authentication = 'refresh';
    }
    return { options, removedHeaders, authentication };
}
/** Per-connection credential snapshots shared by Node WebSocket bindings. */
class WebSocketCredentials {
    constructor(connectionName) {
        this.initialAuthUsedAPIKey = false;
        this.connectionName = connectionName;
    }
    get preparedAPIKey() {
        return this.prepared?.apiKey;
    }
    trackInitialHeaders(client, headers, hasSocket) {
        if (!hasSocket() && client._hasApiKeyProvider()) {
            this.initialAPIKey = headers['Authorization']?.slice('Bearer '.length);
        }
    }
    usesAPIKey(client, headers) {
        // Hooks can read the SDK key without delegating. Only use an ordinary cached property here:
        // invoking custom/Bedrock getters could validate credentials a caller-owned socket never sends.
        const apiKey = this.initialAPIKey ??
            (client._hasApiKeyProvider() ? Object.getOwnPropertyDescriptor(client, 'apiKey')?.value : undefined);
        if (!apiKey) {
            return false;
        }
        // Metadata containing a copy of a credential does not make it the socket's authentication.
        return (0, ws_1.snapshotWebSocketCredentials)({
            headers: Object.fromEntries(Object.entries(headers).map(([name, value]) => [name, value?.includes(apiKey) ? value : ''])),
        }, ws_1.WEBSOCKET_METADATA_HEADERS);
    }
    build(client, authHeaders, options, initialAuthUsedAPIKey) {
        if (initialAuthUsedAPIKey !== undefined) {
            this.initialAuthUsedAPIKey = initialAuthUsedAPIKey;
            this.initialAPIKey = undefined;
        }
        const socketOptions = buildCredentialedWebSocketOptions(client, authHeaders, options, this.prepared);
        if (client._hasApiKeyProvider() &&
            !authHeaders['Authorization'] &&
            !(0, ws_1.snapshotWebSocketCredentials)(socketOptions, ws_1.WEBSOCKET_METADATA_HEADERS)) {
            throw new error_1.OpenAIError(`Cannot open a ${this.connectionName} WebSocket with an unresolved function-based apiKey. Resolve it before constructing the WebSocket or provide explicit WebSocket credentials.`);
        }
        return socketOptions;
    }
    async prepare(client, socketOptions, authHeaders, createSocket) {
        const { options, removedHeaders, authentication } = prepareWebSocketReconnect(client, socketOptions, this.initialAuthUsedAPIKey);
        const createPreparedSocket = (url, headers, apiKey) => {
            const previous = this.prepared;
            this.prepared = { options, removedHeaders, apiKey };
            try {
                // Resolve headers inside the scope so legacy zero-argument overrides see this attempt's key.
                return createSocket(url, apiKey === undefined ? headers : authHeaders(apiKey));
            }
            finally {
                this.prepared = previous;
            }
        };
        if (authentication !== 'refresh') {
            const headers = authentication === 'provided' ? {} : authHeaders();
            return (url) => createPreparedSocket(url, headers);
        }
        const { commit } = await (0, realtime_credentials_1.resolveRealtimeAPIKey)(client, true);
        return (url) => createPreparedSocket(url, {}, commit());
    }
}
exports.WebSocketCredentials = WebSocketCredentials;
//# sourceMappingURL=ws-credentials.js.map