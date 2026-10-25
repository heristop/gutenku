"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosticFailure = diagnosticFailure;
exports.reportDiagnostic = reportDiagnostic;
const failureReasons = {
    run: 'invalid_output',
    request: 'api_failed',
    arguments: 'invalid_input',
    approval: 'policy_failed',
    action: 'driver_failed',
    output: 'invalid_output',
    selection: 'invalid_output',
    verification: 'invalid_output',
};
function diagnosticFailure(stage, signal) {
    return signal?.aborted ? 'cancelled' : failureReasons[stage];
}
async function settleDiagnostic(result) {
    try {
        await result;
    }
    catch {
        // Observer failures must not change the execution they describe.
    }
}
function reportDiagnostic(observer, event, started, nativeUsage) {
    if (!observer) {
        return;
    }
    try {
        let usage = null;
        if (nativeUsage) {
            const { input_tokens, output_tokens, total_tokens } = nativeUsage;
            if (Number.isSafeInteger(input_tokens) &&
                input_tokens >= 0 &&
                Number.isSafeInteger(output_tokens) &&
                output_tokens >= 0 &&
                Number.isSafeInteger(total_tokens) &&
                total_tokens >= 0) {
                usage = { input_tokens, output_tokens, total_tokens };
            }
        }
        const result = observer({
            ...event,
            call_id: event.call_id ?? null,
            member: event.member ?? null,
            duration_ms: Math.max(0, performance.now() - started),
            usage,
        });
        // Diagnostics never wait for a sink, and rejected observers cannot change dispatch.
        void settleDiagnostic(result);
    }
    catch {
        // Even a broken usage field or observer is outside execution policy.
    }
}
//# sourceMappingURL=runner-diagnostics.js.map