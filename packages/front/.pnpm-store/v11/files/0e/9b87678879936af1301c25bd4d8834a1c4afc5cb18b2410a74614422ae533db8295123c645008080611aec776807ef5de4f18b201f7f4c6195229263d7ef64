"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodAgentTextFormat = zodAgentTextFormat;
const zod_1 = require("../../zod.js");
const output_format_1 = require("../../../lib/beta/agents/output-format.js");
/** Beta: bind a Zod v3/v4/Mini schema to an Agents text format and completed result. */
function zodAgentTextFormat(schema) {
    const format = (0, zod_1.zodTextFormat)(schema, 'agent_output');
    // SAFETY: The native Responses helper owns Zod schema conversion and validation.
    return (0, output_format_1.agentOutputFormat)(format.schema, format.$parseRaw);
}
//# sourceMappingURL=zod.js.map