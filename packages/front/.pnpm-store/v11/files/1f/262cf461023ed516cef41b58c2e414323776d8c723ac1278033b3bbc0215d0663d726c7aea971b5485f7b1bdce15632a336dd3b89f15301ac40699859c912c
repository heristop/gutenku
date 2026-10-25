import { standardTextFormat } from "../../standard-schema.mjs";
import { agentOutputFormat } from "../../../lib/beta/agents/output-format.mjs";
/** Beta: bind a synchronous Standard Schema validator to Agents output. */
export function standardAgentTextFormat(schema, jsonSchema) {
    const format = standardTextFormat(schema, 'agent_output', { schema: jsonSchema });
    // SAFETY: The native Responses helper owns Standard Schema conversion and validation.
    return agentOutputFormat(format.schema, format.$parseRaw);
}
//# sourceMappingURL=standard-schema.mjs.map