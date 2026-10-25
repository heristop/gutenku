import { APIResource } from "../../../../core/resource.js";
import * as AgentsAPI from "../agents.js";
import * as FilesAPI from "./files.js";
import { EnvironmentFile, EnvironmentFilesPage, FileCreateParams, FileListParams, Files } from "./files.js";
import * as TemplatesAPI from "./templates.js";
import { EnvironmentTemplate, EnvironmentTemplateDeleted, EnvironmentTemplatesPage, TemplateCreateParams, TemplateListParams, TemplateUpdateParams, Templates } from "./templates.js";
import { APIPromise } from "../../../../core/api-promise.js";
import { CursorPage, type CursorPageParams, PagePromise } from "../../../../core/pagination.js";
import { RequestOptions } from "../../../../internal/request-options.js";
import type { OpenAI } from "../../../../client.js";
import type { FinalRequestOptions } from "../../../../internal/request-options.js";
export declare class Environments extends APIResource {
    files: FilesAPI.Files;
    templates: TemplatesAPI.Templates;
    /**
     * Creates an OpenAI-hosted environment before creating a session. Requires access
     * to the prewarming beta.
     *
     * @example
     * ```ts
     * const environmentInfo =
     *   await client.beta.agents.environments.create({
     *     environment: { type: 'openai_hosted' },
     *   });
     * ```
     */
    create(params: EnvironmentCreateParams, options?: RequestOptions): APIPromise<EnvironmentInfo>;
    /**
     * Retrieves an execution environment's connection status and safe installed
     * metadata. See
     * [environment lifecycle](https://developers.openai.com/api/docs/guides/agents-api/environments/lifecycle).
     *
     * @example
     * ```ts
     * const environmentInfo =
     *   await client.beta.agents.environments.retrieve(
     *     'environment_id',
     *   );
     * ```
     */
    retrieve(environmentID: string, options?: RequestOptions): APIPromise<EnvironmentInfo>;
    /**
     * Lists OpenAI-hosted environments owned by the authenticated principal. Requires
     * access to the prewarming beta.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const environmentInfo of client.beta.agents.environments.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: (EnvironmentListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<EnvironmentInfosPage, EnvironmentInfo>;
    list(options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<EnvironmentInfosPage, EnvironmentInfo>;
}
export declare class EnvironmentInfosPage extends CursorPage<EnvironmentInfo> {
    object: 'list';
    first_id: string | null;
    last_id: string | null;
    constructor(client: OpenAI, response: Response, body: {
        data: EnvironmentInfo[];
        has_more: boolean;
        object: 'list';
        first_id: string | null;
        last_id: string | null;
    }, options: FinalRequestOptions);
}
/**
 * Safe metadata for a first-class execution environment.
 */
export interface EnvironmentInfo {
    /**
     * The ID of the environment.
     */
    id: string;
    /**
     * Files installed in the environment, without their contents.
     */
    files: Array<AgentsAPI.HostedEnvironmentFile>;
    /**
     * The object type. Always `agent.environment`.
     */
    object: 'agent.environment';
    /**
     * Plugins installed in the environment, without their archive contents.
     */
    plugins: Array<AgentsAPI.HostedPlugin>;
    /**
     * Skills installed in the environment, without their archive contents.
     */
    skills: Array<AgentsAPI.HostedSkill>;
    /**
     * The current environment connection status.
     *
     * - `ready` - Provisioning succeeded and the environment is available for
     *   attachment or use.
     * - `suspended` - The sandbox is stopped and can be resumed from its private
     *   checkpoint.
     */
    status: 'pending' | 'ready' | 'connected' | 'disconnected' | 'suspended' | 'expired' | 'failed';
    /**
     * Whether the environment is hosted by OpenAI or by the application.
     */
    type: 'openai_hosted' | 'self_hosted';
}
export interface EnvironmentCreateParams {
    /**
     * Body param: The required hosting type and its configuration.
     */
    environment: EnvironmentCreateParams.Environment;
    /**
     * Body param: The IDs of up to 10 vaults made available to an OpenAI-hosted
     * environment.
     */
    vault_ids?: Array<string> | null;
    /**
     * Header param: Deduplicates creation for 24 hours within the authenticated
     * organization, project, and creator. Retry the same JSON parameters with the same
     * key to retrieve the original environment in its current state. Different
     * parameters or an incomplete hosted creation return 409. Deleted environments are
     * not recreated. After retention expires, the key may create a new environment.
     * Without this header, each request creates a new environment.
     */
    'Idempotency-Key'?: string;
}
export declare namespace EnvironmentCreateParams {
    /**
     * The required hosting type and its configuration.
     */
    interface Environment {
        /**
         * The type of the object. Always `openai_hosted`.
         */
        type: 'openai_hosted';
        /**
         * Directories that contain capabilities exposed to the agent. Defaults to an empty
         * list.
         */
        capability_directories?: Array<string> | null;
        /**
         * Desktop provisioning. Omission or null inherits the template setting, or
         * defaults to disabled.
         */
        desktop?: Environment.Desktop | null;
        /**
         * Environment variables made available to the agent.
         */
        env?: {
            [key: string]: string;
        } | null;
        /**
         * A reusable hosted template applied before inline configuration. Omitted fields
         * inherit the template; network overrides cannot broaden its policy.
         */
        environment_template_id?: string;
        /**
         * Files available before the agent starts. Defaults to an empty list.
         */
        files?: Array<AgentsAPI.HostedEnvironmentFileParam> | null;
        /**
         * Network access policy for the environment. If omitted, the API version
         * determines whether network access is enabled or disabled.
         */
        network?: Environment.Network | null;
        /**
         * Packages to install in the environment. Defaults to empty package lists.
         */
        packages?: Environment.Packages | null;
        /**
         * Plugins provided as inline ZIP archives. Defaults to an empty list.
         */
        plugins?: Array<AgentsAPI.HostedPluginParam> | null;
        /**
         * Ordered, confidential setup commands. Command bodies are never returned.
         */
        setup_commands?: Array<AgentsAPI.SetupCommandParam> | null;
        /**
         * Skills referenced by ID or provided as inline ZIP archives. Defaults to an empty
         * list.
         */
        skills?: Array<AgentsAPI.HostedSkillParam> | null;
    }
    namespace Environment {
        /**
         * Desktop provisioning. Omission or null inherits the template setting, or
         * defaults to disabled.
         */
        interface Desktop {
            /**
             * Whether to provision the desktop and its browser proxy.
             */
            enabled: boolean;
        }
        /**
         * Network access policy for the environment. If omitted, the API version
         * determines whether network access is enabled or disabled.
         */
        interface Network {
            /**
             * The environment's network access mode.
             *
             * - `enabled` - Allows unrestricted network access.
             * - `disabled` - Disables network access.
             * - `restricted` - Applies the configured domain restrictions.
             */
            access: 'enabled' | 'disabled' | 'restricted';
            /**
             * Domains the environment may access when network access is restricted.
             */
            allowed_domains?: Array<string> | null;
            /**
             * Domains blocked for both executor and browser when access is restricted. A
             * nonempty list requires `access: restricted` and cannot be combined with nonempty
             * `allowed_domains`. Wildcard domains are not supported.
             */
            blocked_domains?: Array<string> | null;
        }
        /**
         * Packages to install in the environment. Defaults to empty package lists.
         */
        interface Packages {
            /**
             * npm packages to install globally. Defaults to an empty list.
             */
            npm?: Array<string> | null;
            /**
             * Python packages to install. Defaults to an empty list.
             */
            python?: Array<string> | null;
            /**
             * System packages to install. Defaults to an empty list.
             */
            system?: Array<string> | null;
        }
    }
}
export interface EnvironmentListParams extends CursorPageParams {
    /**
     * The order in which resources are returned. Defaults to `desc`.
     *
     * - `asc` - Returns resources in ascending order.
     * - `desc` - Returns resources in descending order.
     */
    order?: 'asc' | 'desc';
    /**
     * The hosting type to list. Defaults to `openai_hosted`.
     */
    type?: 'openai_hosted';
}
export declare namespace Environments {
    export { type EnvironmentInfo as EnvironmentInfo, type EnvironmentInfosPage as EnvironmentInfosPage, type EnvironmentCreateParams as EnvironmentCreateParams, type EnvironmentListParams as EnvironmentListParams, };
    export { Files as Files, type EnvironmentFile as EnvironmentFile, type EnvironmentFilesPage as EnvironmentFilesPage, type FileCreateParams as FileCreateParams, type FileListParams as FileListParams, };
    export { Templates as Templates, type EnvironmentTemplate as EnvironmentTemplate, type EnvironmentTemplateDeleted as EnvironmentTemplateDeleted, type EnvironmentTemplatesPage as EnvironmentTemplatesPage, type TemplateCreateParams as TemplateCreateParams, type TemplateUpdateParams as TemplateUpdateParams, type TemplateListParams as TemplateListParams, };
}
//# sourceMappingURL=environments.d.ts.map