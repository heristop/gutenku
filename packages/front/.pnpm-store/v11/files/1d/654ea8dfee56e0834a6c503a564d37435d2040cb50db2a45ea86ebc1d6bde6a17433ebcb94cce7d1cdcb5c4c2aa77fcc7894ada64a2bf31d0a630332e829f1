import { APIResource } from "../../../../core/resource.js";
import * as CredentialsAPI from "./credentials.js";
import * as VaultsAPI from "./vaults.js";
import { APIPromise } from "../../../../core/api-promise.js";
import { CursorPage, type CursorPageParams, PagePromise } from "../../../../core/pagination.js";
import { RequestOptions } from "../../../../internal/request-options.js";
export declare class Credentials extends APIResource {
    /**
     * Creates a vault credential. Secret values are write-only and are never returned.
     * See
     * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
     *
     * @example
     * ```ts
     * const credential =
     *   await client.beta.agents.vaults.credentials.create(
     *     'vault_id',
     *     {
     *       auth: {
     *         access_token: 'access_token',
     *         mcp_server_url: 'mcp_server_url',
     *         type: 'mcp_oauth',
     *       },
     *       name: 'x',
     *     },
     *   );
     * ```
     */
    create(vaultID: string, body: CredentialCreateParams, options?: RequestOptions): APIPromise<Credential>;
    /**
     * Retrieves vault credential metadata without returning secret values. See
     * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
     *
     * @example
     * ```ts
     * const credential =
     *   await client.beta.agents.vaults.credentials.retrieve(
     *     'credential_id',
     *     { vault_id: 'vault_id' },
     *   );
     * ```
     */
    retrieve(credentialID: string, params: CredentialRetrieveParams, options?: RequestOptions): APIPromise<Credential>;
    /**
     * Updates credential metadata or rotates its write-only secret. See
     * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
     *
     * @example
     * ```ts
     * const credential =
     *   await client.beta.agents.vaults.credentials.update(
     *     'credential_id',
     *     { vault_id: 'vault_id', metadata: {} },
     *   );
     * ```
     */
    update(credentialID: string, params: CredentialUpdateParams, options?: RequestOptions): APIPromise<Credential>;
    /**
     * Lists a vault's credentials using ID-based pagination without returning secret
     * values. See
     * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const credential of client.beta.agents.vaults.credentials.list(
     *   'vault_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(vaultID: string, query?: (CredentialListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<CredentialsPage, Credential>;
    list(vaultID: string, options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<CredentialsPage, Credential>;
    /**
     * Deletes a vault credential. See
     * [vaults](https://developers.openai.com/api/docs/guides/agents-api/tools/vaults).
     *
     * @example
     * ```ts
     * const credentialDeleted =
     *   await client.beta.agents.vaults.credentials.delete(
     *     'credential_id',
     *     { vault_id: 'vault_id' },
     *   );
     * ```
     */
    delete(credentialID: string, params: CredentialDeleteParams, options?: RequestOptions): APIPromise<CredentialDeleted>;
}
export type CredentialsPage = CursorPage<Credential>;
/**
 * Metadata for a stored credential. Secret values are never returned.
 */
export interface Credential {
    /**
     * The ID of the credential.
     */
    id: string;
    /**
     * The authentication method and non-secret configuration of the credential.
     */
    auth: CredentialAuth;
    /**
     * The Unix timestamp, in seconds, when the credential was created.
     */
    created_at: number;
    /**
     * Application-defined key-value pairs associated with this credential.
     */
    metadata: {
        [key: string]: string;
    };
    /**
     * The human-readable name of the credential.
     */
    name: string;
    /**
     * The object type. Always `vault.credential`.
     */
    object: 'vault.credential';
    /**
     * The Unix timestamp, in seconds, when the credential was last updated.
     */
    updated_at: number;
    /**
     * The ID of the vault containing this credential.
     */
    vault_id: string;
}
/**
 * The authentication configuration of a vault credential, excluding secrets.
 */
export type CredentialAuth = CredentialAuth.VaultCredentialAuthResourceMcpOauth | CredentialAuth.VaultCredentialAuthResourceStaticBearer | CredentialAuth.VaultCredentialAuthResourceEnvironmentVariable;
export declare namespace CredentialAuth {
    /**
     * Public metadata for an OAuth credential; tokens and client secrets are never
     * returned.
     */
    interface VaultCredentialAuthResourceMcpOauth {
        /**
         * When the OAuth access token expires, as an RFC 3339 timestamp, if known.
         */
        expires_at: string | null;
        /**
         * The HTTPS MCP server URL authorized by this credential.
         */
        mcp_server_url: string;
        /**
         * Public refresh metadata without refresh tokens or OAuth client secrets.
         */
        refresh: VaultCredentialAuthResourceMcpOauth.Refresh | null;
        /**
         * The type of the object. Always `mcp_oauth`.
         */
        type: 'mcp_oauth';
    }
    namespace VaultCredentialAuthResourceMcpOauth {
        /**
         * Public refresh metadata without refresh tokens or OAuth client secrets.
         */
        interface Refresh {
            /**
             * The OAuth client ID used when requesting a new access token.
             */
            client_id: string;
            /**
             * The resource URI sent to the OAuth token endpoint during refresh, if configured.
             */
            resource: string | null;
            /**
             * Space-separated OAuth scopes requested during refresh, if configured.
             */
            scope: string | null;
            /**
             * The HTTPS OAuth token endpoint used for refresh.
             */
            token_endpoint: string;
            /**
             * How the OAuth client authenticates to the token endpoint, excluding its client
             * secret.
             */
            token_endpoint_auth: CredentialsAPI.McpOauthTokenEndpointAuth;
        }
    }
    /**
     * Metadata for a bearer-token credential, without automatic OAuth refresh.
     */
    interface VaultCredentialAuthResourceStaticBearer {
        /**
         * The HTTPS MCP server URL authorized by this credential.
         */
        mcp_server_url: string;
        /**
         * The type of the object. Always `static_bearer`.
         */
        type: 'static_bearer';
    }
    /**
     * Metadata for an HTTP credential used only in OpenAI-hosted environments. Sandbox
     * code receives a placeholder. The proxy substitutes the secret for allowed HTTPS
     * destinations on ports 443 and 8443. The real secret is not available to sandbox
     * code for local computation and is never returned in this resource.
     */
    interface VaultCredentialAuthResourceEnvironmentVariable {
        /**
         * The destinations where the proxy can substitute the secret, subject to the
         * environment network policy.
         */
        networking: CredentialsAPI.CredentialNetworking;
        /**
         * The environment variable name that receives the placeholder in the sandbox.
         */
        secret_name: string;
        /**
         * The type of the object. Always `environment_variable`.
         */
        type: 'environment_variable';
    }
}
/**
 * Authentication credentials for an MCP server or an OpenAI-hosted environment.
 */
export type CredentialAuthCreateParam = CredentialAuthCreateParam.CreateVaultCredentialAuthParamMcpOauth | CredentialAuthCreateParam.CreateVaultCredentialAuthParamStaticBearer | CredentialAuthCreateParam.CreateVaultCredentialAuthParamEnvironmentVariable;
export declare namespace CredentialAuthCreateParam {
    /**
     * An OAuth credential for an HTTPS MCP destination.
     */
    interface CreateVaultCredentialAuthParamMcpOauth {
        /**
         * A write-only OAuth access token; never returned by credential resources.
         */
        access_token: string;
        /**
         * The HTTPS MCP server URL authorized by this credential.
         */
        mcp_server_url: string;
        /**
         * The type of the object. Always `mcp_oauth`.
         */
        type: 'mcp_oauth';
        /**
         * When the OAuth access token expires, as an RFC 3339 timestamp, if known.
         */
        expires_at?: string | null;
        /**
         * Optional refresh configuration for an HTTPS OAuth token endpoint.
         */
        refresh?: CreateVaultCredentialAuthParamMcpOauth.Refresh | null;
    }
    namespace CreateVaultCredentialAuthParamMcpOauth {
        /**
         * Optional refresh configuration for an HTTPS OAuth token endpoint.
         */
        interface Refresh {
            /**
             * The OAuth client ID used when requesting a new access token.
             */
            client_id: string;
            /**
             * The refresh token to store. This secret is never returned in credential
             * resources.
             */
            refresh_token: string;
            /**
             * The HTTPS OAuth token endpoint used to exchange the refresh token for a new
             * access token.
             */
            token_endpoint: string;
            /**
             * How the OAuth client authenticates to the token endpoint.
             */
            token_endpoint_auth: CredentialsAPI.McpOauthTokenEndpointAuthCreateParam;
            /**
             * The resource URI to send to the OAuth token endpoint during refresh, if
             * required.
             */
            resource?: string | null;
            /**
             * Space-separated OAuth scopes to request during refresh, if required.
             */
            scope?: string | null;
        }
    }
    /**
     * A bearer token for an MCP server, without automatic OAuth refresh.
     */
    interface CreateVaultCredentialAuthParamStaticBearer {
        /**
         * The bearer token to store. This secret is never returned in credential
         * resources.
         */
        token: string;
        /**
         * The HTTPS MCP server URL authorized by this credential.
         */
        mcp_server_url: string;
        /**
         * The type of the object. Always `static_bearer`.
         */
        type: 'static_bearer';
    }
    /**
     * An HTTP credential for OpenAI-hosted environments only. The sandbox receives an
     * environment variable containing a placeholder, not the secret. Use the
     * placeholder unchanged in outgoing requests. The egress proxy replaces the
     * placeholder with the secret for allowed HTTPS destinations on ports 443 and
     * 8443. Sandbox code cannot read the real secret or use it for local computation,
     * such as signing a request.
     */
    interface CreateVaultCredentialAuthParamEnvironmentVariable {
        /**
         * The destinations where the proxy can substitute this secret. The environment
         * network policy must also allow them.
         */
        networking: CredentialsAPI.CredentialNetworkingParam;
        /**
         * The environment variable name that receives the placeholder, such as
         * `SERVICE_API_KEY`. Use ASCII letters, digits, and underscores, starting with a
         * letter or underscore. Names starting with `CODEX_` and managed proxy or
         * certificate variable names are reserved.
         */
        secret_name: string;
        /**
         * The write-only secret to store. Never returned in credential resources or
         * supplied directly to sandbox code. Must be nonempty and must not contain
         * carriage returns, newlines, or NUL bytes.
         */
        secret_value: string;
        /**
         * The type of the object. Always `environment_variable`.
         */
        type: 'environment_variable';
    }
}
/**
 * Updates to a vault credential without changing its authentication method or
 * destination configuration.
 */
export type CredentialAuthRotateParam = CredentialAuthRotateParam.RotateVaultCredentialAuthParamMcpOauth | CredentialAuthRotateParam.RotateVaultCredentialAuthParamStaticBearer | CredentialAuthRotateParam.RotateVaultCredentialAuthParamEnvironmentVariable;
export declare namespace CredentialAuthRotateParam {
    /**
     * Rotate an OAuth credential for an HTTPS MCP destination.
     */
    interface RotateVaultCredentialAuthParamMcpOauth {
        /**
         * The type of the object. Always `mcp_oauth`.
         */
        type: 'mcp_oauth';
        /**
         * A write-only replacement OAuth access token.
         */
        access_token?: string | null;
        /**
         * The replacement expiry as an RFC 3339 timestamp, or `null` to clear it. Omitting
         * this field preserves the expiry unless a new access token is supplied, in which
         * case the expiry is cleared.
         */
        expires_at?: string | null;
        /**
         * Optional write-only refresh-token and client-secret updates.
         */
        refresh?: RotateVaultCredentialAuthParamMcpOauth.Refresh | null;
    }
    namespace RotateVaultCredentialAuthParamMcpOauth {
        /**
         * Optional write-only refresh-token and client-secret updates.
         */
        interface Refresh {
            /**
             * The replacement refresh token. Omit or pass `null` to keep the stored token.
             * This secret is never returned in resources.
             */
            refresh_token?: string | null;
            /**
             * Replacement space-separated OAuth scopes for refresh requests. Omit to keep the
             * scopes, or pass `null` to stop sending a scope parameter.
             */
            scope?: string | null;
            /**
             * Client-secret updates for the existing token endpoint authentication method.
             */
            token_endpoint_auth?: CredentialsAPI.McpOauthTokenEndpointAuthRotateParam | null;
        }
    }
    /**
     * Replace the bearer token for the credential's MCP server.
     */
    interface RotateVaultCredentialAuthParamStaticBearer {
        /**
         * The replacement bearer token. This secret is never returned in credential
         * resources.
         */
        token: string;
        /**
         * The type of the object. Always `static_bearer`.
         */
        type: 'static_bearer';
    }
    /**
     * Replace the secret for an OpenAI-hosted environment credential. The environment
     * variable name and networking configuration remain unchanged.
     */
    interface RotateVaultCredentialAuthParamEnvironmentVariable {
        /**
         * The write-only replacement secret. Never returned in credential resources or
         * supplied directly to sandbox code. Must be nonempty and must not contain
         * carriage returns, newlines, or NUL bytes.
         */
        secret_value: string;
        /**
         * The type of the object. Always `environment_variable`.
         */
        type: 'environment_variable';
    }
}
/**
 * Confirmation that a vault credential was deleted.
 */
export interface CredentialDeleted {
    /**
     * The ID of the deleted credential.
     */
    id: string;
    /**
     * Whether the resource was deleted. Always `true`.
     */
    deleted: boolean;
    /**
     * The object type. Always `vault.credential.deleted`.
     */
    object: 'vault.credential.deleted';
}
/**
 * Destination permissions for an environment-variable credential. These do not
 * grant network access to the environment.
 */
export type CredentialNetworking = CredentialNetworking.VaultCredentialNetworkingResourceUnrestricted | CredentialNetworking.VaultCredentialNetworkingResourceLimited;
export declare namespace CredentialNetworking {
    /**
     * Allows substitution for destinations permitted by the environment network
     * policy. Requires `environment.network.access` to be `restricted`, with explicit
     * `allowed_domains`.
     */
    interface VaultCredentialNetworkingResourceUnrestricted {
        /**
         * The type of the object. Always `unrestricted`.
         */
        type: 'unrestricted';
    }
    /**
     * Allows substitution only for the listed hosts. The environment network policy
     * must also allow these hosts.
     */
    interface VaultCredentialNetworkingResourceLimited {
        /**
         * The 1 to 16 distinct allowed hostnames or IPv4 addresses, normalized to
         * lowercase. Entries contain no scheme, path, port, or wildcard. IPv6 addresses
         * are not supported.
         */
        allowed_hosts: Array<string>;
        /**
         * The type of the object. Always `limited`.
         */
        type: 'limited';
    }
}
/**
 * Destination permissions for an environment-variable credential. These do not
 * grant network access to the environment.
 */
export type CredentialNetworkingParam = CredentialNetworkingParam.VaultCredentialNetworkingParamUnrestricted | CredentialNetworkingParam.VaultCredentialNetworkingParamLimited;
export declare namespace CredentialNetworkingParam {
    /**
     * Allows substitution for destinations permitted by the environment network
     * policy. Requires `environment.network.access` to be `restricted`, with explicit
     * `allowed_domains`.
     */
    interface VaultCredentialNetworkingParamUnrestricted {
        /**
         * The type of the object. Always `unrestricted`.
         */
        type: 'unrestricted';
    }
    /**
     * Allows substitution only for the listed hosts. The environment network policy
     * must also allow these hosts.
     */
    interface VaultCredentialNetworkingParamLimited {
        /**
         * The 1 to 16 distinct allowed hostnames or IPv4 addresses, normalized to
         * lowercase. Entries contain no scheme, path, port, or wildcard. IPv6 addresses
         * are not supported.
         */
        allowed_hosts: Array<string>;
        /**
         * The type of the object. Always `limited`.
         */
        type: 'limited';
    }
}
/**
 * The client authentication method used for OAuth token refresh.
 */
export type McpOauthTokenEndpointAuth = McpOauthTokenEndpointAuth.McpOauthTokenEndpointAuthResourceNone | McpOauthTokenEndpointAuth.McpOauthTokenEndpointAuthResourceClientSecretBasic | McpOauthTokenEndpointAuth.McpOauthTokenEndpointAuthResourceClientSecretPost;
export declare namespace McpOauthTokenEndpointAuth {
    /**
     * Sends the client ID without a client secret.
     */
    interface McpOauthTokenEndpointAuthResourceNone {
        /**
         * The type of the object. Always `none`.
         */
        type: 'none';
    }
    /**
     * Sends the client ID and secret using HTTP Basic authentication.
     */
    interface McpOauthTokenEndpointAuthResourceClientSecretBasic {
        /**
         * The type of the object. Always `client_secret_basic`.
         */
        type: 'client_secret_basic';
    }
    /**
     * Sends the client ID and secret in the token request body.
     */
    interface McpOauthTokenEndpointAuthResourceClientSecretPost {
        /**
         * The type of the object. Always `client_secret_post`.
         */
        type: 'client_secret_post';
    }
}
/**
 * Client authentication credentials for OAuth token refresh.
 */
export type McpOauthTokenEndpointAuthCreateParam = McpOauthTokenEndpointAuthCreateParam.CreateMcpOauthTokenEndpointAuthParamNone | McpOauthTokenEndpointAuthCreateParam.CreateMcpOauthTokenEndpointAuthParamClientSecretBasic | McpOauthTokenEndpointAuthCreateParam.CreateMcpOauthTokenEndpointAuthParamClientSecretPost;
export declare namespace McpOauthTokenEndpointAuthCreateParam {
    /**
     * Sends the client ID without a client secret.
     */
    interface CreateMcpOauthTokenEndpointAuthParamNone {
        /**
         * The type of the object. Always `none`.
         */
        type: 'none';
    }
    /**
     * Sends the client ID and secret using HTTP Basic authentication.
     */
    interface CreateMcpOauthTokenEndpointAuthParamClientSecretBasic {
        /**
         * The OAuth client secret to store. Never returned in credential resources.
         */
        client_secret: string;
        /**
         * The type of the object. Always `client_secret_basic`.
         */
        type: 'client_secret_basic';
    }
    /**
     * Sends the client ID and secret in the token request body.
     */
    interface CreateMcpOauthTokenEndpointAuthParamClientSecretPost {
        /**
         * The OAuth client secret to store. Never returned in credential resources.
         */
        client_secret: string;
        /**
         * The type of the object. Always `client_secret_post`.
         */
        type: 'client_secret_post';
    }
}
/**
 * Client-secret updates that preserve the credential's OAuth authentication
 * method.
 */
export type McpOauthTokenEndpointAuthRotateParam = McpOauthTokenEndpointAuthRotateParam.RotateMcpOauthTokenEndpointAuthParamClientSecretBasic | McpOauthTokenEndpointAuthRotateParam.RotateMcpOauthTokenEndpointAuthParamClientSecretPost;
export declare namespace McpOauthTokenEndpointAuthRotateParam {
    /**
     * Updates credentials sent using HTTP Basic authentication.
     */
    interface RotateMcpOauthTokenEndpointAuthParamClientSecretBasic {
        /**
         * The type of the object. Always `client_secret_basic`.
         */
        type: 'client_secret_basic';
        /**
         * The replacement OAuth client secret. Omit or pass `null` to keep the stored
         * secret. This secret is never returned in resources.
         */
        client_secret?: string | null;
    }
    /**
     * Updates credentials sent in the token request body.
     */
    interface RotateMcpOauthTokenEndpointAuthParamClientSecretPost {
        /**
         * The type of the object. Always `client_secret_post`.
         */
        type: 'client_secret_post';
        /**
         * The replacement OAuth client secret. Omit or pass `null` to keep the stored
         * secret. This secret is never returned in resources.
         */
        client_secret?: string | null;
    }
}
export interface CredentialCreateParams {
    /**
     * The authentication method and write-only secret values to store.
     */
    auth: CredentialAuthCreateParam;
    /**
     * The name is trimmed before storage. It must contain 1 to 256 UTF-8 bytes after
     * trimming.
     */
    name: string;
    /**
     * Up to 16 string key-value pairs, with keys up to 64 and values up to 512
     * characters. Defaults to an empty map.
     */
    metadata?: {
        [key: string]: string;
    };
}
export interface CredentialRetrieveParams {
    /**
     * The ID of the vault.
     */
    vault_id: string;
}
export interface CredentialUpdateParams {
    /**
     * Path param: The ID of the vault.
     */
    vault_id: string;
    /**
     * Body param: Replacement values for the credential's existing authentication
     * method.
     */
    auth?: CredentialAuthRotateParam;
    /**
     * Body param: Replaces all metadata. Omit to preserve it, or pass {} to clear it.
     * Up to 16 string key-value pairs, with keys up to 64 and values up to 512
     * characters.
     */
    metadata?: {
        [key: string]: string;
    };
}
export interface CredentialListParams extends CursorPageParams {
    /**
     * Exact string matches supplied as `metadata[key]=value`. All supplied pairs must
     * match. Up to 16 pairs, with keys from 1 to 64 characters and values up to 512
     * characters. Filtering is eventually consistent; metadata changes may take time
     * to appear.
     */
    metadata?: {
        [key: string]: string;
    };
    /**
     * The order in which resources are returned. Defaults to `desc`.
     *
     * - `asc` - Returns resources in ascending order.
     * - `desc` - Returns resources in descending order.
     */
    order?: 'asc' | 'desc';
    /**
     * Filter by one status or a list, such as `status=active` or
     * `status[]=active&status[]=archived`. Both statuses are included by default.
     */
    status?: VaultsAPI.VaultStatusFilter;
}
export interface CredentialDeleteParams {
    /**
     * The ID of the vault.
     */
    vault_id: string;
}
export declare namespace Credentials {
    export { type Credential as Credential, type CredentialAuth as CredentialAuth, type CredentialAuthCreateParam as CredentialAuthCreateParam, type CredentialAuthRotateParam as CredentialAuthRotateParam, type CredentialDeleted as CredentialDeleted, type CredentialNetworking as CredentialNetworking, type CredentialNetworkingParam as CredentialNetworkingParam, type McpOauthTokenEndpointAuth as McpOauthTokenEndpointAuth, type McpOauthTokenEndpointAuthCreateParam as McpOauthTokenEndpointAuthCreateParam, type McpOauthTokenEndpointAuthRotateParam as McpOauthTokenEndpointAuthRotateParam, type CredentialsPage as CredentialsPage, type CredentialCreateParams as CredentialCreateParams, type CredentialRetrieveParams as CredentialRetrieveParams, type CredentialUpdateParams as CredentialUpdateParams, type CredentialListParams as CredentialListParams, type CredentialDeleteParams as CredentialDeleteParams, };
}
//# sourceMappingURL=credentials.d.ts.map