"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareVertexAuth = prepareVertexAuth;
const error_1 = require("../core/error.js");
function createVertexUserAbortError(signal) {
    const error = new error_1.APIUserAbortError();
    Object.defineProperty(error, 'cause', {
        value: signal.reason,
        writable: true,
        configurable: true,
    });
    return error;
}
function removeVertexAbortListener(signal, listener) {
    try {
        signal.removeEventListener('abort', listener);
    }
    catch {
        // A nonstandard AbortSignal must not replace the actual request outcome.
    }
}
function resolveAbortableVertexAuth(operation, signals, failure) {
    // oxlint-disable-next-line promise/avoid-new -- AbortSignal events require a Promise callback bridge.
    return new Promise((resolve, reject) => {
        let settled = false;
        const listeners = [];
        const removeListeners = () => {
            while (listeners.length > 0) {
                const registered = listeners.pop();
                if (registered) {
                    removeVertexAbortListener(registered.signal, registered.listener);
                }
            }
        };
        failure.removeListeners = removeListeners;
        const settle = (result) => {
            if (settled) {
                return;
            }
            settled = true;
            if ('value' in result) {
                resolve(result.value);
            }
            else {
                removeListeners();
                reject(result.error);
            }
        };
        // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Failures and rejection reasons can be arbitrary JavaScript values; preserve them until inspection or forwarding.
        const rejectSignalFailure = (error) => {
            if (failure.error) {
                return;
            }
            failure.error = { value: error };
            settle({ error });
        };
        const registerAbortListener = (signal) => {
            const onAbort = () => {
                if (failure.error) {
                    return;
                }
                try {
                    rejectSignalFailure(createVertexUserAbortError(signal));
                }
                catch (error) {
                    rejectSignalFailure(error);
                }
            };
            try {
                if (signal.aborted) {
                    onAbort();
                    return false;
                }
                listeners.push({ signal, listener: onAbort });
                signal.addEventListener('abort', onAbort, { once: true });
                if (settled) {
                    removeVertexAbortListener(signal, onAbort);
                    return false;
                }
                if (signal.aborted) {
                    onAbort();
                    return false;
                }
            }
            catch (error) {
                if (settled) {
                    removeVertexAbortListener(signal, onAbort);
                }
                else {
                    rejectSignalFailure(error);
                }
                return false;
            }
            return true;
        };
        for (const signal of signals) {
            if (!registerAbortListener(signal)) {
                return;
            }
        }
        let pending;
        try {
            pending = operation();
        }
        catch (error) {
            settle({ error });
            return;
        }
        const observeResult = async () => {
            try {
                settle({ value: await pending });
            }
            catch (error) {
                settle({ error });
            }
        };
        // Observe the result even if the provider synchronously triggered cancellation.
        void observeResult();
    });
}
/**
 * Resolves Vertex authentication work with caller cancellation, then applies
 * its result synchronously after the final cancellation checks.
 *
 * @internal
 */
async function prepareVertexAuth(request, context, operation, additionalSignals = []) {
    const signals = [];
    for (const signal of [context.options.signal, request.signal, ...additionalSignals]) {
        if (signal !== null && signal !== undefined && !signals.includes(signal)) {
            signals.push(signal);
        }
    }
    const signalFailure = {};
    let value;
    try {
        value =
            signals.length > 0
                ? await resolveAbortableVertexAuth(operation.resolve, signals, signalFailure)
                : await operation.resolve();
        if (signalFailure.error) {
            throw signalFailure.error.value;
        }
        for (const signal of signals) {
            if (signal.aborted) {
                throw createVertexUserAbortError(signal);
            }
        }
    }
    finally {
        signalFailure.removeListeners?.();
    }
    operation.apply(value);
}
//# sourceMappingURL=vertex.js.map