import type OpenAI from "../index.js";
import { OpenAIError } from "../error.js";
import type { RunnerDiagnosticObserver } from "../internal/runner-diagnostics.js";
import type { Decision, DecisionCreateParams, DecisionInputPart } from "../resources/decisions.js";
export type { RunnerDiagnostic, RunnerDiagnosticObserver } from "../internal/runner-diagnostics.js";
/** Current text or inline image evidence. It is sent as a fresh user message each turn. */
export type DecisionObservation = string | OwnedDecisionObservationPart[];
type OwnedDecisionObservationPart = Extract<DecisionInputPart, {
    type: 'input_text' | 'input_image';
}>;
/** The caller supplies every argument in the executor; Decisions selects only its ID. */
export type DecisionCandidate = {
    id: string;
    description: string;
    execute: () => void | Promise<void>;
    done?: false;
} | {
    id: string;
    description: string;
    done: true;
    execute?: never;
};
export interface DecisionsRunnerRegistration {
    observe: () => DecisionObservation | Promise<DecisionObservation>;
    candidates: (observation: DecisionObservation) => DecisionCandidate[] | Promise<DecisionCandidate[]>;
    /** Read independent state. Only literal true reports a verified outcome. */
    verify?: (observation: DecisionObservation) => boolean | Promise<boolean>;
}
export interface DecisionsRunnerParams {
    model: string;
    input: string;
    safety_identifier?: DecisionCreateParams['safety_identifier'];
}
export interface DecisionsRunnerOptions {
    /** Maximum API requests (default 20). No action may run on the final request. */
    maxSteps?: number;
    signal?: AbortSignal;
    /** Local stage timings and actual usage, with no observations, descriptions or error text. */
    onDiagnostic?: RunnerDiagnosticObserver;
    /** Transport settings only. Request body, route and streaming are owned by the runner. */
    requestOptions?: Pick<OpenAI.RequestOptions, 'headers' | 'timeout' | 'maxRetries' | 'signal'>;
}
export interface DecisionsRunResult {
    /** Selection alone is not verification of the task's outcome. */
    status: 'verified' | 'unverified' | 'refused';
    /** Actual Decisions results in request order, without synthetic Responses IDs. */
    decisions: Decision[];
    attemptedCandidateIds: string[];
    completedCandidateIds: string[];
}
export type DecisionsRunnerErrorReason = 'invalid_params' | 'invalid_candidates' | 'invalid_answer' | 'invalid_verification' | 'verification_failed' | 'step_limit' | 'failed' | 'cancelled';
/** Execution evidence contains IDs only, with no driver message, arguments, result or original cause. */
export declare class DecisionsToolRunnerError extends OpenAIError {
    readonly attemptedCandidateIds: string[];
    readonly completedCandidateIds: string[];
    readonly reason: DecisionsRunnerErrorReason;
    constructor(reason: DecisionsRunnerErrorReason, attempted: string[], completed: string[]);
}
/** Bounded choice selection from caller-owned operations. Executors own their driver and action policy. */
export declare class DecisionsToolRunner {
    private readonly registration;
    private readonly lifecycle;
    constructor(registration: DecisionsRunnerRegistration);
    /** Refuse new runs. Await an active run before releasing its caller-owned environment. */
    close(): {
        status: 'closed' | 'draining';
    };
    private static prepare;
    private static prepareRequest;
    private static ownObservation;
    private static validateObservationParts;
    private static ownCandidates;
    private static select;
    private static verifyFinal;
    private static ownDecision;
    run(client: OpenAI, params: DecisionsRunnerParams, options?: DecisionsRunnerOptions): Promise<DecisionsRunResult>;
}
//# sourceMappingURL=decisions-tool-runner.d.ts.map