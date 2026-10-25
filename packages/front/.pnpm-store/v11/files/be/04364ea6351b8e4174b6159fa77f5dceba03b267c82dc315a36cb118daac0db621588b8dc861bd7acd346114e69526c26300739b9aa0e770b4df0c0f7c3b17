import { APIResource } from "../../../../core/resource.js";
import { APIPromise } from "../../../../core/api-promise.js";
import { ConversationCursorPage, type ConversationCursorPageParams, PagePromise } from "../../../../core/pagination.js";
import { RequestOptions } from "../../../../internal/request-options.js";
export declare class APIKeys extends APIResource {
    /**
     * Retrieves an API key in the project.
     *
     * @example
     * ```ts
     * const projectAPIKey =
     *   await client.admin.organization.projects.apiKeys.retrieve(
     *     'api_key_id',
     *     { project_id: 'project_id' },
     *   );
     * ```
     */
    retrieve(apiKeyID: string, params: APIKeyRetrieveParams, options?: RequestOptions): APIPromise<ProjectAPIKey>;
    /**
     * Updates the scopes and/or expiration of an existing API key in the project,
     * including a service-account-owned key. Requires permission to write project API
     * keys.
     *
     * Provide at least one of `scopes` or `expires_in_seconds`. Omitted fields stay
     * unchanged; neither field accepts `null`. Both changes are saved together.
     *
     * `scopes` replaces the key's scope restrictions using the same scope identifiers
     * as the dashboard. An empty array means All permissions, subject to the owner's
     * effective access; it does not mean no access. Use `["api.all.read"]` for
     * read-only access or specific scopes such as `["api.files.read"]` for restricted
     * access. This does not change user or service-account roles or grant admin
     * permissions. Scope changes follow the same authentication-cache propagation as
     * dashboard edits.
     *
     * Provide `expires_in_seconds` to set the expiration relative to this request. The
     * value must satisfy the organization's and project's expiry policies. Expired
     * keys cannot be updated. Retrying resets the expiration relative to the new
     * request. The response contains only the redacted key, not its secret.
     *
     * @example
     * ```ts
     * const projectAPIKey =
     *   await client.admin.organization.projects.apiKeys.update(
     *     'api_key_id',
     *     {
     *       project_id: 'project_id',
     *       scopes: ['api.all.read'],
     *     },
     *   );
     * ```
     */
    update(apiKeyID: string, params: APIKeyUpdateParams, options?: RequestOptions): APIPromise<ProjectAPIKey>;
    /**
     * Returns a list of API keys in the project.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const projectAPIKey of client.admin.organization.projects.apiKeys.list(
     *   'project_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(projectID: string, query?: (APIKeyListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<ProjectAPIKeysPage, ProjectAPIKey>;
    list(projectID: string, options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<ProjectAPIKeysPage, ProjectAPIKey>;
    /**
     * Deletes an API key from the project, including keys owned by service accounts.
     *
     * Requires permission to write project API keys. Deleting a service-account key
     * does not delete the service account or its other keys.
     *
     * Returns confirmation of the key deletion.
     *
     * @example
     * ```ts
     * const apiKey =
     *   await client.admin.organization.projects.apiKeys.delete(
     *     'api_key_id',
     *     { project_id: 'project_id' },
     *   );
     * ```
     */
    delete(apiKeyID: string, params: APIKeyDeleteParams, options?: RequestOptions): APIPromise<APIKeyDeleteResponse>;
}
export type ProjectAPIKeysPage = ConversationCursorPage<ProjectAPIKey>;
/**
 * Represents an individual API key in a project.
 */
export interface ProjectAPIKey {
    /**
     * The identifier, which can be referenced in API endpoints
     */
    id: string;
    /**
     * The Unix timestamp (in seconds) of when the API key was created
     */
    created_at: number;
    /**
     * The Unix timestamp (in seconds) of when the API key was last used.
     */
    last_used_at: number | null;
    /**
     * The name of the API key
     */
    name: string;
    /**
     * The object type, which is always `organization.project.api_key`
     */
    object: 'organization.project.api_key';
    owner: ProjectAPIKey.Owner;
    /**
     * Whether the API key's owner currently has effective access to the project.
     */
    owner_project_access: 'active' | 'inactive';
    /**
     * The redacted value of the API key
     */
    redacted_value: string;
    /**
     * The Unix timestamp (in seconds) when the API key expires, or null if it does not
     * expire.
     */
    expires_at?: number | null;
}
export declare namespace ProjectAPIKey {
    interface Owner {
        /**
         * The service account that owns a project API key.
         */
        service_account?: Owner.ServiceAccount;
        /**
         * `user` or `service_account`
         */
        type?: 'user' | 'service_account';
        /**
         * The user that owns a project API key.
         */
        user?: Owner.User;
    }
    namespace Owner {
        /**
         * The service account that owns a project API key.
         */
        interface ServiceAccount {
            /**
             * The identifier, which can be referenced in API endpoints
             */
            id: string;
            /**
             * The Unix timestamp (in seconds) of when the service account was created.
             */
            created_at: number;
            /**
             * The name of the service account.
             */
            name: string;
            /**
             * The service account's project role.
             */
            role: string;
        }
        /**
         * The user that owns a project API key.
         */
        interface User {
            /**
             * The identifier, which can be referenced in API endpoints
             */
            id: string;
            /**
             * The Unix timestamp (in seconds) of when the user was created.
             */
            created_at: number;
            /**
             * The email address of the user.
             */
            email: string;
            /**
             * The name of the user.
             */
            name: string;
            /**
             * The user's project role.
             */
            role: string;
        }
    }
}
export interface APIKeyDeleteResponse {
    id: string;
    deleted: boolean;
    object: 'organization.project.api_key.deleted';
}
export interface APIKeyRetrieveParams {
    /**
     * The ID of the project.
     */
    project_id: string;
}
export interface APIKeyUpdateParams {
    /**
     * Path param: The ID of the project.
     */
    project_id: string;
    /**
     * Body param: Number of seconds from this request until the API key expires. Must
     * comply with the organization and project expiry policies. Expired keys cannot be
     * updated. Retrying resets the expiry relative to the new request. Omit to keep
     * the current expiration.
     */
    expires_in_seconds?: number;
    /**
     * Body param: Replace the API key scope restrictions. Omit to leave scopes
     * unchanged. An empty array removes key restrictions (All permissions), subject to
     * the owner's effective permissions. Use ["api.all.read"] for read-only access.
     * Scopes do not change the owner's roles or grant administrative permissions.
     */
    scopes?: Array<string>;
}
export interface APIKeyListParams extends ConversationCursorPageParams {
    /**
     * Filter API keys by whether the owner currently has effective access to the
     * project. Use `active` for owners with access, `inactive` for owners without
     * access, or `any` for all enabled project API keys. If omitted, the endpoint
     * applies its existing membership-based visibility rules, which may exclude some
     * enabled keys.
     */
    owner_project_access?: 'active' | 'inactive' | 'any';
}
export interface APIKeyDeleteParams {
    /**
     * The ID of the project.
     */
    project_id: string;
}
export declare namespace APIKeys {
    export { type ProjectAPIKey as ProjectAPIKey, type APIKeyDeleteResponse as APIKeyDeleteResponse, type ProjectAPIKeysPage as ProjectAPIKeysPage, type APIKeyRetrieveParams as APIKeyRetrieveParams, type APIKeyUpdateParams as APIKeyUpdateParams, type APIKeyListParams as APIKeyListParams, type APIKeyDeleteParams as APIKeyDeleteParams, };
}
//# sourceMappingURL=api-keys.d.ts.map