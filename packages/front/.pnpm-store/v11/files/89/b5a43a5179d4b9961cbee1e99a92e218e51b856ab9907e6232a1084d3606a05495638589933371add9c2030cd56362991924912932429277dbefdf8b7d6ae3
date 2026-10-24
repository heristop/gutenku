"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionTool = functionTool;
const error_1 = require("../../../core/error.js");
const tool_output_1 = require("./tool-output.js");
const tool_stages_1 = require("./tool-stages.js");
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
function functionTool(tool) {
    const execute = tool.$callback;
    const parse = tool.$parseRaw;
    if (!execute || !tool.parameters) {
        throw new error_1.OpenAIError('Agents function tools require a callback and argument schema');
    }
    const handler = async (arguments_, setStage) => {
        setStage?.('arguments');
        const parsed = parse(JSON.stringify(arguments_));
        setStage?.('execution');
        const result = await execute(parsed);
        setStage?.('output');
        if (Array.isArray(result)) {
            return result.length > 0 && result.every(tool_output_1.isInputContent) ? result : JSON.stringify(result);
        }
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Existing schema-tool callbacks return arbitrary application values; adapt them to the Agents dispatcher's output contract.
        if (typeof result === 'object' || typeof result === 'string') {
            return result;
        }
        const text = result === undefined ? 'undefined' : JSON.stringify(result);
        if (text === undefined) {
            throw new error_1.OpenAIError('Tool output must be JSON serializable');
        }
        return text;
    };
    Object.defineProperty(handler, tool_stages_1.toolStages, { value: true });
    return {
        name: tool.name,
        definition: {
            type: 'function',
            name: tool.name,
            description: tool.description ?? '',
            parameters: tool.parameters,
            ...(tool.defer_loading === undefined ? {} : { defer_loading: tool.defer_loading }),
        },
        handler,
    };
}
//# sourceMappingURL=function-tool.js.map