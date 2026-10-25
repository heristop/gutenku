// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../../core/resource.mjs";
import { TokenPage } from "../../../../core/pagination.mjs";
import { buildHeaders } from "../../../../internal/headers.mjs";
import { path } from "../../../../internal/utils/path.mjs";
import { prepareAgentFiles, uploadAgentFile, } from "../../../../lib/beta/agents/files.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class Files extends APIResource {
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
    create(environmentID, body, options) {
        return this._client.post(path `/agents/environments/${environmentID}/files`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
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
    list(environmentID, query = {}, options) {
        return this._client.getAPIList(path `/agents/environments/${environmentID}/files`, (TokenPage), resolveResourceRequestOptions(options, (options) => ({
            query,
            ...options,
            headers: buildHeaders([{ 'OpenAI-Beta': 'agents=v1' }, options?.headers]),
            __security: { bearerAuth: true },
        })));
    }
    /** Beta: prepare initial hosted file references; uploaded Files API objects remain caller-owned. */
    prepare(files, options) {
        return prepareAgentFiles(this._client, files, options);
    }
    /** Beta: upload one local file and stage its reference in a live environment. */
    upload(environmentID, params, options) {
        return uploadAgentFile(this._client, this, environmentID, params, options);
    }
}
//# sourceMappingURL=files.mjs.map