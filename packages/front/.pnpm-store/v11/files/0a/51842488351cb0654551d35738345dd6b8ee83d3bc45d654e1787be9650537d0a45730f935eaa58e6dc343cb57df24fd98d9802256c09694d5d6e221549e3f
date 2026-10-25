import { APIResource } from "../../../../core/resource.mjs";
import { APIPromise } from "../../../../core/api-promise.mjs";
import { PagePromise, TokenPage, type TokenPageParams } from "../../../../core/pagination.mjs";
import { RequestOptions } from "../../../../internal/request-options.mjs";
import { type PreparedAgentFiles } from "../../../../lib/beta/agents/files.mjs";
import type { Uploadable } from "../../../../internal/uploads.mjs";
export declare class Files extends APIResource {
    /**
     * Copies inline bytes or a Files API file into a connected execution environment,
     * replacing an existing regular file at the same path. Upload between turns and
     * wait for success before starting the next turn. See
     * [environment files](https://developers.openai.com/api/docs/guides/agents-api/environments/files).
     *
     * @example
     * ```ts
     * const environmentFile =
     *   await client.beta.agents.environments.files.create(
     *     'environment_id',
     *     {
     *       type: 'inline',
     *       path: '/workspace/example.txt',
     *       data: 'SGVsbG8K',
     *     },
     *   );
     * ```
     */
    create(environmentID: string, body: FileCreateParams, options?: RequestOptions): APIPromise<EnvironmentFile>;
    /**
     * Lists live files on a connected execution environment with optional directory
     * filtering and opaque cursor pagination. See
     * [environment files](https://developers.openai.com/api/docs/guides/agents-api/environments/files).
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const environmentFile of client.beta.agents.environments.files.list(
     *   'environment_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(environmentID: string, query?: FileListParams | null | undefined, options?: RequestOptions): PagePromise<EnvironmentFilesPage, EnvironmentFile>;
    /** Beta: prepare initial hosted file references; uploaded Files API objects remain caller-owned. */
    prepare(files: Record<string, Uploadable>, options?: RequestOptions): Promise<PreparedAgentFiles>;
    /** Beta: upload one local file and stage its reference in a live environment. */
    upload(environmentID: string, params: {
        file: Uploadable;
        path: string;
    }, options?: RequestOptions): Promise<{
        uploadedFile: import("../../../index.mjs").FileObject;
        environmentFile: EnvironmentFile;
    }>;
}
export type EnvironmentFilesPage = TokenPage<EnvironmentFile>;
/**
 * A live file in an execution environment.
 */
export interface EnvironmentFile {
    /**
     * The ID of the environment containing this file.
     */
    environment_id: string;
    /**
     * The object type. Always `agent.environment.file`.
     */
    object: 'agent.environment.file';
    /**
     * The absolute file path inside the environment's workspace.
     */
    path: string;
    /**
     * The file size in bytes.
     */
    size_bytes: number;
}
export type FileCreateParams = FileCreateParams.HostedEnvironmentFileParamFileID | FileCreateParams.HostedEnvironmentFileParamInline;
export declare namespace FileCreateParams {
    interface HostedEnvironmentFileParamFileID {
        /**
         * The ID of the uploaded file.
         */
        file_id: string;
        /**
         * The absolute destination path inside `/workspace`.
         */
        path: string;
        /**
         * The type of the object. Always `file_id`.
         */
        type: 'file_id';
    }
    interface HostedEnvironmentFileParamInline {
        /**
         * The standard-base64-encoded file contents.
         */
        data: string;
        /**
         * The absolute destination path inside `/workspace`.
         */
        path: string;
        /**
         * The type of the object. Always `inline`.
         */
        type: 'inline';
    }
}
export interface FileListParams extends Omit<TokenPageParams, 'limit'> {
    /**
     * The maximum number of files to return, between 1 and 100.
     */
    limit?: number | null;
    /**
     * Sort by case-sensitive path components. Defaults to descending.
     *
     * - `asc` - Returns resources in ascending order.
     * - `desc` - Returns resources in descending order.
     */
    order?: 'asc' | 'desc';
    /**
     * Restrict the listing to this absolute workspace directory.
     */
    path?: string | null;
}
export declare namespace Files {
    export { type EnvironmentFile as EnvironmentFile, type EnvironmentFilesPage as EnvironmentFilesPage, type FileCreateParams as FileCreateParams, type FileListParams as FileListParams, };
}
//# sourceMappingURL=files.d.mts.map