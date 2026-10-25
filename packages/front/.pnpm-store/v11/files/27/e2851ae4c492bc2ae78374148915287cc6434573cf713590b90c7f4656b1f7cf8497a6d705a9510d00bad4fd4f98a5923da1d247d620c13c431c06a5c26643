import type { OpenAI } from "../../../client.js";
import { OpenAIError } from "../../../core/error.js";
import type { RequestOptions } from "../../../internal/request-options.js";
import type { Uploadable } from "../../../internal/uploads.js";
import type { FileObject } from "../../../resources/files.js";
import type { EnvironmentFile, FileCreateParams, Files } from "../../../resources/beta/agents/environments/files.js";
/** Beta: file references ready for a hosted environment, plus caller-owned uploads. */
export interface PreparedAgentFiles {
    files: Extract<FileCreateParams, {
        type: 'file_id';
    }>[];
    uploadedFiles: FileObject[];
}
/** Beta: uploaded file IDs remain available after partial preparation or staging failure. */
export declare class AgentFileUploadError extends OpenAIError {
    readonly name = "AgentFileUploadError";
    readonly cause: unknown;
    readonly uploadedFiles: FileObject[];
    constructor(uploadedFiles: FileObject[], cause: unknown);
}
/** @internal */
export declare function validateAgentFilePath(path: string): void;
/** @internal */
export declare function prepareAgentFiles(client: OpenAI, files: Record<string, Uploadable>, options?: RequestOptions): Promise<PreparedAgentFiles>;
/** @internal */
export declare function uploadAgentFile(client: OpenAI, resource: Files, environmentID: string, params: {
    file: Uploadable;
    path: string;
}, options?: RequestOptions): Promise<{
    uploadedFile: FileObject;
    environmentFile: EnvironmentFile;
}>;
//# sourceMappingURL=files.d.ts.map