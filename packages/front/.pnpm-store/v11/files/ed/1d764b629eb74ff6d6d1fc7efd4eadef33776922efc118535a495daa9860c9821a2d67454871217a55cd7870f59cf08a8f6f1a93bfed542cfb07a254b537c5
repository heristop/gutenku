"use strict";
var _ResultCollection_instances, _ResultCollection_iterator, _ResultCollection_ended, _ResultCollection_enabled, _ResultCollection_uncollectedEvents, _ResultCollection_error, _ResultCollection_result, _ResultCollection_source, _ResultCollection_signal, _ResultCollection_canHandle, _ResultCollection_observe, _ResultCollection_collect;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultCollection = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const error_1 = require("../../../core/error.js");
const agent_turn_result_collector_1 = require("./agent-turn-result-collector.js");
const agent_turn_result_error_1 = require("./agent-turn-result-error.js");
/** Shares collection between a raw creation stream and the follow-up helper.
 * @internal
 */
class ResultCollection {
    constructor(source, canHandle = () => false, sessionID, signal) {
        _ResultCollection_instances.add(this);
        _ResultCollection_iterator.set(this, void 0);
        _ResultCollection_ended.set(this, false);
        _ResultCollection_enabled.set(this, false);
        _ResultCollection_uncollectedEvents.set(this, false);
        _ResultCollection_error.set(this, void 0);
        _ResultCollection_result.set(this, void 0);
        _ResultCollection_source.set(this, void 0);
        _ResultCollection_signal.set(this, void 0);
        _ResultCollection_canHandle.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _ResultCollection_source, source, "f");
        tslib_1.__classPrivateFieldSet(this, _ResultCollection_signal, signal, "f");
        tslib_1.__classPrivateFieldSet(this, _ResultCollection_canHandle, canHandle, "f");
        this.collector = new agent_turn_result_collector_1.AgentTurnResultCollector(sessionID);
    }
    enable() {
        if (!tslib_1.__classPrivateFieldGet(this, _ResultCollection_enabled, "f") && tslib_1.__classPrivateFieldGet(this, _ResultCollection_uncollectedEvents, "f")) {
            throw new error_1.OpenAIError('Call withResultCollection() before consuming events, or call finalResult() on a fresh stream.');
        }
        tslib_1.__classPrivateFieldSet(this, _ResultCollection_enabled, true, "f");
    }
    iterate() {
        if (tslib_1.__classPrivateFieldGet(this, _ResultCollection_iterator, "f")) {
            throw new error_1.OpenAIError('An agent result stream can only be consumed once');
        }
        return (tslib_1.__classPrivateFieldSet(this, _ResultCollection_iterator, tslib_1.__classPrivateFieldGet(this, _ResultCollection_instances, "m", _ResultCollection_observe).call(this), "f"));
    }
    finalResult() {
        return (tslib_1.__classPrivateFieldSet(this, _ResultCollection_result, tslib_1.__classPrivateFieldGet(this, _ResultCollection_result, "f") ?? tslib_1.__classPrivateFieldGet(this, _ResultCollection_instances, "m", _ResultCollection_collect).call(this), "f"));
    }
}
exports.ResultCollection = ResultCollection;
_ResultCollection_iterator = new WeakMap(), _ResultCollection_ended = new WeakMap(), _ResultCollection_enabled = new WeakMap(), _ResultCollection_uncollectedEvents = new WeakMap(), _ResultCollection_error = new WeakMap(), _ResultCollection_result = new WeakMap(), _ResultCollection_source = new WeakMap(), _ResultCollection_signal = new WeakMap(), _ResultCollection_canHandle = new WeakMap(), _ResultCollection_instances = new WeakSet(), _ResultCollection_observe = async function* _ResultCollection_observe() {
    const iterator = tslib_1.__classPrivateFieldGet(this, _ResultCollection_source, "f").call(this);
    let done = false;
    try {
        while (true) {
            // oxlint-disable-next-line no-await-in-loop -- Pull the single-use stream sequentially.
            const next = await iterator.next();
            if (next.done) {
                done = true;
                return;
            }
            if (tslib_1.__classPrivateFieldGet(this, _ResultCollection_enabled, "f")) {
                this.collector.accept(next.value);
            }
            else {
                tslib_1.__classPrivateFieldSet(this, _ResultCollection_uncollectedEvents, true, "f");
            }
            yield next.value;
        }
    }
    catch (error) {
        if (tslib_1.__classPrivateFieldGet(this, _ResultCollection_enabled, "f")) {
            tslib_1.__classPrivateFieldSet(this, _ResultCollection_error, error, "f");
        }
        throw error;
    }
    finally {
        tslib_1.__classPrivateFieldSet(this, _ResultCollection_ended, true, "f");
        if (!done) {
            await iterator.return?.();
        }
    }
}, _ResultCollection_collect = async function _ResultCollection_collect() {
    this.enable();
    try {
        const iterator = tslib_1.__classPrivateFieldGet(this, _ResultCollection_iterator, "f") ?? this.iterate();
        while (!tslib_1.__classPrivateFieldGet(this, _ResultCollection_ended, "f") && !this.collector.ready) {
            this.collector.checkAction(tslib_1.__classPrivateFieldGet(this, _ResultCollection_canHandle, "f"));
            // oxlint-disable-next-line no-await-in-loop -- Each event can dispatch tools before the next pull.
            const next = await iterator.next();
            if (next.done) {
                break;
            }
        }
        if (tslib_1.__classPrivateFieldGet(this, _ResultCollection_error, "f") !== undefined && !this.collector.ready) {
            throw tslib_1.__classPrivateFieldGet(this, _ResultCollection_error, "f");
        }
        if (!this.collector.ready && tslib_1.__classPrivateFieldGet(this, _ResultCollection_signal, "f")?.aborted) {
            throw this.collector.error('observation', tslib_1.__classPrivateFieldGet(this, _ResultCollection_signal, "f").reason);
        }
        return this.collector.finish();
    }
    catch (error) {
        throw error instanceof agent_turn_result_error_1.AgentTurnResultError ? error : this.collector.error('observation', error);
    }
    finally {
        try {
            await tslib_1.__classPrivateFieldGet(this, _ResultCollection_iterator, "f")?.return();
        }
        finally {
            this.collector.release();
        }
    }
};
//# sourceMappingURL=result-collection.js.map