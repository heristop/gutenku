var _AgentTurnResultCollector_instances, _AgentTurnResultCollector_sessionID, _AgentTurnResultCollector_turn, _AgentTurnResultCollector_messages, _AgentTurnResultCollector_requiredActions, _AgentTurnResultCollector_sessionFailed, _AgentTurnResultCollector_terminal, _AgentTurnResultCollector_idle, _AgentTurnResultCollector_acceptTurn, _AgentTurnResultCollector_acceptOutput, _AgentTurnResultCollector_finalMessages;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../../internal/tslib.mjs";
import { AgentTurnResult } from "./agent-turn-result.mjs";
import { AgentTurnResultError } from "./agent-turn-result-error.mjs";
/** Accumulates completed items independently of transport and tool execution.
 * @internal
 */
export class AgentTurnResultCollector {
    constructor(sessionID) {
        _AgentTurnResultCollector_instances.add(this);
        _AgentTurnResultCollector_sessionID.set(this, void 0);
        _AgentTurnResultCollector_turn.set(this, void 0);
        _AgentTurnResultCollector_messages.set(this, new Map());
        _AgentTurnResultCollector_requiredActions.set(this, []);
        _AgentTurnResultCollector_sessionFailed.set(this, false);
        _AgentTurnResultCollector_terminal.set(this, false);
        _AgentTurnResultCollector_idle.set(this, false);
        __classPrivateFieldSet(this, _AgentTurnResultCollector_sessionID, sessionID, "f");
    }
    accept(event) {
        if (this.ready) {
            return;
        }
        if ('session' in event) {
            __classPrivateFieldSet(this, _AgentTurnResultCollector_sessionID, __classPrivateFieldGet(this, _AgentTurnResultCollector_sessionID, "f") ?? event.session.id, "f");
            __classPrivateFieldSet(this, _AgentTurnResultCollector_requiredActions, structuredClone(event.session.required_actions ?? []), "f");
            __classPrivateFieldSet(this, _AgentTurnResultCollector_sessionFailed, __classPrivateFieldGet(this, _AgentTurnResultCollector_sessionFailed, "f") || event.type === 'agent.session.failed', "f");
            __classPrivateFieldSet(this, _AgentTurnResultCollector_idle, __classPrivateFieldGet(this, _AgentTurnResultCollector_idle, "f") || event.type === 'agent.session.idle' && __classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f"), "f");
        }
        if (event.type === 'agent.session.turn.created' && event.turn.subagent_id === null && !__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")) {
            __classPrivateFieldSet(this, _AgentTurnResultCollector_turn, structuredClone(event.turn), "f");
            __classPrivateFieldSet(this, _AgentTurnResultCollector_sessionID, event.turn.session_id, "f");
        }
        let turnID = 'turn_id' in event ? event.turn_id : undefined;
        if ('item' in event) {
            turnID = event.item.turn_id;
        }
        if (!__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f") || turnID !== __classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f").id) {
            return;
        }
        __classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_acceptTurn).call(this, event);
    }
    error(reason, cause) {
        return new AgentTurnResultError(reason, __classPrivateFieldGet(this, _AgentTurnResultCollector_sessionID, "f"), __classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f"), __classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_finalMessages).call(this), __classPrivateFieldGet(this, _AgentTurnResultCollector_requiredActions, "f"), cause);
    }
    checkAction(canHandle) {
        if (__classPrivateFieldGet(this, _AgentTurnResultCollector_sessionFailed, "f") || __classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")?.status === 'failed') {
            throw this.error('failed');
        }
        if (__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")?.status === 'cancelled') {
            throw this.error('cancelled');
        }
        if (__classPrivateFieldGet(this, _AgentTurnResultCollector_requiredActions, "f").some((action) => action.type !== 'function_call' || !canHandle(action.name))) {
            throw this.error('requires_action');
        }
    }
    get ready() {
        return __classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f") && __classPrivateFieldGet(this, _AgentTurnResultCollector_idle, "f");
    }
    release() {
        __classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").clear();
        __classPrivateFieldSet(this, _AgentTurnResultCollector_requiredActions, [], "f");
    }
    finish() {
        this.checkAction(() => this.ready);
        if (!__classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f") || __classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")?.status !== 'completed' || !__classPrivateFieldGet(this, _AgentTurnResultCollector_idle, "f")) {
            throw this.error('observation');
        }
        return new AgentTurnResult(__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f"), __classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_finalMessages).call(this));
    }
}
_AgentTurnResultCollector_sessionID = new WeakMap(), _AgentTurnResultCollector_turn = new WeakMap(), _AgentTurnResultCollector_messages = new WeakMap(), _AgentTurnResultCollector_requiredActions = new WeakMap(), _AgentTurnResultCollector_sessionFailed = new WeakMap(), _AgentTurnResultCollector_terminal = new WeakMap(), _AgentTurnResultCollector_idle = new WeakMap(), _AgentTurnResultCollector_instances = new WeakSet(), _AgentTurnResultCollector_acceptTurn = function _AgentTurnResultCollector_acceptTurn(event) {
    if ('turn' in event) {
        __classPrivateFieldSet(this, _AgentTurnResultCollector_turn, structuredClone(event.turn), "f");
        __classPrivateFieldSet(this, _AgentTurnResultCollector_terminal, __classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f") || (event.type === 'agent.session.turn.completed' ||
            event.type === 'agent.session.turn.failed' ||
            event.type === 'agent.session.turn.cancelled'), "f");
    }
    __classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_acceptOutput).call(this, event);
}, _AgentTurnResultCollector_acceptOutput = function _AgentTurnResultCollector_acceptOutput(event) {
    if (event.type !== 'agent.session.turn.item.done' ||
        event.item.type !== 'message' ||
        event.item.status !== 'completed' ||
        event.item.phase === 'commentary' ||
        __classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").has(event.item.id)) {
        return;
    }
    __classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").set(event.item.id, { index: event.output_index, message: structuredClone(event.item) });
}, _AgentTurnResultCollector_finalMessages = function _AgentTurnResultCollector_finalMessages() {
    return ([...__classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").values()]
        // oxlint-disable-next-line unicorn/no-array-sort -- Sort a fresh array; ES2020 declarations do not include toSorted.
        .sort((a, b) => a.index - b.index)
        .map(({ message }) => message));
};
//# sourceMappingURL=agent-turn-result-collector.mjs.map