import type { AgentOutputFormat, AgentResult } from "../beta/agents/output-format-types.mjs";
import type { RequestOptions } from "../../internal/request-options.mjs";
import type { AgentToolError } from "../beta/agents/tool-error.mjs";
import type { AgentFunctionCallOutputParam, AgentSessionEvent, AgentSessionInputMessageParam } from "../../resources/beta/agents/agents.mjs";
import type { Sessions } from "../../resources/beta/agents/sessions/sessions.mjs";
/** A function result; object results are serialized as JSON text. */
export type AgentToolOutput = AgentFunctionCallOutputParam | object | null;
/** Receives a detached JSON object and may return a result asynchronously. */
export type AgentToolHandler = (arguments_: Record<string, unknown>) => AgentToolOutput | PromiseLike<AgentToolOutput>;
/** Input and optional sequential tool handlers for one turn on an idle session. */
export type AgentSessionStreamParams<T = never> = {
    /** Beta: parse this turn locally; does not change the existing session schema. */
    outputFormat?: AgentOutputFormat<T>;
    /** User messages, or text normalized to a single user message. Must not be empty. */
    input: string | AgentSessionInputMessageParam[];
    /** Registered functions run after their call event is yielded; unknown functions remain manual. */
    toolHandlers?: Record<string, AgentToolHandler>;
    /**
     * Beta: use alongside `toolHandlers` to log or monitor local argument validation,
     * handler execution, and output serialization failures. Does not observe API or
     * transport errors. Observer errors are ignored; model-visible errors remain sanitized.
     */
    onToolError?: (failure: AgentToolError) => void | PromiseLike<void>;
    /** Key for the input submission only; request headers take precedence, case-insensitively. */
    idempotencyKey?: string;
} & ([T] extends [never] ? unknown : {
    outputFormat: AgentOutputFormat<T>;
});
/**
 * A single-use, lazy async iterable of original session events for one turn.
 * Requires an idle session and a single input writer: the input endpoint does not
 * return a turn ID. Subscribe-before-input avoids losing events; the first
 * coordinator turn selects the turn to follow. Initial idle events and subagent
 * completion do not end iteration. A selected turn's terminal event followed by
 * session.idle, or session.failed, ends iteration. Unexpected EOF throws.
 *
 * Tool handlers run sequentially during iteration. Handler failures submit a
 * generic error without exception text. Each submission has a distinct retry-safe
 * idempotency key. Breaking iteration or calling abort closes local requests;
 * neither cancels the backend turn. No work starts until iteration begins.
 */
export declare class AgentSessionStream<T = never> implements AsyncIterable<AgentSessionEvent> {
    #private;
    /** Aborts local requests and iteration without cancelling the backend turn. */
    readonly controller: AbortController;
    /** Creates an unstarted helper. Prefer client.beta.agents.sessions.stream(). */
    constructor(sessions: Sessions, sessionID: string, params: AgentSessionStreamParams<T>, options?: RequestOptions);
    /** Closes local requests without cancelling the turn; an optional reason becomes the abort error's cause. */
    abort(reason?: unknown): void;
    /** Starts iteration once; use for await to ensure early exits close the connection. */
    [Symbol.asyncIterator](): AsyncIterator<AgentSessionEvent>;
    /** Beta: opt into retaining completed final messages before iterating progress events. */
    withResultCollection(): this;
    /** Beta: drain this turn, dispatch registered tools, and collect its final assistant messages. */
    finalResult(): Promise<AgentResult<T>>;
}
//# sourceMappingURL=agent-session-stream.d.mts.map