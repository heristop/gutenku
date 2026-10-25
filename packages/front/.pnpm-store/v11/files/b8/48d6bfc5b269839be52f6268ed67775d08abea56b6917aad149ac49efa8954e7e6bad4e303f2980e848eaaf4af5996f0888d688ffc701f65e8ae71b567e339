"use strict";
var _AgentSessionStream_instances, _AgentSessionStream_consumed, _AgentSessionStream_format, _AgentSessionStream_parsedResult, _AgentSessionStream_collection, _AgentSessionStream_stream, _AgentSessionStream_response, _AgentSessionStream_reading, _AgentSessionStream_sessions, _AgentSessionStream_sessionID, _AgentSessionStream_input, _AgentSessionStream_dispatcher, _AgentSessionStream_inputKey, _AgentSessionStream_options, _AgentSessionStream_iterate, _AgentSessionStream_checkAbort, _AgentSessionStream_abortError;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSessionStream = void 0;
const tslib_1 = require("../../internal/tslib.js");
const turn_state_1 = require("./turn-state.js");
const tool_dispatcher_1 = require("../beta/agents/tool-dispatcher.js");
const parse_result_1 = require("../beta/agents/parse-result.js");
const result_collection_1 = require("../beta/agents/result-collection.js");
const error_1 = require("../../core/error.js");
const headers_1 = require("../../internal/headers.js");
const uuid_1 = require("../../internal/utils/uuid.js");
async function cancelBody(response) {
    try {
        await response?.body?.cancel();
    }
    catch {
        // The response may already be cancelled or owned by its stream reader.
    }
}
/**
 * A single-use, lazy async iterable of original session events for one turn.
 * Requires an idle session and a single input writer: the input endpoint does not
 * return a turn ID. Subscribe-before-input avoids losing events; the first
 * coordinator turn selects the turn to follow. Initial idle events and subagent
 * completion do not end iteration. A selected turn's terminal event followed by
 * session.idle, or session.failed, ends iteration. Unexpected EOF throws.
 *
 * Tool handlers run sequentially during iteration. Handler failures submit a
 * generic error without exception text. Each submission has a distinct retry-safe
 * idempotency key. Breaking iteration or calling abort closes local requests;
 * neither cancels the backend turn. No work starts until iteration begins.
 */
class AgentSessionStream {
    /** Creates an unstarted helper. Prefer client.beta.agents.sessions.stream(). */
    constructor(sessions, sessionID, params, options) {
        _AgentSessionStream_instances.add(this);
        /** Aborts local requests and iteration without cancelling the backend turn. */
        this.controller = new AbortController();
        _AgentSessionStream_consumed.set(this, false);
        _AgentSessionStream_format.set(this, void 0);
        _AgentSessionStream_parsedResult.set(this, void 0);
        _AgentSessionStream_collection.set(this, void 0);
        _AgentSessionStream_stream.set(this, void 0);
        _AgentSessionStream_response.set(this, void 0);
        _AgentSessionStream_reading.set(this, false);
        _AgentSessionStream_sessions.set(this, void 0);
        _AgentSessionStream_sessionID.set(this, void 0);
        _AgentSessionStream_input.set(this, void 0);
        _AgentSessionStream_dispatcher.set(this, void 0);
        _AgentSessionStream_inputKey.set(this, void 0);
        _AgentSessionStream_options.set(this, void 0);
        const input = typeof params.input === 'string'
            ? [{ role: 'user', content: [{ type: 'input_text', text: params.input }] }]
            : params.input;
        if (params.input.length === 0) {
            throw new error_1.OpenAIError('input must not be empty');
        }
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_format, (0, parse_result_1.agentFormatParser)(params.outputFormat), "f");
        if (params.outputFormat && !tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_format, "f")) {
            throw new error_1.OpenAIError('outputFormat must have its own parser function');
        }
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_sessions, sessions, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_sessionID, sessionID, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_input, { type: 'agent.session.input.message', input }, "f");
        const headers = (0, headers_1.buildHeaders)([options?.headers]);
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_inputKey, headers.nulls.has('idempotency-key')
            ? undefined
            : (headers.values.get('idempotency-key') ??
                params.idempotencyKey ??
                options?.idempotencyKey ??
                (0, uuid_1.uuid4)()), "f");
        headers.values.delete('idempotency-key');
        headers.nulls.delete('idempotency-key');
        const { idempotencyKey: _key, ...rest } = options ?? {};
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_options, { ...rest, headers }, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_dispatcher, new tool_dispatcher_1.AgentToolDispatcher(sessions, params.toolHandlers ?? {}, this.controller, tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_options, "f"), params.onToolError), "f");
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_collection, new result_collection_1.ResultCollection(() => tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_iterate).call(this), (name) => tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_dispatcher, "f").canHandle(name), sessionID), "f");
    }
    /** Closes local requests without cancelling the turn; an optional reason becomes the abort error's cause. */
    abort(reason) {
        this.controller.abort(reason);
        tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_stream, "f")?.controller.abort(this.controller.signal.reason);
        if (!tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_reading, "f")) {
            void cancelBody(tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_response, "f"));
        }
    }
    /** Starts iteration once; use for await to ensure early exits close the connection. */
    [(_AgentSessionStream_consumed = new WeakMap(), _AgentSessionStream_format = new WeakMap(), _AgentSessionStream_parsedResult = new WeakMap(), _AgentSessionStream_collection = new WeakMap(), _AgentSessionStream_stream = new WeakMap(), _AgentSessionStream_response = new WeakMap(), _AgentSessionStream_reading = new WeakMap(), _AgentSessionStream_sessions = new WeakMap(), _AgentSessionStream_sessionID = new WeakMap(), _AgentSessionStream_input = new WeakMap(), _AgentSessionStream_dispatcher = new WeakMap(), _AgentSessionStream_inputKey = new WeakMap(), _AgentSessionStream_options = new WeakMap(), _AgentSessionStream_instances = new WeakSet(), Symbol.asyncIterator)]() {
        if (tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_consumed, "f")) {
            throw new error_1.OpenAIError('An AgentSessionStream can only be consumed once');
        }
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_consumed, true, "f");
        return tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_collection, "f").iterate();
    }
    /** Beta: opt into retaining completed final messages before iterating progress events. */
    withResultCollection() {
        tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_collection, "f").enable();
        return this;
    }
    /** Beta: drain this turn, dispatch registered tools, and collect its final assistant messages. */
    finalResult() {
        return (tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_parsedResult, tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_parsedResult, "f") ?? (0, parse_result_1.parseAgentResultPromise)(tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_collection, "f").finalResult(), tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_format, "f")), "f"));
    }
}
exports.AgentSessionStream = AgentSessionStream;
_AgentSessionStream_iterate = async function* _AgentSessionStream_iterate() {
    const externalSignal = tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_options, "f").signal;
    const abort = () => this.abort(externalSignal?.aborted ? externalSignal.reason : this.controller.signal.reason);
    externalSignal?.addEventListener('abort', abort, { once: true });
    this.controller.signal.addEventListener('abort', abort, { once: true });
    const options = { ...tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_options, "f"), signal: this.controller.signal };
    const state = new turn_state_1.TurnState();
    try {
        if (externalSignal?.aborted) {
            this.abort(externalSignal.reason);
        }
        tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        const session = await tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").retrieve(tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), options);
        if (session.status !== 'idle') {
            throw new error_1.OpenAIError('sessions.stream requires an idle session; use sessions.events.stream for active sessions');
        }
        const subscription = await tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.stream(tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), options).withResponse();
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_stream, subscription.data, "f");
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_response, subscription.response, "f");
        tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        await tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.create(tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), {
            events: [tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_input, "f")],
            // Spread creates an own data property without invoking inherited setters or changing the object prototype.
            ...(tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") === undefined ? {} : { 'Idempotency-Key': tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") }),
        }, {
            ...options,
            headers: (0, headers_1.buildHeaders)([options.headers, { 'Idempotency-Key': tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") ?? null }]),
        });
        tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        tslib_1.__classPrivateFieldSet(this, _AgentSessionStream_reading, true, "f");
        for await (const event of tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_stream, "f")) {
            tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
            if (!state.accept(event)) {
                continue;
            }
            const terminal = state.terminal(event);
            const dispatch = tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_dispatcher, "f").prepare(state.call(event), tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"));
            if (terminal) {
                tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_stream, "f").controller.abort();
            }
            yield event;
            if (terminal) {
                return;
            }
            tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
            await dispatch?.();
        }
        tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        throw new error_1.OpenAIError('Session event stream ended before the turn reached idle or failed');
    }
    finally {
        externalSignal?.removeEventListener('abort', abort);
        this.controller.signal.removeEventListener('abort', abort);
        this.abort();
    }
}, _AgentSessionStream_checkAbort = function _AgentSessionStream_checkAbort() {
    if (this.controller.signal.aborted) {
        throw tslib_1.__classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_abortError).call(this);
    }
}, _AgentSessionStream_abortError = function _AgentSessionStream_abortError() {
    const error = new error_1.APIUserAbortError();
    Object.defineProperty(error, 'cause', {
        value: this.controller.signal.reason,
        writable: true,
        configurable: true,
    });
    return error;
};
//# sourceMappingURL=agent-session-stream.js.map