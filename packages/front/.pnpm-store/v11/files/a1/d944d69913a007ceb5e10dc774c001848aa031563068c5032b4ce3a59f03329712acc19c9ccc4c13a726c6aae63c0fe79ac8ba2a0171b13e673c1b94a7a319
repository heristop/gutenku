var _AgentToolDispatcher_instances, _AgentToolDispatcher_handlers, _AgentToolDispatcher_options, _AgentToolDispatcher_sessions, _AgentToolDispatcher_controller, _AgentToolDispatcher_onToolError, _AgentToolDispatcher_result, _AgentToolDispatcher_checkAbort, _AgentToolDispatcher_abortError, _AgentToolDispatcher_wait, _AgentToolDispatcher_submit;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../../internal/tslib.mjs";
import { APIUserAbortError, BadRequestError, OpenAIError } from "../../../core/error.mjs";
import { buildHeaders } from "../../../internal/headers.mjs";
import { uuid4 } from "../../../internal/utils/uuid.mjs";
import { isObj } from "../../../internal/utils/values.mjs";
import { isInputContent } from "./tool-output.mjs";
import { toolStages } from "./tool-stages.mjs";
function normalizedOutput(value) {
    if (value === null) {
        return null;
    }
    if (typeof value === 'string' || (Array.isArray(value) && value.every(isInputContent))) {
        return value;
    }
    throw new OpenAIError('Tool output must be text, content, a JSON object, or null');
}
// oxlint-disable-next-line anti-slop/no-object-parameters -- The public AgentToolOutput contract accepts arbitrary JSON-serializable object results.
function toolResult(call, value) {
    const output = isObj(value) ? JSON.stringify(value) : value;
    // Detect unserializable callback results inside the redacted failure boundary.
    const serialized = JSON.stringify(output);
    if (serialized === undefined) {
        throw new OpenAIError('Tool output must be JSON serializable');
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
export class AgentToolDispatcher {
    constructor(sessions, handlers, controller, options, onToolError) {
        _AgentToolDispatcher_instances.add(this);
        _AgentToolDispatcher_handlers.set(this, void 0);
        _AgentToolDispatcher_options.set(this, void 0);
        _AgentToolDispatcher_sessions.set(this, void 0);
        _AgentToolDispatcher_controller.set(this, void 0);
        _AgentToolDispatcher_onToolError.set(this, void 0);
        __classPrivateFieldSet(this, _AgentToolDispatcher_sessions, sessions, "f");
        __classPrivateFieldSet(this, _AgentToolDispatcher_controller, controller, "f");
        __classPrivateFieldSet(this, _AgentToolDispatcher_onToolError, onToolError, "f");
        __classPrivateFieldSet(this, _AgentToolDispatcher_handlers, new Map(Object.entries(handlers)), "f");
        const headers = buildHeaders([options?.headers]);
        headers.values.delete('idempotency-key');
        headers.nulls.delete('idempotency-key');
        const { idempotencyKey: _key, ...rest } = options ?? {};
        __classPrivateFieldSet(this, _AgentToolDispatcher_options, { ...rest, headers, signal: controller.signal }, "f");
    }
    canHandle(name) {
        return typeof __classPrivateFieldGet(this, _AgentToolDispatcher_handlers, "f").get(name) === 'function';
    }
    /** Capture routing and arguments before the caller can mutate the yielded event. */
    prepare(call, sessionID) {
        const handler = call && __classPrivateFieldGet(this, _AgentToolDispatcher_handlers, "f").get(call.name);
        if (!call || typeof handler !== 'function') {
            return;
        }
        if (!sessionID) {
            throw new OpenAIError('Tool call received before the session creation event');
        }
        const snapshot = structuredClone(call);
        return async () => {
            __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
            const result = await __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_result).call(this, snapshot, handler, sessionID);
            __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
            await __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_submit).call(this, sessionID, result);
        };
    }
}
_AgentToolDispatcher_handlers = new WeakMap(), _AgentToolDispatcher_options = new WeakMap(), _AgentToolDispatcher_sessions = new WeakMap(), _AgentToolDispatcher_controller = new WeakMap(), _AgentToolDispatcher_onToolError = new WeakMap(), _AgentToolDispatcher_instances = new WeakSet(), _AgentToolDispatcher_result = async function _AgentToolDispatcher_result(call, handler, sessionID) {
    let stage = 'arguments';
    try {
        const args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments;
        if (!isObj(args)) {
            throw new OpenAIError('Function arguments must be a JSON object');
        }
        stage = 'execution';
        // SAFETY: Arguments were parsed as JSON and checked to be a non-null non-array object before invoking the handler.
        const arguments_ = args;
        const output = await __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_wait).call(this, () => __classPrivateFieldGet(this, _AgentToolDispatcher_onToolError, "f") && handler[toolStages]
            ? handler(arguments_, (value) => {
                stage = value;
            })
            : handler(arguments_));
        stage = 'output';
        return toolResult(call, output);
    }
    catch (error) {
        __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
        if (__classPrivateFieldGet(this, _AgentToolDispatcher_onToolError, "f")) {
            const failure = Object.freeze({
                error,
                stage,
                tool_name: call.name,
                session_id: sessionID,
                turn_id: call.turn_id,
                call_id: call.call_id,
            });
            try {
                await __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_wait).call(this, () => __classPrivateFieldGet(this, _AgentToolDispatcher_onToolError, "f")?.call(this, failure));
            }
            catch {
                // Observers must not prevent the original sanitized tool failure from being submitted.
                __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
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
    if (__classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.aborted) {
        throw __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_abortError).call(this);
    }
}, _AgentToolDispatcher_abortError = function _AgentToolDispatcher_abortError() {
    const error = new APIUserAbortError();
    Object.defineProperty(error, 'cause', {
        value: __classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.reason,
        writable: true,
        configurable: true,
    });
    return error;
}, _AgentToolDispatcher_wait = async function _AgentToolDispatcher_wait(action) {
    let onAbort;
    // oxlint-disable-next-line promise/avoid-new -- Bridge the caller's AbortSignal while a handler or registration delay is pending.
    const aborted = new Promise((_resolve, reject) => {
        onAbort = () => reject(__classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_abortError).call(this));
        __classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
        __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
        // Capture synchronous throws before racing cancellation, so both promises
        // always have rejection handlers even if the callback aborts and throws.
        const invoke = async () => await action();
        return await Promise.race([invoke(), aborted]);
    }
    finally {
        if (onAbort) {
            __classPrivateFieldGet(this, _AgentToolDispatcher_controller, "f").signal.removeEventListener('abort', onAbort);
        }
    }
}, _AgentToolDispatcher_submit = async function _AgentToolDispatcher_submit(sessionID, result, key = uuid4(), attempt = 0) {
    __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_checkAbort).call(this);
    try {
        await __classPrivateFieldGet(this, _AgentToolDispatcher_sessions, "f").events.create(sessionID, { events: [result], 'Idempotency-Key': key }, __classPrivateFieldGet(this, _AgentToolDispatcher_options, "f"));
    }
    catch (error) {
        const delay = [100, 300, 600][attempt];
        if (delay === undefined ||
            !(error instanceof BadRequestError) ||
            error.code !== 'invalid_request_error' ||
            !error.error ||
            !('message' in error.error) ||
            error.error.message !== `Unknown pending tool call: ${result.call_id}`) {
            throw error;
        }
        let timer;
        try {
            await __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_wait).call(this, () => 
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
        await __classPrivateFieldGet(this, _AgentToolDispatcher_instances, "m", _AgentToolDispatcher_submit).call(this, sessionID, result, key, attempt + 1);
    }
};
//# sourceMappingURL=tool-dispatcher.mjs.map