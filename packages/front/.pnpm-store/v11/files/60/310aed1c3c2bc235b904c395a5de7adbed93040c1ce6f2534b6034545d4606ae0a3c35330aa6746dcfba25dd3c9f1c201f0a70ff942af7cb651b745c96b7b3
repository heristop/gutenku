var _AgentSessionStream_instances, _AgentSessionStream_consumed, _AgentSessionStream_format, _AgentSessionStream_parsedResult, _AgentSessionStream_collection, _AgentSessionStream_stream, _AgentSessionStream_response, _AgentSessionStream_reading, _AgentSessionStream_sessions, _AgentSessionStream_sessionID, _AgentSessionStream_input, _AgentSessionStream_dispatcher, _AgentSessionStream_inputKey, _AgentSessionStream_options, _AgentSessionStream_iterate, _AgentSessionStream_checkAbort, _AgentSessionStream_abortError;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../internal/tslib.mjs";
import { TurnState } from "./turn-state.mjs";
import { AgentToolDispatcher } from "../beta/agents/tool-dispatcher.mjs";
import { agentFormatParser, parseAgentResultPromise } from "../beta/agents/parse-result.mjs";
import { ResultCollection } from "../beta/agents/result-collection.mjs";
import { APIUserAbortError, OpenAIError } from "../../core/error.mjs";
import { buildHeaders } from "../../internal/headers.mjs";
import { uuid4 } from "../../internal/utils/uuid.mjs";
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
export class AgentSessionStream {
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
            throw new OpenAIError('input must not be empty');
        }
        __classPrivateFieldSet(this, _AgentSessionStream_format, agentFormatParser(params.outputFormat), "f");
        if (params.outputFormat && !__classPrivateFieldGet(this, _AgentSessionStream_format, "f")) {
            throw new OpenAIError('outputFormat must have its own parser function');
        }
        __classPrivateFieldSet(this, _AgentSessionStream_sessions, sessions, "f");
        __classPrivateFieldSet(this, _AgentSessionStream_sessionID, sessionID, "f");
        __classPrivateFieldSet(this, _AgentSessionStream_input, { type: 'agent.session.input.message', input }, "f");
        const headers = buildHeaders([options?.headers]);
        __classPrivateFieldSet(this, _AgentSessionStream_inputKey, headers.nulls.has('idempotency-key')
            ? undefined
            : (headers.values.get('idempotency-key') ??
                params.idempotencyKey ??
                options?.idempotencyKey ??
                uuid4()), "f");
        headers.values.delete('idempotency-key');
        headers.nulls.delete('idempotency-key');
        const { idempotencyKey: _key, ...rest } = options ?? {};
        __classPrivateFieldSet(this, _AgentSessionStream_options, { ...rest, headers }, "f");
        __classPrivateFieldSet(this, _AgentSessionStream_dispatcher, new AgentToolDispatcher(sessions, params.toolHandlers ?? {}, this.controller, __classPrivateFieldGet(this, _AgentSessionStream_options, "f"), params.onToolError), "f");
        __classPrivateFieldSet(this, _AgentSessionStream_collection, new ResultCollection(() => __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_iterate).call(this), (name) => __classPrivateFieldGet(this, _AgentSessionStream_dispatcher, "f").canHandle(name), sessionID), "f");
    }
    /** Closes local requests without cancelling the turn; an optional reason becomes the abort error's cause. */
    abort(reason) {
        this.controller.abort(reason);
        __classPrivateFieldGet(this, _AgentSessionStream_stream, "f")?.controller.abort(this.controller.signal.reason);
        if (!__classPrivateFieldGet(this, _AgentSessionStream_reading, "f")) {
            void cancelBody(__classPrivateFieldGet(this, _AgentSessionStream_response, "f"));
        }
    }
    /** Starts iteration once; use for await to ensure early exits close the connection. */
    [(_AgentSessionStream_consumed = new WeakMap(), _AgentSessionStream_format = new WeakMap(), _AgentSessionStream_parsedResult = new WeakMap(), _AgentSessionStream_collection = new WeakMap(), _AgentSessionStream_stream = new WeakMap(), _AgentSessionStream_response = new WeakMap(), _AgentSessionStream_reading = new WeakMap(), _AgentSessionStream_sessions = new WeakMap(), _AgentSessionStream_sessionID = new WeakMap(), _AgentSessionStream_input = new WeakMap(), _AgentSessionStream_dispatcher = new WeakMap(), _AgentSessionStream_inputKey = new WeakMap(), _AgentSessionStream_options = new WeakMap(), _AgentSessionStream_instances = new WeakSet(), Symbol.asyncIterator)]() {
        if (__classPrivateFieldGet(this, _AgentSessionStream_consumed, "f")) {
            throw new OpenAIError('An AgentSessionStream can only be consumed once');
        }
        __classPrivateFieldSet(this, _AgentSessionStream_consumed, true, "f");
        return __classPrivateFieldGet(this, _AgentSessionStream_collection, "f").iterate();
    }
    /** Beta: opt into retaining completed final messages before iterating progress events. */
    withResultCollection() {
        __classPrivateFieldGet(this, _AgentSessionStream_collection, "f").enable();
        return this;
    }
    /** Beta: drain this turn, dispatch registered tools, and collect its final assistant messages. */
    finalResult() {
        return (__classPrivateFieldSet(this, _AgentSessionStream_parsedResult, __classPrivateFieldGet(this, _AgentSessionStream_parsedResult, "f") ?? parseAgentResultPromise(__classPrivateFieldGet(this, _AgentSessionStream_collection, "f").finalResult(), __classPrivateFieldGet(this, _AgentSessionStream_format, "f")), "f"));
    }
}
_AgentSessionStream_iterate = async function* _AgentSessionStream_iterate() {
    const externalSignal = __classPrivateFieldGet(this, _AgentSessionStream_options, "f").signal;
    const abort = () => this.abort(externalSignal?.aborted ? externalSignal.reason : this.controller.signal.reason);
    externalSignal?.addEventListener('abort', abort, { once: true });
    this.controller.signal.addEventListener('abort', abort, { once: true });
    const options = { ...__classPrivateFieldGet(this, _AgentSessionStream_options, "f"), signal: this.controller.signal };
    const state = new TurnState();
    try {
        if (externalSignal?.aborted) {
            this.abort(externalSignal.reason);
        }
        __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        const session = await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").retrieve(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), options);
        if (session.status !== 'idle') {
            throw new OpenAIError('sessions.stream requires an idle session; use sessions.events.stream for active sessions');
        }
        const subscription = await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.stream(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), options).withResponse();
        __classPrivateFieldSet(this, _AgentSessionStream_stream, subscription.data, "f");
        __classPrivateFieldSet(this, _AgentSessionStream_response, subscription.response, "f");
        __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        await __classPrivateFieldGet(this, _AgentSessionStream_sessions, "f").events.create(__classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"), {
            events: [__classPrivateFieldGet(this, _AgentSessionStream_input, "f")],
            // Spread creates an own data property without invoking inherited setters or changing the object prototype.
            ...(__classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") === undefined ? {} : { 'Idempotency-Key': __classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") }),
        }, {
            ...options,
            headers: buildHeaders([options.headers, { 'Idempotency-Key': __classPrivateFieldGet(this, _AgentSessionStream_inputKey, "f") ?? null }]),
        });
        __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        __classPrivateFieldSet(this, _AgentSessionStream_reading, true, "f");
        for await (const event of __classPrivateFieldGet(this, _AgentSessionStream_stream, "f")) {
            __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
            if (!state.accept(event)) {
                continue;
            }
            const terminal = state.terminal(event);
            const dispatch = __classPrivateFieldGet(this, _AgentSessionStream_dispatcher, "f").prepare(state.call(event), __classPrivateFieldGet(this, _AgentSessionStream_sessionID, "f"));
            if (terminal) {
                __classPrivateFieldGet(this, _AgentSessionStream_stream, "f").controller.abort();
            }
            yield event;
            if (terminal) {
                return;
            }
            __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
            await dispatch?.();
        }
        __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_checkAbort).call(this);
        throw new OpenAIError('Session event stream ended before the turn reached idle or failed');
    }
    finally {
        externalSignal?.removeEventListener('abort', abort);
        this.controller.signal.removeEventListener('abort', abort);
        this.abort();
    }
}, _AgentSessionStream_checkAbort = function _AgentSessionStream_checkAbort() {
    if (this.controller.signal.aborted) {
        throw __classPrivateFieldGet(this, _AgentSessionStream_instances, "m", _AgentSessionStream_abortError).call(this);
    }
}, _AgentSessionStream_abortError = function _AgentSessionStream_abortError() {
    const error = new APIUserAbortError();
    Object.defineProperty(error, 'cause', {
        value: this.controller.signal.reason,
        writable: true,
        configurable: true,
    });
    return error;
};
//# sourceMappingURL=agent-session-stream.mjs.map