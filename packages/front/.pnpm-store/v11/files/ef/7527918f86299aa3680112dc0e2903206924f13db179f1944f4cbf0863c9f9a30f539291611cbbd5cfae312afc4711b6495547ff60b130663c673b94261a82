import type { WritableStream } from "../../../internal/shim-types.mjs";
import type { RequestOptions } from "../../../internal/request-options.mjs";
import type { Artifacts, SessionArtifact } from "../../../resources/beta/agents/sessions/artifacts.mjs";
import type { AgentTurnResult } from "./agent-turn-result.mjs";
/** Beta: artifacts from the exact session and turn represented by a result. */
export declare class AgentResultArtifacts {
    #private;
    constructor(resource: Artifacts, result: AgentTurnResult);
    /** Find one immutable artifact by its exact hosted path, across all pages. */
    retrieve(path: string, options?: RequestOptions): Promise<SessionArtifact>;
    /** Return the native binary response for this result's exact artifact path. */
    content(path: string, options?: RequestOptions): Promise<Response>;
    /** Stream bytes to a caller-chosen destination; the hosted path never selects a local path. */
    download(params: {
        path: string;
        to: WritableStream<Uint8Array>;
    }, options?: RequestOptions): Promise<SessionArtifact>;
}
//# sourceMappingURL=result-artifacts.d.mts.map