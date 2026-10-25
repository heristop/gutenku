import type OpenAI from "../index.mjs";
import { OpenAIError } from "../error.mjs";
import type { AutoParseableResponseTool } from "../lib/ResponsesParser.mjs";
import type { RunnerDiagnosticObserver } from "../internal/runner-diagnostics.mjs";
import type { FunctionTool, Response, ResponseCreateParamsNonStreaming, ResponseInputItem, ResponseOutputItem, ResponseStreamEvent, Tool } from "../resources/responses/responses.mjs";
import type { BrowserToolset } from "./browser.mjs";
import { ComputerToolset } from "./computer.mjs";
import type { ComputerExecutionOptions } from "./computer.mjs";
export type { RunnerDiagnostic, RunnerDiagnosticObserver } from "../internal/runner-diagnostics.mjs";
/** Caller-owned function and its wire declaration. The executor receives decoded JSON objects. */
export interface RunnerFunction {
    /** Function schema exposed to the model. Names must be unique among all registered tools. */
    tool: FunctionTool;
    /** Permit a caller to supply this ordinary function's output at an iterator boundary. */
    allowOutputOverride?: boolean;
    /** May finish beside stream consumption. Use only for independent ordinary functions. */
    independent?: boolean;
    /** Return a native function output: text, or input text/image/file content blocks. Errors stop the run. */
    execute: (args: Record<string, unknown>, options?: {
        signal: AbortSignal | undefined;
    }) => ResponseInputItem.FunctionCallOutput['output'] | Promise<ResponseInputItem.FunctionCallOutput['output']>;
}
/** Local permission to start tools on completed stream items, before full-response inspection. */
export interface ResponsesEarlyExecution {
    /** Registered ordinary function or exposed browser member wire names. Unlisted names wait. */
    functions?: readonly string[];
    /** Permit the native computer dispatcher. Individual actions and safety checks still require approval. */
    computer?: boolean;
}
/** Tools that share a single Responses conversation. */
export interface ResponsesRunnerTools {
    /** Structured browser function tools. */
    browser?: BrowserToolset;
    /** Existing native computer dispatcher. Defaults to the computer tool declaration. */
    computer?: ComputerToolset;
    /** Other functions to run in output order alongside browser and computer calls. */
    functions?: RunnerFunction[];
    /**
     * Requires stream + eager. Omitted/null keeps the existing blanket eager opt-in;
     * {} permits no early tools. The first deferred call holds the rest in output order.
     */
    earlyExecution?: ResponsesEarlyExecution | null | undefined;
}
/** Per-run bounds, request, stream and execution options. */
export interface ResponsesRunnerOptions {
    /** Maximum number of API requests (default 20). No effects run on the final allowed request. */
    maxSteps?: number;
    /** Stream API events through onEvent; actions normally wait for a completed response. */
    stream?: boolean;
    /** Opt in to early execution on output_item.done, before the stream completes. Requires stream. */
    eager?: boolean;
    /** Maximum independent eager calls admitted before settling. Positive safe integer; default 2. */
    maxConcurrentCalls?: number;
    /** Invoked in event order; receives a detached event so mutations cannot change dispatch. */
    onEvent?: (event: ResponseStreamEvent) => void | Promise<void>;
    /** Stop before the next effect or request. Cancellation after partial execution reports call IDs. */
    signal?: AbortSignal;
    /**
     * Passed to each ordinary request; used as the signal when top-level signal is omitted.
     * Signal and retry overrides use a view without changing the caller's object.
     * Supply trusted configuration: native overrides can change the request body or destination.
     * Ledger mode accepts only its restricted transport options.
     */
    requestOptions?: OpenAI.RequestOptions;
    /** Forwarded to ComputerToolset.execute for native safety checks and beforeAction. */
    computerOptions?: ComputerExecutionOptions;
    /** Answer an actual MCP approval request after response inspection. Only true or false is accepted. */
    approveMcp?: (request: Readonly<ResponseOutputItem.McpApprovalRequest>) => boolean | Promise<boolean>;
    /** Local execution stages and actual request usage, without raw tool or page values. */
    onDiagnostic?: RunnerDiagnosticObserver;
    /** Defer one otherwise permitted eager call until completed turn inspection. */
    beforeEarlyCall?: (call: Readonly<Extract<ResponseOutputItem, {
        type: 'function_call' | 'computer_call';
    }>>) => 'execute' | 'defer' | Promise<'execute' | 'defer'>;
    /** Durable opt-in. save must commit before returning; the caller owns storage and exclusion. */
    ledger?: ResponsesRunnerLedger;
    /** Bounds on each native request input; omitted/null preserves full replay. */
    contextBudget?: ResponsesContextBudget | null | undefined;
}
/** A local input representation budget, not a token, cost, or ledger-storage limit. */
export interface ResponsesContextBudget {
    maxInputBytes: number;
    maxInputImages: number;
    /** Minimum newest screenshot pairs retained (default 1). */
    keepRecentScreenshots?: number;
    /** Called only when the validated next input exceeds a bound, before request admission. */
    compact?: (snapshot: {
        history: ResponseInputItem[];
        eligibleCallIds: string[];
        inputBytes: number;
        inputImages: number;
    }) => {
        dropCallIds: string[];
        summary?: string;
    } | Promise<{
        dropCallIds: string[];
        summary?: string;
    }>;
}
/** Private replay evidence, never proof of an externally committed effect. */
export interface ResponsesRunnerCheckpoint {
    version: 1;
    run_id: string;
    revision: number;
    phase: 'boundary' | 'pending' | 'final';
    max_steps: number;
    consumed_requests: number;
    /** Registry identity. Saved MCP declarations omit authorization and headers and fingerprint server URLs.
     * Resume uses current credentials; applications must verify they still address the intended remote tenant.
     */
    tools: Tool[];
    output_override_names: string[];
    history: ResponseInputItem[];
    attempted_call_ids: string[];
    returned_call_ids: string[];
    pending_items: ResponseOutputItem[];
    returned_outputs: ResponseInputItem[];
    final_response: Response | null;
}
/**
 * Save must durably commit this detached value, rejecting stale revisions. Load only the latest
 * record under exclusive environment ownership. Pending and final records cannot resume.
 * On resume, params.input is a nonempty fresh observation; old approvals never transfer.
 *
 * Every save receives a detached, complete checkpoint, including saves before and after
 * local effects. Copying and serializing snapshots can take quadratic total work as a batch grows.
 * Size storage for the complete batch and history; contextBudget does not limit it.
 * After interruption, the saved prefix may omit later observations or unattempted proposals.
 * Effect and completed inspection checkpoints include the full prefix.
 */
export interface ResponsesRunnerLedger {
    runId: string;
    save: (checkpoint: ResponsesRunnerCheckpoint) => void | Promise<void>;
    resumeFrom?: ResponsesRunnerCheckpoint;
}
/** A completed model turn. In normal mode its tools run only when the iterator advances. */
export interface ResponsesRunnerTurn {
    /** Original API response. Editing it cannot change pending dispatch or replay history. */
    readonly response: Response;
    readonly step: number;
    readonly final: boolean;
    /** Eager mode may already have executed tools before this turn becomes visible. */
    readonly toolsExecuted: boolean;
    /** Detached receipts: completed means an output returned, not a verified external effect. */
    readonly attemptedCallIds: readonly string[];
    readonly completedCallIds: readonly string[];
    /** Replace this turn's supplied-result set for opted-in functions. An empty list clears it. */
    supplyOutputs: (outputs: ResponseInputItem.FunctionCallOutput[]) => void;
    /** Append human text after this turn's pending outputs, before the next request. */
    appendUserText: (text: string) => void;
}
/** Terminal runner failure. Call IDs report partial effects without arguments or results. */
/** Adapt a typed Responses function for the runner. The callback must return native text or content blocks. */
export declare function runnerFunction<Arguments>(tool: AutoParseableResponseTool<{
    name: string;
    arguments: Arguments;
}>): RunnerFunction;
export declare class ResponsesToolRunnerError extends OpenAIError {
    /** All calls that entered dispatch, including failed or refused calls. */
    readonly attemptedCallIds: string[];
    /** All calls whose dispatch returned an output, including browser refusals. */
    readonly completedCallIds: string[];
    /** No original driver exception is retained because it may contain credentials or page content. */
    constructor(message: string, attempted: string[], completed: string[]);
}
/** Bounded Responses loop supporting structured browser tools, native computer actions and functions. */
export declare class ResponsesToolRunner {
    private readonly lifecycle;
    private readonly functions;
    private readonly declarations;
    private readonly browserNames;
    private readonly outputOverrides;
    private readonly independent;
    private readonly earlyExecution;
    private readonly browser;
    private readonly computer;
    /** Refuse new runs. Await any active iterator/run before releasing its caller-owned environment. */
    close(): {
        status: 'closed' | 'draining';
    };
    private allowedOutputIds;
    /** Register tools once; rejects conflicting names before any requests or effects. */
    constructor(registered: ResponsesRunnerTools);
    private prepareEarlyExecution;
    private static prepareRequestTools;
    private static validateServer;
    private validateItem;
    private static validFunctionMetadata;
    private static validFunctionCaller;
    private static dispatchMcp;
    private static decideMcpApproval;
    private dispatch;
    private dispatchTool;
    private prepareFunction;
    private static executeFunction;
    private static streamResponse;
    private prepareTools;
    private overrideNames;
    private static requestOptions;
    private prepareRun;
    private static prepareBudget;
    private static validateToolChoice;
    private static isLocalChoice;
    private static localSelection;
    private static mcpApprovalPolicy;
    private static validateSelection;
    private validateBoundary;
    private validateLedgerArrays;
    private validateHistory;
    private validateHistoricalCall;
    private static validateHistoricalAction;
    private static validCoordinate;
    private static validateHistoricalOutput;
    private static validateHistoricalObservation;
    private prepareLedger;
    private static hasCurrentObservation;
    private beginRequest;
    private static measureInput;
    private budgetedInput;
    private budgetEligible;
    private static compactableCallId;
    private static compactHistory;
    private validateResponseCalls;
    private static seenOutputIds;
    private static checkOutputId;
    private static seenCallIds;
    private inspectResponse;
    /**
     * Inspect turns before advancing their tools. Breaking for-await closes the iterator.
     * Streams close before yielding; eager tools may already have effects and cannot be replaced.
     * With a selective early policy, permitted ordinary outputs in the pending suffix may be supplied.
     * @yields {ResponsesRunnerTurn} A response with control over permitted pending function results.
     */
    private static ledgerContains;
    private validateEarlyCall;
    private static collectStreamItem;
    iterate(client: OpenAI, params: ResponseCreateParamsNonStreaming, originalOptions?: ResponsesRunnerOptions): AsyncGenerator<ResponsesRunnerTurn, void, unknown>;
    /** Consume the bounded iterator and return the original final API response. */
    run(client: OpenAI, params: ResponseCreateParamsNonStreaming, options?: ResponsesRunnerOptions): Promise<Response>;
}
//# sourceMappingURL=responses-tool-runner.d.mts.map