export { ParsedAgentTurnResult } from "./parsed-agent-turn-result.mjs";
export { AgentOutputParseError } from "./output-parse-error.mjs";
/** Beta: bind a JSON schema to its local output parser; the API validates schema support. */
export function agentOutputFormat(schema, parse) {
    // Keep spread-compatible parsing without exposing caller-owned serialization hooks.
    const parser = Object.defineProperty((text) => parse(text), 'toJSON', {
        value: () => {
            /* Parser metadata is omitted from JSON requests. */
        },
    });
    // SAFETY: The API schema type exposes JSON Schema keywords as a record; preserve the supplied schema unchanged.
    return { type: 'json_schema', schema: schema, $parseRaw: parser };
}
//# sourceMappingURL=output-format.mjs.map