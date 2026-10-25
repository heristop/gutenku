import { APIResource } from "../../core/resource.js";
import { APIPromise } from "../../core/api-promise.js";
import { RequestOptions } from "../../internal/request-options.js";
export declare class Cases extends APIResource {
    /**
     * Get a safety case by ID.
     */
    retrieve(id: string, options?: RequestOptions): APIPromise<SafetyCase>;
}
export interface SafetyCase {
    id: string;
    created_at: number;
    entity_identifier: string;
    notice: SafetyCase.Notice;
    object: 'safety.case';
    reason: string | null;
}
export declare namespace SafetyCase {
    interface Notice {
        type: 'warning' | 'deactivation';
    }
}
export declare namespace Cases {
    export { type SafetyCase as SafetyCase };
}
//# sourceMappingURL=cases.d.ts.map