"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAgentResult = parseAgentResult;
exports.agentFormatParser = agentFormatParser;
exports.captureAgentOutput = captureAgentOutput;
exports.parseAgentResultPromise = parseAgentResultPromise;
const error_1 = require("../../../core/error.js");
const parsed_agent_turn_result_1 = require("./parsed-agent-turn-result.js");
const output_parse_error_1 = require("./output-parse-error.js");
/** @internal */
function parseAgentResult(result, format) {
    try {
        if (!format) {
            // SAFETY: Absent formats use the default never/raw overload.
            return result;
        }
        let first;
        for (const message of result.messages) {
            for (const content of message.content) {
                if (content.type === 'output_text') {
                    const value = format.$parseRaw(content.text);
                    first ?? (first = { value });
                }
            }
        }
        if (!first) {
            throw new output_parse_error_1.AgentOutputParseError(result);
        }
        // SAFETY: Callers preserve the format's inferred T.
        return new parsed_agent_turn_result_1.ParsedAgentTurnResult(result, first.value);
    }
    catch {
        throw new output_parse_error_1.AgentOutputParseError(result);
    }
}
// Inspect only JSON-visible data fields; leave getters and inherited values to normal serialization.
function ownJSONValue(object, key) {
    const descriptor = object && Object.getOwnPropertyDescriptor(object, key);
    // SAFETY: The own data descriptor corresponds to the requested property in T.
    return descriptor?.enumerable && 'value' in descriptor ? descriptor.value : undefined;
}
/** @internal */
function agentFormatParser(format) {
    if (!format) {
        return undefined;
    }
    const descriptor = Object.getOwnPropertyDescriptor(format, '$parseRaw');
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- An own parser data property is the explicit opt-in marker.
    if (!descriptor || !('value' in descriptor) || typeof descriptor.value !== 'function') {
        return undefined;
    }
    // SAFETY: Inspect the schema data descriptor without evaluating a caller getter; validate its discriminator below.
    const schema = ownJSONValue(format, 'schema');
    if (ownJSONValue(format, 'type') !== 'json_schema' || !schema) {
        throw new error_1.OpenAIError('Typed agent formats require own enumerable type and schema data properties');
    }
    // SAFETY: The own descriptor was checked for a callable parser; retain its receiver and never reread the property.
    const parse = descriptor.value;
    return { type: 'json_schema', schema, $parseRaw: (text) => parse.call(format, text) };
}
// Materialize JSON-visible envelope getters once without evaluating unrelated properties.
function snapshotJSONProperty(object, key, capture = (value) => value) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor?.enumerable) {
        return object;
    }
    const value = capture(object[key]);
    if ('value' in descriptor && value === descriptor.value) {
        return object;
    }
    // SAFETY: Preserve the original properties/prototype, replacing only this captured property's value.
    return Object.create(Object.getPrototypeOf(object), {
        ...Object.getOwnPropertyDescriptors(object),
        [key]: { value, enumerable: true, configurable: descriptor.configurable, writable: true },
    });
}
/** @internal */
function captureAgentOutput(input, options) {
    const body = snapshotJSONProperty(input, 'agent', (agent) => agent
        ? snapshotJSONProperty(agent, 'text', (text) => (text ? snapshotJSONProperty(text, 'format') : text))
        : agent);
    const agent = ownJSONValue(body, 'agent');
    const text = ownJSONValue(agent, 'text');
    const format = agentFormatParser(ownJSONValue(text, 'format'));
    if (!format) {
        return { body, options };
    }
    const schema = structuredClone(format.schema);
    for (const envelope of [body, agent, text]) {
        if (envelope && 'toJSON' in envelope) {
            throw new error_1.OpenAIError('Typed agent requests cannot customize body, agent, or text serialization');
        }
    }
    // Snapshot options once, matching the own enumerable fields native request spreading uses.
    const capturedOptions = { ...options };
    if (ownJSONValue(capturedOptions, 'body') !== undefined) {
        throw new error_1.OpenAIError('Typed agent requests cannot override the body in request options');
    }
    delete capturedOptions.body;
    return {
        options: capturedOptions,
        body: {
            ...body,
            agent: {
                ...agent,
                text: { ...text, format: { type: 'json_schema', schema } },
            },
        },
        format,
    };
}
/** @internal */
async function parseAgentResultPromise(result, format) {
    return parseAgentResult(await result, format);
}
//# sourceMappingURL=parse-result.js.map