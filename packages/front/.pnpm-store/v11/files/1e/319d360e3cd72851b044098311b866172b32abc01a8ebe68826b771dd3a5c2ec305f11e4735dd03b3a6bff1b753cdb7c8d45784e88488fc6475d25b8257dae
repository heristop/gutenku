var _ResultCollection_instances, _ResultCollection_iterator, _ResultCollection_ended, _ResultCollection_enabled, _ResultCollection_uncollectedEvents, _ResultCollection_error, _ResultCollection_result, _ResultCollection_source, _ResultCollection_signal, _ResultCollection_canHandle, _ResultCollection_observe, _ResultCollection_collect;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../../internal/tslib.mjs";
import { OpenAIError } from "../../../core/error.mjs";
import { AgentTurnResultCollector } from "./agent-turn-result-collector.mjs";
import { AgentTurnResultError } from "./agent-turn-result-error.mjs";
/** Shares collection between a raw creation stream and the follow-up helper.
 * @internal
 */
export class ResultCollection {
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
        __classPrivateFieldSet(this, _ResultCollection_source, source, "f");
        __classPrivateFieldSet(this, _ResultCollection_signal, signal, "f");
        __classPrivateFieldSet(this, _ResultCollection_canHandle, canHandle, "f");
        this.collector = new AgentTurnResultCollector(sessionID);
    }
    enable() {
        if (!__classPrivateFieldGet(this, _ResultCollection_enabled, "f") && __classPrivateFieldGet(this, _ResultCollection_uncollectedEvents, "f")) {
            throw new OpenAIError('Call withResultCollection() before consuming events, or call finalResult() on a fresh stream.');
        }
        __classPrivateFieldSet(this, _ResultCollection_enabled, true, "f");
    }
    iterate() {
        if (__classPrivateFieldGet(this, _ResultCollection_iterator, "f")) {
            throw new OpenAIError('An agent result stream can only be consumed once');
        }
        return (__classPrivateFieldSet(this, _ResultCollection_iterator, __classPrivateFieldGet(this, _ResultCollection_instances, "m", _ResultCollection_observe).call(this), "f"));
    }
    finalResult() {
        return (__classPrivateFieldSet(this, _ResultCollection_result, __classPrivateFieldGet(this, _ResultCollection_result, "f") ?? __classPrivateFieldGet(this, _ResultCollection_instances, "m", _ResultCollection_collect).call(this), "f"));
    }
}
_ResultCollection_iterator = new WeakMap(), _ResultCollection_ended = new WeakMap(), _ResultCollection_enabled = new WeakMap(), _ResultCollection_uncollectedEvents = new WeakMap(), _ResultCollection_error = new WeakMap(), _ResultCollection_result = new WeakMap(), _ResultCollection_source = new WeakMap(), _ResultCollection_signal = new WeakMap(), _ResultCollection_canHandle = new WeakMap(), _ResultCollection_instances = new WeakSet(), _ResultCollection_observe = async function* _ResultCollection_observe() {
    const iterator = __classPrivateFieldGet(this, _ResultCollection_source, "f").call(this);
    let done = false;
    try {
        while (true) {
            // oxlint-disable-next-line no-await-in-loop -- Pull the single-use stream sequentially.
            const next = await iterator.next();
            if (next.done) {
                done = true;
                return;
            }
            if (__classPrivateFieldGet(this, _ResultCollection_enabled, "f")) {
                this.collector.accept(next.value);
            }
            else {
                __classPrivateFieldSet(this, _ResultCollection_uncollectedEvents, true, "f");
            }
            yield next.value;
        }
    }
    catch (error) {
        if (__classPrivateFieldGet(this, _ResultCollection_enabled, "f")) {
            __classPrivateFieldSet(this, _ResultCollection_error, error, "f");
        }
        throw error;
    }
    finally {
        __classPrivateFieldSet(this, _ResultCollection_ended, true, "f");
        if (!done) {
            await iterator.return?.();
        }
    }
}, _ResultCollection_collect = async function _ResultCollection_collect() {
    this.enable();
    try {
        const iterator = __classPrivateFieldGet(this, _ResultCollection_iterator, "f") ?? this.iterate();
        while (!__classPrivateFieldGet(this, _ResultCollection_ended, "f") && !this.collector.ready) {
            this.collector.checkAction(__classPrivateFieldGet(this, _ResultCollection_canHandle, "f"));
            // oxlint-disable-next-line no-await-in-loop -- Each event can dispatch tools before the next pull.
            const next = await iterator.next();
            if (next.done) {
                break;
            }
        }
        if (__classPrivateFieldGet(this, _ResultCollection_error, "f") !== undefined && !this.collector.ready) {
            throw __classPrivateFieldGet(this, _ResultCollection_error, "f");
        }
        if (!this.collector.ready && __classPrivateFieldGet(this, _ResultCollection_signal, "f")?.aborted) {
            throw this.collector.error('observation', __classPrivateFieldGet(this, _ResultCollection_signal, "f").reason);
        }
        return this.collector.finish();
    }
    catch (error) {
        throw error instanceof AgentTurnResultError ? error : this.collector.error('observation', error);
    }
    finally {
        try {
            await __classPrivateFieldGet(this, _ResultCollection_iterator, "f")?.return();
        }
        finally {
            this.collector.release();
        }
    }
};
//# sourceMappingURL=result-collection.mjs.map