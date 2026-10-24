// File generated from our OpenAPI spec by Castiron. See CONTRIBUTING.md for details.
import { APIResource } from "../../../../core/resource.mjs";
import { path } from "../../../../internal/utils/path.mjs";
function resolveResourceRequestOptions(options, buildOptions) {
    return Promise.resolve(options).then(buildOptions);
}
export class ModelPermissions extends APIResource {
    /**
     * Returns model permissions for a project.
     *
     * @example
     * ```ts
     * const projectModelPermissions =
     *   await client.admin.organization.projects.modelPermissions.retrieve(
     *     'project_id',
     *   );
     * ```
     */
    retrieve(projectID, options) {
        return this._client.get(path `/organization/projects/${projectID}/model_permissions`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    /**
     * Updates model permissions for a project.
     *
     * @example
     * ```ts
     * const projectModelPermissions =
     *   await client.admin.organization.projects.modelPermissions.update(
     *     'project_id',
     *     { mode: 'allow_list', model_ids: ['string'] },
     *   );
     * ```
     */
    update(projectID, body, options) {
        return this._client.post(path `/organization/projects/${projectID}/model_permissions`, resolveResourceRequestOptions(options, (options) => ({
            body,
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
    /**
     * Deletes model permissions for a project.
     *
     * @example
     * ```ts
     * const projectModelPermissionsDeleted =
     *   await client.admin.organization.projects.modelPermissions.delete(
     *     'project_id',
     *   );
     * ```
     */
    delete(projectID, options) {
        return this._client.delete(path `/organization/projects/${projectID}/model_permissions`, resolveResourceRequestOptions(options, (options) => ({
            ...options,
            __security: { adminAPIKeyAuth: true },
        })));
    }
}
//# sourceMappingURL=model-permissions.mjs.map