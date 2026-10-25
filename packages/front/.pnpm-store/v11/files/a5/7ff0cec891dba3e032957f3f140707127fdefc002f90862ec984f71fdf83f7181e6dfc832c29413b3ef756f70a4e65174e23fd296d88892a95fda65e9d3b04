import type { RequestOptions } from "../../../internal/request-options.js";
import type { SessionCreateParams } from "../../../resources/beta/agents/sessions/sessions.js";
import type { AgentTurnResult } from "./agent-turn-result.js";
import type { TextFormatParam } from "../../../resources/beta/agents/agents.js";
import type { AgentOutputFormat, AgentResult } from "./output-format-types.js";
/** @internal */
export declare function parseAgentResult<T>(result: AgentTurnResult, format?: AgentOutputFormat<T>): AgentResult<T>;
/** @internal */
export declare function agentFormatParser<T = unknown>(format: TextFormatParam | null | undefined): AgentOutputFormat<T> | undefined;
/** @internal */
export declare function captureAgentOutput(input: SessionCreateParams, options?: RequestOptions): {
    body: SessionCreateParams;
    options: RequestOptions | undefined;
    format?: never;
} | {
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
        __streamClass?: typeof import("../../../streaming.js").Stream;
        __synthesizeEventData?: boolean;
    };
    body: {
        agent: {
            text: {
                format: {
                    type: string;
                    schema: {
                        [key: string]: unknown;
                    };
                };
                verbosity?: "low" | "medium" | "high" | null;
            };
            instructions?: string | null;
            model?: string;
            multi_agent?: import("../../../resources/beta.js").MultiAgentConfigParam | null;
            reasoning?: import("../../../resources/beta.js").AgentReasoningParam | null;
            service_tier?: "auto" | "default" | "flex" | "priority" | "fast" | "ultrafast" | null;
            tools?: Array<import("../../../resources/beta.js").AgentToolParam> | null;
        };
        stream?: false;
        toolHandlers?: never;
        environment: import("../../../resources/beta.js").EnvironmentParam;
        agent_id?: string;
        input?: string | Array<import("../../../resources/beta.js").AgentSessionInputMessageParam> | null;
        metadata?: {
            [key: string]: string;
        } | null;
        spend_control?: SessionCreateParams.SpendControl | null;
        vault_ids?: Array<string> | null;
    } | {
        agent: {
            text: {
                format: {
                    type: string;
                    schema: {
                        [key: string]: unknown;
                    };
                };
                verbosity?: "low" | "medium" | "high" | null;
            };
            instructions?: string | null;
            model?: string;
            multi_agent?: import("../../../resources/beta.js").MultiAgentConfigParam | null;
            reasoning?: import("../../../resources/beta.js").AgentReasoningParam | null;
            service_tier?: "auto" | "default" | "flex" | "priority" | "fast" | "ultrafast" | null;
            tools?: Array<import("../../../resources/beta.js").AgentToolParam> | null;
        };
        stream: true;
        toolHandlers?: Record<string, import("../../agents/agent-session-stream.js").AgentToolHandler>;
        environment: import("../../../resources/beta.js").EnvironmentParam;
        agent_id?: string;
        input?: string | Array<import("../../../resources/beta.js").AgentSessionInputMessageParam> | null;
        metadata?: {
            [key: string]: string;
        } | null;
        spend_control?: SessionCreateParams.SpendControl | null;
        vault_ids?: Array<string> | null;
    };
    format: AgentOutputFormat<unknown>;
};
/** @internal */
export declare function parseAgentResultPromise<T>(result: Promise<AgentTurnResult>, format?: AgentOutputFormat<T>): Promise<AgentResult<T>>;
//# sourceMappingURL=parse-result.d.ts.map