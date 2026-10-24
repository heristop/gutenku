import type { RequestOptions } from "../../../internal/request-options.js";
import type { AgentToolHandler, AgentSessionStreamParams } from "../../agents/agent-session-stream.js";
import type { AgentFunctionCallItem } from "../../../resources/beta/agents/agents.js";
import type { Sessions } from "../../../resources/beta/agents/sessions/sessions.js";
/** Shared local function dispatch for creation and follow-up streams. @internal */
export declare class AgentToolDispatcher {
    #private;
    constructor(sessions: Sessions, handlers: Record<string, AgentToolHandler>, controller: AbortController, options?: RequestOptions, onToolError?: AgentSessionStreamParams['onToolError']);
    canHandle(name: string): boolean;
    /** Capture routing and arguments before the caller can mutate the yielded event. */
    prepare(call: AgentFunctionCallItem | undefined, sessionID: string | undefined): (() => Promise<void>) | undefined;
}
//# sourceMappingURL=tool-dispatcher.d.ts.map