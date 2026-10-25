"use strict";
var _AgentToolDispatcher_instances, _AgentToolDispatcher_handlers, _AgentToolDispatcher_options, _AgentToolDispatcher_sessions, _AgentToolDispatcher_controller, _AgentToolDispatcher_onToolError, _AgentToolDispatcher_result, _AgentToolDispatcher_checkAbort, _AgentToolDispatcher_abortError, _AgentToolDispatcher_wait, _AgentToolDispatcher_submit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolDispatcher = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const error_1 = require("../../../core/error.js");
const headers_1 = require("../../../internal/headers.js");
const uuid_1 = require("../../../internal/utils/uuid.js");
const values_1 = require("../../../internal/utils/values.js");
const tool_output_1 = require("./tool-output.js");
const tool_stages_1 = require("./tool-stages.js");
function normalizedOutput(value) {
    if (value === null) {
        return null;
    }
    if (typeof value === 'string' || (Array.isArray(value) && value.every(tool_output_1.isInputContent))) {
        return value;
    }
    throw new error_1.OpenAIError('Tool output must be text, content, a JSON object, or null');
}
// oxlint-disable-next-line anti-slop/no-object-parameters -- The public AgentToolOutput contract accepts arbitrary JSON-serializable object results.
function toolResult(call, value) {
    const output = (0, values_1.isObj)(value) ? JSON.stringify(value) : value;
    // Detect unserializable callback results inside the redacted failure boundary.
    const serialized = JSON.stringify(output);
    if (serialized === undefined) {
        throw new error_1.OpenAIError('Tool output must be JSON serializable');
    }
    return {
        type: 'agent.session.input.tool_result',
        turn_id: call.turn_id,
        call_id: call.call_id,
        success: true,
        output: normalizedOutput(typeof output === 'string' ? output : JSON.parse(serialized)),
    };
}
/** Shared local function dispatch for creation and follow-up streams. @internal */
class AgentToolDispatcher {
    constructor(sessions, handlers, controller, options, onToolError) {
        _AgentToolDispatcher_instances.add(this);
        _AgentToolDispatcher_handlers.set(this, void 0);
        _AgentToolDispatcher_options.set(this, void 0);
        _AgentToolDispatcher_sessions.set(this, void 0);
        _AgentToolDispatcher_controller.set(this, void 0);
        _AgentToolDispatcher_onToolError.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _AgentToolDispatcher_sessions, sessions, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentToolDispatcher_controller, controller, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentToolDispatcher_onToolError, onToolError, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentToolDispatcher_handlers, new Map(Object.entries(handlers)), "f");
        const headers = (0, headers_1.buildHeaders)([options?.headers]);
        headers.values.delete('idempotency-key');
        headers.nulls.delete('idempotency-key');
        const { idempotencyKey: _key, ...rest } = options ?? {};
        tslib_1.__classPrivateFieldSet(this, _AgentToolDispatcher_options, { ...rest, headers, signal: controller.signal }, "f");
    }
    canHandle(name) {
        return typeof tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_handlers, "f").get(name) === 'function';
    }
    /** Capture routing and arguments before the caller can mutate the yielded event. */
    prepare(call, sessionID) {
        const handler = call && tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_handlers, "f").get(call.name);
        if (!call || typeof handler !== 'function') {
            return;
        }
        if (!sessionID) {
            throw new error_1.OpenAIError('Tool call received before the session creation event');
        }
        const snapshot = structuredClone(call);
        return async () => {
            tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
            const result = await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_result).call(this, snapshot, handler, sessionID);
            tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
            await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_submit).call(this, sessionID, result);
        };
    }
}
exports.AgentToolDispatcher = AgentToolDispatcher;
_AgentToolDispatcher_handlers = new WeakMap(), _AgentToolDispatcher_options = new WeakMap(), _AgentToolDispatcher_sessions = new WeakMap(), _AgentToolDispatcher_controller = new WeakMap(), _AgentToolDispatcher_onToolError = new WeakMap(), _AgentToolDispatcher_instances = new WeakSet(), _AgentToolDispatcher_result = async function _AgentToolDispatcher_result(call, handler, sessionID) {
    let stage = 'arguments';
    try {
        const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
        if (!(0, values_1.isObj)(args)) {
            throw new error_1.OpenAIError('Function arguments must be a JSON object');
        }
        stage = 'execution';
        // SAFETY: Arguments were parsed as JSON and checked to be a non-null non-array object before invoking the handler.
        const arguments_ = args;
        const output = await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_wait).call(this, () => tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_onToolError, "f") && handler[tool_stages_1.toolStages]
            ? handler(arguments_, (value) => {
                stage = value;
            })
            : handler(arguments_));
        stage = 'output';
        return toolResult(call, output);
    }
    catch (error) {
        tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
        if (tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_onToolError, "f")) {
            const failure = Object.freeze({
                error,
                stage,
                tool_name: call.name,
                session_id: sessionID,
                turn_id: call.turn_id,
                call_id: call.call_id,
            });
            try {
                await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_wait).call(this, () => tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_onToolError, "f")?.call(this, failure));
            }
            catch {
                // Observers must not prevent the original sanitized tool failure from being submitted.
                tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
            }
        }
        return {
            type: 'agent.session.input.tool_result',
            turn_id: call.turn_id,
            call_id: call.call_id,
            success: false,
            error: 'Tool handler failed.',
        };
    }
}, _AgentToolDispatcher_checkAbort = function _AgentToolDispatcher_checkAbort() {
    if (tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.aborted) {
        throw tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_abortError).call(this);
    }
}, _AgentToolDispatcher_abortError = function _AgentToolDispatcher_abortError() {
    const error = new error_1.APIUserAbortError();
    Object.defineProperty(error, 'cause', {
        value: tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.reason,
        writable: true,
        configurable: true,
    });
    return error;
}, _AgentToolDispatcher_wait = async function _AgentToolDispatcher_wait(action) {
    let onAbort;
    // oxlint-disable-next-line promise/avoid-new -- Bridge the caller's AbortSignal while a handler or registration delay is pending.
    const aborted = new Promise((_resolve, reject) => {
        onAbort = () => reject(tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_abortError).call(this));
        tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
        tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
        // Capture synchronous throws before racing cancellation, so both promises
        // always have rejection handlers even if the callback aborts and throws.
        const invoke = async () => await action();
        return await Promise.race([invoke(), aborted]);
    }
    finally {
        if (onAbort) {
            tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.removeEventListener('abort', onAbort);
        }
    }
}, _AgentToolDispatcher_submit = async function _AgentToolDispatcher_submit(sessionID, result, key = (0, uuid_1.uuid4)(), attempt = 0) {
    tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
    try {
        await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_sessions, "f").events.create(sessionID, { events: [result], 'Idempotency-Key': key }, tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_options, "f"));
    }
    catch (error) {
        const delay = [100, 300, 600][attempt];
        if (delay === undefined ||
            !(error instanceof error_1.BadRequestError) ||
            error.code !== 'invalid_request_error' ||
            !error.error ||
            !('message' in error.error) ||
            error.error.message !== `Unknown pending tool call: ${result.call_id}`) {
            throw error;
        }
        let timer;
        try {
            await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_wait).call(this, () => 
            // oxlint-disable-next-line promise/avoid-new -- Own the registration timer so cancellation clears it promptly.
            new Promise((resolve) => {
                timer = setTimeout(resolve, delay);
            }));
        }
        finally {
            if (timer !== undefined) {
                clearTimeout(timer);
            }
        }
        await tslib_1.__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_submit).call(this, sessionID, result, key, attempt + 1);
    }
};
//# sourceMappingURL=tool-dispatcher.js.map