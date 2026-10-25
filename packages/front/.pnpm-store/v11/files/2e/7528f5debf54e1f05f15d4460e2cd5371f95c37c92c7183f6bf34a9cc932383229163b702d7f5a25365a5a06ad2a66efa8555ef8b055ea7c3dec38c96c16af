import { OpenAIError } from "../../../core/error.mjs";
import type { AgentTurnResult } from "./agent-turn-result.mjs";
/** Beta: hosted execution completed, but local output parsing failed. */
export declare class AgentOutputParseError extends OpenAIError {
    #private;
    name: string;
    constructor(result: AgentTurnResult);
    /** Inspect the completed output explicitly; ordinary error logging omits it. */
    get raw_result(): AgentTurnResult;
}
//# sourceMappingURL=output-parse-error.d.mts.map