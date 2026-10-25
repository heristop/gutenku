import type { AgentToolHandler } from "../../agents/agent-session-stream.mjs";
import type { AutoParseableResponseTool } from "../../ResponsesParser.mjs";
import type { AgentToolParam } from "../../../resources/beta/agents/agents.mjs";
/** A beta Agents function definition paired with its local, validating handler. */
export interface AgentFunctionTool {
    /** Model-visible function name, also used as the key in `toolHandlers`. */
    readonly name: string;
    /** Hosted configuration for `agent.tools`; contains no local callback or parser. */
    readonly definition: AgentToolParam.AgentToolConfigParamFunction;
    /** Validates arguments before invoking the callback through the existing stream dispatcher. */
    readonly handler: AgentToolHandler;
}
/**
 * Adapts a `zodResponsesFunction` or `standardResponsesFunction` to beta Agents.
 * Pass `definition` to `agent.tools` and register `handler` under `name` in
 * `sessions.stream()`'s `toolHandlers`. Creating a definition does not execute it.
 * The existing dispatcher handles callback results, failures, and submission retries.
 * Scalar results and business-data arrays become JSON text; `undefined` becomes
 * the text `undefined`. Supported text/image content arrays retain their format.
 *
 * @throws {OpenAIError} If the tool has no callback or argument schema.
 */
export declare function functionTool<Arguments>(tool: AutoParseableResponseTool<{
    name: string;
    arguments: Arguments;
}>): AgentFunctionTool;
//# sourceMappingURL=function-tool.d.mts.map