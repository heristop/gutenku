"use strict";
var _AgentTurnResultCollector_instances, _AgentTurnResultCollector_sessionID, _AgentTurnResultCollector_turn, _AgentTurnResultCollector_messages, _AgentTurnResultCollector_requiredActions, _AgentTurnResultCollector_sessionFailed, _AgentTurnResultCollector_terminal, _AgentTurnResultCollector_idle, _AgentTurnResultCollector_acceptTurn, _AgentTurnResultCollector_acceptOutput, _AgentTurnResultCollector_finalMessages;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTurnResultCollector = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const agent_turn_result_1 = require("./agent-turn-result.js");
const agent_turn_result_error_1 = require("./agent-turn-result-error.js");
/** Accumulates completed items independently of transport and tool execution.
 * @internal
 */
class AgentTurnResultCollector {
    constructor(sessionID) {
        _AgentTurnResultCollector_instances.add(this);
        _AgentTurnResultCollector_sessionID.set(this, void 0);
        _AgentTurnResultCollector_turn.set(this, void 0);
        _AgentTurnResultCollector_messages.set(this, new Map());
        _AgentTurnResultCollector_requiredActions.set(this, []);
        _AgentTurnResultCollector_sessionFailed.set(this, false);
        _AgentTurnResultCollector_terminal.set(this, false);
        _AgentTurnResultCollector_idle.set(this, false);
        tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_sessionID, sessionID, "f");
    }
    accept(event) {
        if (this.ready) {
            return;
        }
        if ('session' in event) {
            tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_sessionID, tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_sessionID, "f") ?? event.session.id, "f");
            tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_requiredActions, structuredClone(event.session.required_actions ?? []), "f");
            tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_sessionFailed, tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_sessionFailed, "f") || event.type === 'agent.session.failed', "f");
            tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_idle, tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_idle, "f") || event.type === 'agent.session.idle' && tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f"), "f");
        }
        if (event.type === 'agent.session.turn.created' && event.turn.subagent_id === null && !tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")) {
            tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_turn, structuredClone(event.turn), "f");
            tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_sessionID, event.turn.session_id, "f");
        }
        let turnID = 'turn_id' in event ? event.turn_id : undefined;
        if ('item' in event) {
            turnID = event.item.turn_id;
        }
        if (!tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f") || turnID !== tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f").id) {
            return;
        }
        tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_acceptTurn).call(this, event);
    }
    error(reason, cause) {
        return new agent_turn_result_error_1.AgentTurnResultError(reason, tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_sessionID, "f"), tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f"), tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_finalMessages).call(this), tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_requiredActions, "f"), cause);
    }
    checkAction(canHandle) {
        if (tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_sessionFailed, "f") || tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")?.status === 'failed') {
            throw this.error('failed');
        }
        if (tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")?.status === 'cancelled') {
            throw this.error('cancelled');
        }
        if (tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_requiredActions, "f").some((action) => action.type !== 'function_call' || !canHandle(action.name))) {
            throw this.error('requires_action');
        }
    }
    get ready() {
        return tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f") && tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_idle, "f");
    }
    release() {
        tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").clear();
        tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_requiredActions, [], "f");
    }
    finish() {
        this.checkAction(() => this.ready);
        if (!tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f") || tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f")?.status !== 'completed' || !tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_idle, "f")) {
            throw this.error('observation');
        }
        return new agent_turn_result_1.AgentTurnResult(tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_turn, "f"), tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_finalMessages).call(this));
    }
}
exports.AgentTurnResultCollector = AgentTurnResultCollector;
_AgentTurnResultCollector_sessionID = new WeakMap(), _AgentTurnResultCollector_turn = new WeakMap(), _AgentTurnResultCollector_messages = new WeakMap(), _AgentTurnResultCollector_requiredActions = new WeakMap(), _AgentTurnResultCollector_sessionFailed = new WeakMap(), _AgentTurnResultCollector_terminal = new WeakMap(), _AgentTurnResultCollector_idle = new WeakMap(), _AgentTurnResultCollector_instances = new WeakSet(), _AgentTurnResultCollector_acceptTurn = function _AgentTurnResultCollector_acceptTurn(event) {
    if ('turn' in event) {
        tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_turn, structuredClone(event.turn), "f");
        tslib_1.__classPrivateFieldSet(this, _AgentTurnResultCollector_terminal, tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_terminal, "f") || (event.type === 'agent.session.turn.completed' ||
            event.type === 'agent.session.turn.failed' ||
            event.type === 'agent.session.turn.cancelled'), "f");
    }
    tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_instances, "m", _AgentTurnResultCollector_acceptOutput).call(this, event);
}, _AgentTurnResultCollector_acceptOutput = function _AgentTurnResultCollector_acceptOutput(event) {
    if (event.type !== 'agent.session.turn.item.done' ||
        event.item.type !== 'message' ||
        event.item.status !== 'completed' ||
        event.item.phase === 'commentary' ||
        tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").has(event.item.id)) {
        return;
    }
    tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").set(event.item.id, { index: event.output_index, message: structuredClone(event.item) });
}, _AgentTurnResultCollector_finalMessages = function _AgentTurnResultCollector_finalMessages() {
    return ([...tslib_1.__classPrivateFieldGet(this, _AgentTurnResultCollector_messages, "f").values()]
        // oxlint-disable-next-line unicorn/no-array-sort -- Sort a fresh array; ES2020 declarations do not include toSorted.
        .sort((a, b) => a.index - b.index)
        .map(({ message }) => message));
};
//# sourceMappingURL=agent-turn-result-collector.js.map