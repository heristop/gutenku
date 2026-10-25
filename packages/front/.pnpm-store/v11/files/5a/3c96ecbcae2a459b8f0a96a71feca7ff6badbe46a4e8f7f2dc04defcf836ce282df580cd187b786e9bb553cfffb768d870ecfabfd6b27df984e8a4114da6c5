import type { WritableStream as AgentWritableStream } from "../../../internal/shim-types.js";
import type { StreamingFile } from "../../../internal/uploads.js";
import type { RequestOptions } from "../../../internal/request-options.js";
import type { Files } from "../../../resources/beta/agents/environments/files.js";
import type { PreparedAgentFiles } from "../../../lib/beta/agents/files.js";
/** Beta, Node.js: select an application-owned file in a stable directory for a lazy upload. */
export declare function agentFile(path: string): Promise<StreamingFile & {
    size: number;
}>;
/** Beta, Node.js: prepare explicit files from a stable application-owned directory once. */
export declare function prepareAgentDirectory(resource: Files, directory: string, params: {
    include: readonly string[];
    to?: string;
}, options?: RequestOptions): Promise<PreparedAgentFiles>;
/** Beta, Node.js: an application-owned safe path in a stable directory, opened lazily for a download. */
export declare function agentFileDestination(path: string): AgentWritableStream<Uint8Array>;
//# sourceMappingURL=filesystem.d.ts.map