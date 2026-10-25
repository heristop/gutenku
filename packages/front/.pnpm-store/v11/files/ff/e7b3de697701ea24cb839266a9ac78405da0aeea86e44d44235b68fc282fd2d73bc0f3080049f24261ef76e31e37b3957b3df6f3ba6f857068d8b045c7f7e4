import type { AgentToolHandler } from "../../agents/agent-session-stream.js";
import type { AgentToolError } from "./tool-error.js";
/** @internal */
export declare const toolStages: unique symbol;
/**
 * Marks handlers that accept stage updates, including across ESM/CJS imports.
 * @internal
 */
export type StagedToolHandler = ((arguments_: Parameters<AgentToolHandler>[0], setStage?: (stage: AgentToolError['stage']) => void) => ReturnType<AgentToolHandler>) & {
    [toolStages]?: true;
};
//# sourceMappingURL=tool-stages.d.ts.map