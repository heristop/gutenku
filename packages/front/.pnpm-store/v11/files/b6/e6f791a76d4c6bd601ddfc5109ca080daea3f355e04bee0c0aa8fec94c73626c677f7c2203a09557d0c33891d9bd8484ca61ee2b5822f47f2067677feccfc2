"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOutputParseError = exports.ParsedAgentTurnResult = void 0;
exports.agentOutputFormat = agentOutputFormat;
var parsed_agent_turn_result_1 = require("./parsed-agent-turn-result.js");
Object.defineProperty(exports, "ParsedAgentTurnResult", { enumerable: true, get: function () { return parsed_agent_turn_result_1.ParsedAgentTurnResult; } });
var output_parse_error_1 = require("./output-parse-error.js");
Object.defineProperty(exports, "AgentOutputParseError", { enumerable: true, get: function () { return output_parse_error_1.AgentOutputParseError; } });
/** Beta: bind a JSON schema to its local output parser; the API validates schema support. */
function agentOutputFormat(schema, parse) {
    // Keep spread-compatible parsing without exposing caller-owned serialization hooks.
    const parser = Object.defineProperty((text) => parse(text), 'toJSON', {
        value: () => {
            /* Parser metadata is omitted from JSON requests. */
        },
    });
    // SAFETY: The API schema type exposes JSON Schema keywords as a record; preserve the supplied schema unchanged.
    return { type: 'json_schema', schema: schema, $parseRaw: parser };
}
//# sourceMappingURL=output-format.js.map