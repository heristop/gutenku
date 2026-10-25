import type { RequestOptions } from "../../../internal/request-options.js";
import type { Sessions, SessionCreateParams } from "../../../resources/beta/agents/sessions/sessions.js";
import type { AgentToolHandler } from "../../agents/agent-session-stream.js";
import type { AgentOutputFormat, AgentResult } from "./output-format-types.js";
import type { Stream } from "../../../core/streaming.js";
import type { AgentSessionEvent } from "../../../resources/beta/agents/agents.js";
/** Beta: the original creation stream with optional collection of its initial root turn. */
export type AgentSessionCreateStream<T = never> = Stream<AgentSessionEvent> & {
    /** Drain through the selected turn's completion and idle event, then return its final messages. */
    finalResult: () => Promise<AgentResult<T>>;
    /** Opt into retaining completed final messages before iterating progress events. */
    withResultCollection: () => AgentSessionCreateStream<T>;
};
/** Add beta result collection without replacing custom stream instances.
 * @internal
 */
export declare function withAgentTurnResult<T = never>(stream: Stream<AgentSessionEvent>, format?: AgentOutputFormat<T>, tools?: {
    sessions: Sessions;
    handlers: Record<string, AgentToolHandler>;
    options?: RequestOptions | undefined;
}): AgentSessionCreateStream<T>;
/** Remove local callbacks without changing ordinary creation requests. @internal */
export declare function captureCreationTools(body: SessionCreateParams, options?: RequestOptions): {
    body: Sessions.SessionCreateParams;
    options: RequestOptions | undefined;
    handlers?: never;
} | {
    body: Sessions.SessionCreateParams;
    options: {
        method?: import("../../../internal/types.js").HTTPMethod;
        path?: string;
        query?: object | undefined | null;
        body?: unknown;
        headers?: import("../../../internal/headers.js").HeadersLike;
        maxRetries?: number;
        stream?: boolean | undefined;
        timeout?: number;
        fetchOptions?: import("../../../internal/types.js").MergedRequestInit;
        signal?: AbortSignal | undefined | null;
        idempotencyKey?: string;
        defaultBaseURL?: string | undefined;
        __metadata?: Record<string, unknown>;
        __security?: {
            bearerAuth?: boolean;
            adminAPIKeyAuth?: boolean;
        };
        __binaryResponse?: boolean | undefined;
        __streamClass?: typeof Stream;
        __synthesizeEventData?: boolean;
    };
    handlers: {
        [k: string]: AgentToolHandler;
    };
};
//# sourceMappingURL=agent-session-create-stream.d.ts.map