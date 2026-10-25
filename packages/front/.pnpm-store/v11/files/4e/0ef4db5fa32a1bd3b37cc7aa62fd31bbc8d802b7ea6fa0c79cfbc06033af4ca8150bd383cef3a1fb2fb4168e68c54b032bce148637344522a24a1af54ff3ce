import type { AgentSessionEvent } from "../../../resources/beta/agents/agents.mjs";
import type { AgentTurnResult } from "./agent-turn-result.mjs";
import { AgentTurnResultCollector } from "./agent-turn-result-collector.mjs";
/** Shares collection between a raw creation stream and the follow-up helper.
 * @internal
 */
export declare class ResultCollection {
    #private;
    readonly collector: AgentTurnResultCollector;
    constructor(source: () => AsyncIterator<AgentSessionEvent>, canHandle?: (name: string) => boolean, sessionID?: string, signal?: AbortSignal);
    enable(): void;
    iterate(): AsyncIterator<AgentSessionEvent>;
    finalResult(): Promise<AgentTurnResult>;
}
//# sourceMappingURL=result-collection.d.mts.map