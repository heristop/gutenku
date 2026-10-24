import type { TextFormatParam } from "../../../resources/beta/agents/agents.js";
import type { AgentTurnResult } from "./agent-turn-result.js";
import type { ParsedAgentTurnResult } from "./parsed-agent-turn-result.js";
/** Beta: an Agents JSON Schema format with a local output validator. */
export interface AgentOutputFormat<T> extends TextFormatParam.TextFormatParamJSONSchema {
    /** SDK-only parser; omitted from serialized requests. */
    $parseRaw: (text: string) => T;
}
/** Beta: raw results remain unchanged unless a typed format is supplied. */
export type AgentResult<T> = [T] extends [never] ? AgentTurnResult : ParsedAgentTurnResult<T>;
//# sourceMappingURL=output-format-types.d.ts.map