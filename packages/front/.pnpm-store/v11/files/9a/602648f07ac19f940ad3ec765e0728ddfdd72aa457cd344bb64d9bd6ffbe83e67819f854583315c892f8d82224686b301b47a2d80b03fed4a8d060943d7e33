import type { OpenAI } from "../client.mjs";
import type { RunnerDiagnosticObserver } from "../internal/runner-diagnostics.mjs";
import type { ComputerAction, Response, ResponseComputerToolCall, ResponseComputerToolCallOutputScreenshot, ResponseCreateParamsNonStreaming, ResponseInputItem } from "../resources/responses/responses.mjs";
export type { RunnerDiagnostic, RunnerDiagnosticObserver } from "../internal/runner-diagnostics.mjs";
/** A driver-supplied image URL (including data URLs) or uploaded file ID. The helper never reads local files. */
export type ComputerScreenshot = ResponseComputerToolCallOutputScreenshot;
/** A native call, or a completed modern batch whose safety checklist may be absent. */
export type ComputerCallInput = ResponseComputerToolCall | (Omit<ResponseComputerToolCall, 'action' | 'actions' | 'pending_safety_checks'> & {
    action?: never;
    actions: NonNullable<ResponseComputerToolCall['actions']>;
    pending_safety_checks?: ResponseComputerToolCall['pending_safety_checks'] | undefined;
});
/**
 * Implement these methods against an isolated browser or virtual computer.
 * Arguments use the existing computer action wire shape, including snake_case fields.
 * Driver methods run once, in order; the helper never retries them.
 * Approval covers action arguments, not a frozen screen. If target-specific consent
 * is required, the driver must bind the target or reject the action after a state change.
 */
export interface ComputerDriver {
    /** Click the given coordinates and button, preserving held keys. */
    click: (action: ComputerAction.Click, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Double-click the given coordinates, preserving held keys. */
    double_click: (action: ComputerAction.DoubleClick, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Drag along the path while holding any supplied keys. */
    drag: (action: ComputerAction.Drag, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Press the requested combination of keys. */
    keypress: (action: ComputerAction.Keypress, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Move the pointer to the requested coordinates. */
    move: (action: ComputerAction.Move, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Capture the current display as an API-compatible image URL. */
    screenshot: (options: {
        signal: AbortSignal | undefined;
    }) => ComputerScreenshot | Promise<ComputerScreenshot>;
    /** Scroll at the given coordinates by scroll_x and scroll_y. */
    scroll: (action: ComputerAction.Scroll, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Enter the requested text in the focused control. */
    type: (action: ComputerAction.Type, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
    /** Allow the environment to settle before the next action. */
    wait: (action: ComputerAction.Wait, options: {
        signal: AbortSignal | undefined;
    }) => void | Promise<void>;
}
/** Policy and cancellation options shared by run() and execute(). */
export interface ComputerExecutionOptions {
    /**
     * Required when a call contains pending safety checks. Return exactly true to
     * approve all of that call's checks; omitted or declined approval stops before actions.
     * Listen to context.signal to cancel interactive approval; the helper waits for callbacks to settle.
     */
    approveSafetyChecks?: (call: ResponseComputerToolCall, context: {
        signal: AbortSignal | undefined;
    }) => boolean | Promise<boolean>;
    /**
     * Authorize each action immediately before execution, including the final screenshot.
     * When set, only an explicit true allows the action. Throw or return false to stop.
     * context.signal is the same effective signal passed to the driver.
     * This approves the fixed arguments; it does not freeze the screen or focus.
     */
    beforeAction?: (action: ComputerAction, call: ResponseComputerToolCall, context: {
        signal: AbortSignal | undefined;
    }) => boolean | Promise<boolean>;
    /** Abort before the next action or capture. Running driver calls are never repeated. */
    signal?: AbortSignal | undefined;
    /** Local timing and safe reason records, never screenshots, action text or driver errors. */
    onDiagnostic?: RunnerDiagnosticObserver;
}
/** Options for a bounded computer-only Responses loop. */
export interface ComputerRunOptions extends ComputerExecutionOptions {
    /** Maximum responses.create calls, default 20. The final call cannot execute further computer actions.
     * Client HTTP retries still apply. */
    maxSteps?: number;
    /**
     * Passed to each Responses request. Its signal is used when the top-level signal is absent.
     * Signal and continuation overrides use a view without changing the caller's object.
     */
    requestOptions?: OpenAI.RequestOptions;
}
/**
 * Dispatches existing computer actions for a caller-owned browser or computer.
 * run() handles computer-only conversations; execute() supports caller-managed loops.
 */
export declare class ComputerToolset {
    private readonly driver;
    private readonly lifecycle;
    /** The environment remains owned by the caller and is never opened or closed by the helper. */
    constructor(driver: ComputerDriver);
    /** Stop new work. If draining, await the current operation before closing your driver. */
    close(): {
        status: 'closed' | 'draining';
    };
    /** Snapshot and check a complete call before a runner dispatches any effects from its response.
     * @internal
     */
    static validate<T extends ComputerCallInput>(call: T): T;
    /**
     * Run until a completed response contains no computer calls.
     * Defaults to the computer tool when tools is omitted. Other tools, streams,
     * background work, conversation, and previous_response_id are rejected.
     * Replays history (including encrypted reasoning for store:false).
     *
     * @throws {OpenAIError} If a response is incomplete, unsupported, declined, or exceeds maxSteps.
     */
    run(client: OpenAI, params: ResponseCreateParamsNonStreaming, options?: ComputerRunOptions): Promise<Response>;
    private runOwned;
    /**
     * Execute one completed call for a caller-managed Responses loop.
     * Returns exactly one observation captured after all actions in the call.
     * Screenshot actions still pass through beforeAction; intermediate captures
     * are omitted because Responses accepts only the final observation.
     * Approval, policy rejection, abort, and driver failures stop immediately.
     */
    execute(call: ComputerCallInput, options?: ComputerExecutionOptions): Promise<ResponseInputItem.ComputerCallOutput>;
    private executeOwned;
    private captureScreenshot;
    private perform;
    private static approveAction;
}
//# sourceMappingURL=computer.d.mts.map