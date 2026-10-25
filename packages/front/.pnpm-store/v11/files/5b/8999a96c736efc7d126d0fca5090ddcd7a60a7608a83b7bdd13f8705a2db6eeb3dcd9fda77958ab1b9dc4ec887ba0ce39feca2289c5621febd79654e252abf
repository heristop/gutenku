import type { ResponseUsage } from "../resources/responses/responses.mjs";
import type { Decision } from "../resources/decisions.mjs";
/** Local execution evidence. Call identities can contain application data; inspect before sharing. */
export interface RunnerDiagnostic {
    api: 'responses' | 'decisions' | 'browser' | 'computer';
    stage: 'run' | 'request' | 'arguments' | 'approval' | 'action' | 'output' | 'selection' | 'verification';
    reason: 'started' | 'completed' | 'refused' | 'cancelled' | 'invalid_input' | 'invalid_output' | 'api_failed' | 'driver_failed' | 'policy_failed' | 'step_limit' | 'busy' | 'closed';
    call_id: string | null;
    member: string | null;
    duration_ms: number;
    usage: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
    } | null;
}
/** Observers cannot change an execution result. Promise failures are consumed without waiting. */
export type RunnerDiagnosticObserver = (event: Readonly<RunnerDiagnostic>) => void;
export declare function diagnosticFailure(stage: RunnerDiagnostic['stage'], signal?: AbortSignal): RunnerDiagnostic['reason'];
export declare function reportDiagnostic(observer: RunnerDiagnosticObserver | undefined, event: Pick<RunnerDiagnostic, 'api' | 'stage' | 'reason'> & Partial<Pick<RunnerDiagnostic, 'call_id' | 'member'>>, started: number, nativeUsage?: ResponseUsage | Decision['usage'] | null): void;
//# sourceMappingURL=runner-diagnostics.d.mts.map