import { APIResource } from "../../../core/resource.js";
import { APIPromise } from "../../../core/api-promise.js";
import { CursorPage, type CursorPageParams, PagePromise } from "../../../core/pagination.js";
import { RequestOptions } from "../../../internal/request-options.js";
export declare class ExternalStorage extends APIResource {
    /**
     * Register one customer-managed external storage configuration.
     *
     * @example
     * ```ts
     * const externalStorageConfiguration =
     *   await client.admin.organization.externalStorage.create({
     *     project_id: 'proj_123',
     *     provider: {
     *       bucket: 'bucket',
     *       role_arn: 'role_arn',
     *       type: 'aws',
     *     },
     *   });
     * ```
     */
    create(body: ExternalStorageCreateParams, options?: RequestOptions): APIPromise<ExternalStorageConfiguration>;
    /**
     * Get one customer-managed external storage configuration.
     *
     * @example
     * ```ts
     * const externalStorageConfiguration =
     *   await client.admin.organization.externalStorage.retrieve(
     *     'extstorage_123',
     *   );
     * ```
     */
    retrieve(externalStorageID: string, options?: RequestOptions): APIPromise<ExternalStorageConfiguration>;
    /**
     * List the organization's customer-managed external storage configurations.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const externalStorageConfiguration of client.admin.organization.externalStorage.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: (ExternalStorageListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<ExternalStorageConfigurationsPage, ExternalStorageConfiguration>;
    list(options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<ExternalStorageConfigurationsPage, ExternalStorageConfiguration>;
    /**
     * Disconnect a customer-managed external storage configuration. Removing the
     * project's last configuration restores organization-default retention if
     * customer-managed retention was active. Repeating a deletion also completes any
     * interrupted retention update. Cloud storage is unchanged.
     *
     * @example
     * ```ts
     * const externalStorageDeleted =
     *   await client.admin.organization.externalStorage.delete(
     *     'extstorage_123',
     *   );
     * ```
     */
    delete(externalStorageID: string, options?: RequestOptions): APIPromise<ExternalStorageDeleted>;
    /**
     * Validate one customer-managed external storage configuration.
     *
     * @example
     * ```ts
     * const externalStorageConfiguration =
     *   await client.admin.organization.externalStorage.validate(
     *     'extstorage_123',
     *   );
     * ```
     */
    validate(externalStorageID: string, options?: RequestOptions): APIPromise<ExternalStorageConfiguration>;
}
export type ExternalStorageConfigurationsPage = CursorPage<ExternalStorageConfiguration>;
export interface AwsExternalStorageProvider {
    account_id: string;
    bucket: string;
    external_id: string;
    region: string;
    role_arn: string;
    type: 'aws';
}
export interface AzureExternalStorageProvider {
    account_name: string;
    container: string;
    region: string;
    resource_group: string;
    subscription_id: string;
    tenant_id: string;
    type: 'azure';
}
export interface ExternalStorageConfiguration {
    id: string;
    created_at: number;
    geography: string;
    object: 'organization.external_storage';
    project_id: string;
    provider: AwsExternalStorageProvider | AzureExternalStorageProvider | GcpExternalStorageProvider | OciExternalStorageProvider;
    status: 'pending' | 'validated' | 'degraded' | 'unhealthy';
}
export interface ExternalStorageDeleted {
    id: string;
    deleted: boolean;
    object: 'organization.external_storage.deleted';
}
export interface GcpExternalStorageProvider {
    audience: string;
    bucket: string;
    region: string;
    type: 'gcp';
    workload_identity_pool_id: string;
    workload_identity_project_number: string;
    workload_identity_provider_id: string;
}
export interface OciExternalStorageProvider {
    bucket: string;
    region: string;
    tenancy_ocid: string;
    type: 'oci';
}
export interface ExternalStorageCreateParams {
    project_id: string;
    provider: ExternalStorageCreateParams.Aws | ExternalStorageCreateParams.Azure | ExternalStorageCreateParams.Gcp | ExternalStorageCreateParams.Oci;
}
export declare namespace ExternalStorageCreateParams {
    interface Aws {
        bucket: string;
        role_arn: string;
        type: 'aws';
    }
    interface Azure {
        account_name: string;
        container: string;
        resource_group: string;
        subscription_id: string;
        tenant_id: string;
        type: 'azure';
    }
    interface Gcp {
        bucket: string;
        type: 'gcp';
        workload_identity_pool_id: string;
        workload_identity_project_number: string;
        workload_identity_provider_id: string;
    }
    interface Oci {
        bucket: string;
        region: string;
        tenancy_ocid: string;
        type: 'oci';
    }
}
export interface ExternalStorageListParams extends Omit<CursorPageParams, 'after'> {
    /**
     * Return external storage configurations after this ID.
     */
    after?: string | null;
    order?: 'asc' | 'desc';
    project_id?: string | null;
}
export declare namespace ExternalStorage {
    export { type AwsExternalStorageProvider as AwsExternalStorageProvider, type AzureExternalStorageProvider as AzureExternalStorageProvider, type ExternalStorageConfiguration as ExternalStorageConfiguration, type ExternalStorageDeleted as ExternalStorageDeleted, type GcpExternalStorageProvider as GcpExternalStorageProvider, type OciExternalStorageProvider as OciExternalStorageProvider, type ExternalStorageConfigurationsPage as ExternalStorageConfigurationsPage, type ExternalStorageCreateParams as ExternalStorageCreateParams, type ExternalStorageListParams as ExternalStorageListParams, };
}
//# sourceMappingURL=external-storage.d.ts.map