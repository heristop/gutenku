import { zodTextFormat } from "../../zod.mjs";
import { agentOutputFormat } from "../../../lib/beta/agents/output-format.mjs";
/** Beta: bind a Zod v3/v4/Mini schema to an Agents text format and completed result. */
export function zodAgentTextFormat(schema) {
    const format = zodTextFormat(schema, 'agent_output');
    // SAFETY: The native Responses helper owns Zod schema conversion and validation.
    return agentOutputFormat(format.schema, format.$parseRaw);
}
//# sourceMappingURL=zod.mjs.map