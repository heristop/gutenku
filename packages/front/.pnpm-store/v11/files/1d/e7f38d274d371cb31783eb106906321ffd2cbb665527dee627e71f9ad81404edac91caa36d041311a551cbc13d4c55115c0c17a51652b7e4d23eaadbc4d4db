"use strict";
var _ResponsesWebSocketAccumulator_instances, _a, _ResponsesWebSocketAccumulator_context, _ResponsesWebSocketAccumulator_current, _ResponsesWebSocketAccumulator_at, _ResponsesWebSocketAccumulator_copyOutput, _ResponsesWebSocketAccumulator_validateOutputScaffold, _ResponsesWebSocketAccumulator_validateContentPart, _ResponsesWebSocketAccumulator_validateOutputEvent, _ResponsesWebSocketAccumulator_start;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsesWebSocketAccumulator = void 0;
const tslib_1 = require("../../internal/tslib.js");
const error_1 = require("../../core/error.js");
const canonical_output_text_1 = require("../../internal/responses/canonical-output-text.js");
const response_accumulator_1 = require("../../internal/responses/response-accumulator.js");
const utils_1 = require("../../internal/utils.js");
const values_1 = require("../../internal/utils/values.js");
// Keep the raw boundary aligned with the generated discriminants. Future wire
// items still belong to the raw lane and authoritative terminal event.
const outputItemTypes = {
    message: true,
    file_search_call: true,
    function_call: true,
    function_call_output: true,
    web_search_call: true,
    computer_call: true,
    computer_call_output: true,
    reasoning: true,
    program: true,
    program_output: true,
    tool_search_call: true,
    tool_search_output: true,
    additional_tools: true,
    compaction: true,
    image_generation_call: true,
    code_interpreter_call: true,
    local_shell_call: true,
    local_shell_call_output: true,
    shell_call: true,
    shell_call_output: true,
    apply_patch_call: true,
    apply_patch_call_output: true,
    mcp_call: true,
    mcp_list_tools: true,
    mcp_approval_request: true,
    mcp_approval_response: true,
    custom_tool_call: true,
    custom_tool_call_output: true,
};
/**
 * Optional, caller-fed reconstruction of one lane's provisional output.
 *
 * Feed the raw events returned by lane.receive(). Use a separate instance per
 * lane. This helper never reads, sends, closes, or registers a listener on a
 * socket; raw events remain in the caller's hands. Tools remain output data.
 * Provisional response metadata is preserved as received and is not yet schema
 * validated. Narrow its unknown fields before use. Omitted fields remain absent.
 * Raw deltas give per-event progress. Use outputAt(event.output_index) when an
 * item finishes, or pass its content_index/summary_index to read only a changed
 * part. For citations use content_index and annotation_index together. A full
 * current, item, or part read materializes its entire nested contents, so
 * reserve those reads for when that complete snapshot is needed.
 *
 * A socket stream can omit the item/content scaffolding required for deltas.
 * Such a response is marked unavailable until the next creation or terminal
 * event. Terminal events, including failures and errors, are retained exactly as
 * delivered, without filling omitted output from provisional data.
 */
class ResponsesWebSocketAccumulator {
    constructor() {
        _ResponsesWebSocketAccumulator_instances.add(this);
        _ResponsesWebSocketAccumulator_context.set(this, (0, response_accumulator_1.createResponseContext)());
        _ResponsesWebSocketAccumulator_current.set(this, void 0);
    }
    /** Materialize the full state. For per-item progress prefer outputAt(). */
    get current() {
        if (tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f")?.phase === 'provisional') {
            if (tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f").outputTextDirty) {
                tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f").snapshot.output_text = tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f").snapshot.output
                    .map((output) => (0, canonical_output_text_1.getOutputText)(tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f"), output))
                    .join('');
                tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f").outputTextDirty = false;
            }
            return {
                phase: 'provisional',
                snapshot: tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f").snapshot),
            };
        }
        return structuredClone(tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f"));
    }
    // oxlint-disable-next-line anti-slop/no-unknown-returns -- Only the generated output discriminator is validated; every raw nested value must remain unknown to callers.
    outputAt(outputIndex, part) {
        if (tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f")?.phase !== 'provisional') {
            return undefined;
        }
        const output = tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_at).call(_a, tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f").snapshot.output, outputIndex);
        if (!part) {
            return tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, output);
        }
        if ('content_index' in part) {
            if (output?.type === 'message' || output?.type === 'reasoning') {
                const content = tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_at).call(_a, output.content, part.content_index);
                if ('annotation_index' in part) {
                    return tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, content?.type === 'output_text'
                        ? tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_at).call(_a, content.annotations, part.annotation_index)
                        : undefined);
                }
                return tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, content);
            }
        }
        else if (output?.type === 'reasoning') {
            return tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_at).call(_a, output.summary, part.summary_index));
        }
        return undefined;
    }
    /** Drop retained provisional and terminal state without affecting any lane. */
    reset() {
        tslib_1.__classPrivateFieldSet(this, _ResponsesWebSocketAccumulator_context, (0, response_accumulator_1.createResponseContext)(), "f");
        tslib_1.__classPrivateFieldSet(this, _ResponsesWebSocketAccumulator_current, undefined, "f");
    }
    /** Record one raw lane event. Unknown event types leave the current state unchanged. */
    add(event) {
        if (event.type === 'response.completed' ||
            event.type === 'response.failed' ||
            event.type === 'response.incomplete' ||
            event.type === 'error') {
            tslib_1.__classPrivateFieldSet(this, _ResponsesWebSocketAccumulator_context, (0, response_accumulator_1.createResponseContext)(), "f");
            tslib_1.__classPrivateFieldSet(this, _ResponsesWebSocketAccumulator_current, { phase: 'terminal', event: structuredClone(event) }, "f");
            return;
        }
        try {
            if (event.type === 'response.created') {
                tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_instances, "m", _ResponsesWebSocketAccumulator_start).call(this, { response: event.response });
                return;
            }
            if (!(0, response_accumulator_1.isResponseOutputEvent)(event) ||
                tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f")?.phase === 'unavailable' ||
                tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f")?.phase === 'terminal') {
                return;
            }
            if (tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f")?.phase !== 'provisional') {
                throw new error_1.OpenAIError("Cannot reconstruct WebSocket output before 'response.created'");
            }
            const outputEvent = structuredClone(event);
            tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_validateOutputEvent).call(_a, outputEvent);
            (0, response_accumulator_1.accumulateWebSocketOutput)(outputEvent, tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_current, "f").snapshot, tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f"));
        }
        catch (error) {
            tslib_1.__classPrivateFieldSet(this, _ResponsesWebSocketAccumulator_current, {
                phase: 'unavailable',
                error: error instanceof Error ? error : new error_1.OpenAIError('Invalid Responses WebSocket output event'),
            }, "f");
        }
    }
}
exports.ResponsesWebSocketAccumulator = ResponsesWebSocketAccumulator;
_a = ResponsesWebSocketAccumulator, _ResponsesWebSocketAccumulator_context = new WeakMap(), _ResponsesWebSocketAccumulator_current = new WeakMap(), _ResponsesWebSocketAccumulator_instances = new WeakSet(), _ResponsesWebSocketAccumulator_at = function _ResponsesWebSocketAccumulator_at(collection, index) {
    if (!Array.isArray(collection) || index === undefined || !Number.isSafeInteger(index) || index < 0) {
        return undefined;
    }
    return collection[index];
}, _ResponsesWebSocketAccumulator_copyOutput = function _ResponsesWebSocketAccumulator_copyOutput(value) {
    if (Array.isArray(value)) {
        // SAFETY: Copying the array preserves every element's type and order.
        return value.map((item) => tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, item));
    }
    if ((0, values_1.isObj)(value)) {
        // SAFETY: Copying own data properties preserves the snapshot's JSON shape.
        // fromEntries defines "__proto__" as an own property instead of invoking a setter.
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_copyOutput).call(_a, item)]));
    }
    return value;
}, _ResponsesWebSocketAccumulator_validateOutputScaffold = function _ResponsesWebSocketAccumulator_validateOutputScaffold(item) {
    if (!(0, values_1.isObj)(item) ||
        !(0, utils_1.hasOwn)(item, 'type') ||
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- An unknown discriminator cannot satisfy the generated typed preview union.
        typeof item['type'] !== 'string' ||
        !(0, utils_1.hasOwn)(outputItemTypes, item['type'])) {
        throw new error_1.OpenAIError('Invalid Responses WebSocket output item');
    }
    if (item['type'] === 'message') {
        if (!Array.isArray(item['content'])) {
            throw new error_1.OpenAIError('Invalid Responses WebSocket message content');
        }
        for (const part of item['content']) {
            tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_validateContentPart).call(_a, part);
        }
    }
    if (item['type'] === 'function_call' ||
        item['type'] === 'custom_tool_call' ||
        item['type'] === 'mcp_call') {
        const field = item['type'] === 'custom_tool_call' ? 'input' : 'arguments';
        if (!(0, utils_1.hasOwn)(item, 'name') ||
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- The caller feeds raw socket events; validate own required tool fields before exposing a typed snapshot.
            typeof item['name'] !== 'string' ||
            !(0, utils_1.hasOwn)(item, field) ||
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Missing and numeric tool data cannot be extended as text.
            typeof item[field] !== 'string') {
            throw new error_1.OpenAIError('Invalid Responses WebSocket tool scaffold');
        }
        if (item['type'] === 'mcp_call' &&
            (!(0, utils_1.hasOwn)(item, 'server_label') ||
                // oxlint-disable-next-line anti-slop/no-runtime-typeof -- The server identity on an MCP scaffold is raw data, not a generated decoded string.
                typeof item['server_label'] !== 'string')) {
            throw new error_1.OpenAIError('Invalid Responses WebSocket MCP server label');
        }
    }
}, _ResponsesWebSocketAccumulator_validateContentPart = function _ResponsesWebSocketAccumulator_validateContentPart(part) {
    if (!(0, values_1.isObj)(part) ||
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Raw output_text must not be silently coerced during a later provisional read.
        (part['type'] === 'output_text' && typeof part['text'] !== 'string')) {
        throw new error_1.OpenAIError('Invalid Responses WebSocket content part');
    }
}, _ResponsesWebSocketAccumulator_validateOutputEvent = function _ResponsesWebSocketAccumulator_validateOutputEvent(event) {
    switch (event.type) {
        case 'response.output_item.added':
        case 'response.output_item.done': {
            tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_validateOutputScaffold).call(_a, event.item);
            break;
        }
        case 'response.content_part.added':
        case 'response.content_part.done': {
            tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_validateContentPart).call(_a, event.part);
            break;
        }
        case 'response.function_call_arguments.delta':
        case 'response.mcp_call_arguments.delta':
        case 'response.custom_tool_call_input.delta':
        case 'response.output_text.delta':
        case 'response.refusal.delta': {
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- The cloned raw event has not been schema-validated; do not coerce data into typed tool arguments.
            if (typeof event.delta !== 'string') {
                throw new error_1.OpenAIError('Invalid Responses WebSocket tool delta');
            }
            break;
        }
        case 'response.function_call_arguments.done':
        case 'response.mcp_call_arguments.done': {
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- A final raw argument payload must satisfy the field exposed by the provisional snapshot.
            if (typeof event.arguments !== 'string') {
                throw new error_1.OpenAIError('Invalid Responses WebSocket tool arguments');
            }
            break;
        }
        case 'response.custom_tool_call_input.done': {
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Do not substitute omitted, null or object input for the typed text field.
            if (typeof event.input !== 'string') {
                throw new error_1.OpenAIError('Invalid Responses WebSocket custom tool input');
            }
            break;
        }
        case 'response.output_text.done': {
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Only actual wire text can replace the accumulated message text.
            if (typeof event.text !== 'string') {
                throw new error_1.OpenAIError('Invalid Responses WebSocket completed text');
            }
            break;
        }
        case 'response.refusal.done': {
            // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Refusals use their own finalized wire text field.
            if (typeof event.refusal !== 'string') {
                throw new error_1.OpenAIError('Invalid Responses WebSocket completed refusal');
            }
            break;
        }
        default: {
            break;
        }
    }
}, _ResponsesWebSocketAccumulator_start = function _ResponsesWebSocketAccumulator_start(event) {
    this.reset();
    if (!(0, values_1.isObj)(event.response)) {
        throw new error_1.OpenAIError('Responses WebSocket created event must contain a response');
    }
    // Only output fields are normalized; omitted response metadata is never invented.
    const { output, output_text: outputText } = event.response;
    if ((output !== undefined && !Array.isArray(output)) ||
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate optional text from an untyped WebSocket lifecycle before placing it in a typed provisional snapshot.
        (outputText !== undefined && typeof outputText !== 'string')) {
        throw new error_1.OpenAIError('Invalid Responses WebSocket initial output');
    }
    if (output !== undefined) {
        for (const item of output) {
            tslib_1.__classPrivateFieldGet(_a, _a, "m", _ResponsesWebSocketAccumulator_validateOutputScaffold).call(_a, item);
        }
    }
    const snapshot = (0, response_accumulator_1.cloneValidatedResponse)(tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f"), {
        ...event.response,
        output: output ?? [],
        output_text: outputText ?? '',
    });
    if (outputText === undefined) {
        (0, canonical_output_text_1.ensureCanonicalOutputText)(tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f"), snapshot);
    }
    tslib_1.__classPrivateFieldGet(this, _ResponsesWebSocketAccumulator_context, "f").deferOutputText = true;
    tslib_1.__classPrivateFieldSet(this, _ResponsesWebSocketAccumulator_current, { phase: 'provisional', snapshot }, "f");
};
//# sourceMappingURL=responses-websocket-accumulator.js.map