import type { AgentSessionEvent } from "../../../resources/beta/agents/agents.js";
import { AgentTurnResult } from "./agent-turn-result.js";
import { AgentTurnResultError } from "./agent-turn-result-error.js";
/** Accumulates completed items independently of transport and tool execution.
 * @internal
 */
export declare class AgentTurnResultCollector {
    #private;
    constructor(sessionID?: string);
    accept(event: AgentSessionEvent): void;
    error(reason: AgentTurnResultError['reason'], cause?: unknown): AgentTurnResultError;
    checkAction(canHandle: (name: string) => boolean): void;
    get ready(): boolean;
    release(): void;
    finish(): AgentTurnResult;
}
//# sourceMappingURL=agent-turn-result-collector.d.ts.map