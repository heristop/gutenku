"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardAgentTextFormat = standardAgentTextFormat;
const standard_schema_1 = require("../../standard-schema.js");
const output_format_1 = require("../../../lib/beta/agents/output-format.js");
/** Beta: bind a synchronous Standard Schema validator to Agents output. */
function standardAgentTextFormat(schema, jsonSchema) {
    const format = (0, standard_schema_1.standardTextFormat)(schema, 'agent_output', { schema: jsonSchema });
    // SAFETY: The native Responses helper owns Standard Schema conversion and validation.
    return (0, output_format_1.agentOutputFormat)(format.schema, format.$parseRaw);
}
//# sourceMappingURL=standard-schema.js.map