import { APIResource } from "../../../../core/resource.mjs";
import * as SessionsAPI from "./sessions.mjs";
import * as AgentsAPI from "../agents.mjs";
import { AgentSessionsPage } from "../agents.mjs";
import * as ArtifactsAPI from "./artifacts.mjs";
import { ArtifactContentParams, ArtifactDeleteParams, ArtifactListParams, ArtifactRetrieveParams, Artifacts, SessionArtifact, SessionArtifactDeleted, SessionArtifactsPage } from "./artifacts.mjs";
import * as EventsAPI from "./events.mjs";
import { EventCreateParams, Events } from "./events.mjs";
import * as ItemsAPI from "./items.mjs";
import { ItemListParams, Items } from "./items.mjs";
import * as TracesAPI from "./traces.mjs";
import { SessionTrace, SessionTracesPage, TraceListParams, Traces } from "./traces.mjs";
import * as SubagentsAPI from "./subagents/subagents.mjs";
import { SubagentListParams, SubagentRetrieveParams, Subagents } from "./subagents/subagents.mjs";
import * as TurnsAPI from "./turns/turns.mjs";
import { Turn, TurnListParams, TurnRetrieveParams, Turns, TurnsPage } from "./turns/turns.mjs";
import { APIPromise } from "../../../../core/api-promise.mjs";
import { type CursorPageParams, PagePromise } from "../../../../core/pagination.mjs";
import { RequestOptions } from "../../../../internal/request-options.mjs";
import { AgentSessionStream, type AgentSessionStreamParams, type AgentToolHandler } from "../../../../lib/agents/agent-session-stream.mjs";
import { type AgentSessionCreateStream } from "../../../../lib/beta/agents/agent-session-create-stream.mjs";
import type { AgentOutputFormat } from "../../../../lib/beta/agents/output-format-types.mjs";
export declare class Sessions extends APIResource {
    subagents: SubagentsAPI.Subagents;
    artifacts: ArtifactsAPI.Artifacts;
    items: ItemsAPI.Items;
    events: EventsAPI.Events;
    traces: TracesAPI.Traces;
    turns: TurnsAPI.Turns;
    /**
     * Creates a managed agent session, optionally submits initial input, and returns
     * the session or streams its events when stream is true. See
     * [running sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions).
     *
     * @example
     * ```ts
     * const agentSession =
     *   await client.beta.agents.sessions.create({
     *     environment: { type: 'none' },
     *   });
     * ```
     */
    create<T>(body: SessionCreateParamsStreaming & {
        agent: {
            text: {
                format: AgentOutputFormat<T>;
            };
        };
    }, options?: RequestOptions): APIPromise<AgentSessionCreateStream<T>>;
    create(body: SessionCreateParamsNonStreaming, options?: RequestOptions): APIPromise<AgentsAPI.AgentSession>;
    create(body: SessionCreateParamsStreaming, options?: RequestOptions): APIPromise<AgentSessionCreateStream>;
    create(body: SessionCreateParamsBase, options?: RequestOptions): APIPromise<AgentSessionCreateStream | AgentsAPI.AgentSession>;
    /**
     * Retrieves the current state of a managed agent session. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * const agentSession =
     *   await client.beta.agents.sessions.retrieve('session_id');
     * ```
     */
    retrieve(sessionID: string, options?: RequestOptions): APIPromise<AgentsAPI.AgentSession>;
    /**
     * Updates session metadata, model, reasoning effort, or service tier. Model
     * settings apply to subsequent turns. Omitted fields are unchanged. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * const agentSession =
     *   await client.beta.agents.sessions.update('session_id');
     * ```
     */
    update(sessionID: string, body?: SessionUpdateParams | null | undefined, options?: RequestOptions): APIPromise<AgentsAPI.AgentSession>;
    /**
     * Lists managed agent sessions using ID-based pagination and the requested sort
     * order. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const agentSession of client.beta.agents.sessions.list()) {
     *   // ...
     * }
     * ```
     */
    list(query?: (SessionListParams & ({
        [K in 'method' | 'path' | 'query' | 'body' | 'headers' | 'maxRetries' | 'stream' | 'timeout' | 'httpAgent' | 'fetchOptions' | 'signal' | 'idempotencyKey' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    } | null | undefined)) | null | undefined, options?: RequestOptions): PagePromise<AgentSessionsPage, AgentsAPI.AgentSession>;
    list(options?: {
        [K in 'headers' | 'maxRetries' | 'timeout' | 'signal' | 'idempotencyKey' | 'query']?: RequestOptions[K];
    } & {
        [K in 'method' | 'path' | 'body' | 'stream' | 'httpAgent' | 'fetchOptions' | 'defaultBaseURL' | '__metadata' | '__binaryRequest' | '__binaryResponse' | '__streamClass' | '__security' | '__synthesizeEventData']?: never;
    }): PagePromise<AgentSessionsPage, AgentsAPI.AgentSession>;
    /**
     * Removes a managed agent session from the public API and returns a deletion
     * confirmation. If backend execution has ended, deletion can cancel a still-open
     * public turn and abandon unpublished outputs. Running execution must be cancelled
     * first. Physical cleanup may continue asynchronously. See
     * [managing sessions](https://developers.openai.com/api/docs/guides/agents-api/sessions/manage).
     *
     * @example
     * ```ts
     * const agentSessionDeleted =
     *   await client.beta.agents.sessions.delete('session_id');
     * ```
     */
    delete(sessionID: string, options?: RequestOptions): APIPromise<AgentsAPI.AgentSessionDeleted>;
    /** Stream one turn on an idle session with a single input writer. See AgentSessionStream for lifecycle and tool handling. */
    stream<T = never>(sessionID: string, params: AgentSessionStreamParams<T>, options?: RequestOptions): AgentSessionStream<T>;
}
export type SessionCreateParams = SessionCreateParamsNonStreaming | SessionCreateParamsStreaming;
export interface SessionCreateParamsBase {
    /**
     * An inline execution environment or a reference to an environment template.
     */
    environment: AgentsAPI.EnvironmentParam;
    /**
     * Agent configuration. With `agent_id`, supplied fields override the saved agent
     * for this session. Without `agent_id`, `model` is required.
     */
    agent?: SessionCreateParams.Agent;
    /**
     * The ID of a saved reusable agent. Omit `agent` to use its configuration
     * unchanged.
     */
    agent_id?: string;
    /**
     * Initial input to submit when the session is created. A string is shorthand for a
     * single user message. Required when `environment.type` is `none`, or when
     * `stream` is `true` for an environment that is not `self_hosted`; optional for
     * self-hosted and non-streaming execution environments.
     */
    input?: string | Array<AgentsAPI.AgentSessionInputMessageParam> | null;
    /**
     * Up to 16 string key-value pairs, with keys up to 64 and values up to 512
     * characters. Omission or null defaults to an empty map.
     */
    metadata?: {
        [key: string]: string;
    } | null;
    /**
     * Optional spending limit in USD cents. Omission or null creates an unlimited
     * session.
     */
    spend_control?: SessionCreateParams.SpendControl | null;
    /**
     * Whether to stream session events as server-sent events. Defaults to `false`.
     */
    stream?: boolean;
    /**
     * The IDs of vaults made available to the session.
     */
    vault_ids?: Array<string> | null;
}
export declare namespace SessionCreateParams {
    /**
     * Agent configuration. With `agent_id`, supplied fields override the saved agent
     * for this session. Without `agent_id`, `model` is required.
     */
    interface Agent {
        /**
         * Additional instructions appended to the agent's default base instructions. Omit
         * to leave unchanged.
         */
        instructions?: string | null;
        /**
         * The model to use for the agent. The requested model name is preserved.
         */
        model?: string;
        /**
         * Configuration for creating and coordinating subagents.
         */
        multi_agent?: AgentsAPI.MultiAgentConfigParam | null;
        /**
         * Configuration for model reasoning. Omit to keep the current settings; pass
         * `null` to reset to the model's default effort.
         */
        reasoning?: AgentsAPI.AgentReasoningParam | null;
        /**
         * The service tier used for model requests.
         *
         * - `auto` - Selects the service tier automatically.
         * - `default` - Uses the default service tier.
         * - `flex` - Uses the flex service tier.
         * - `priority` - Uses the priority service tier.
         * - `fast` - Uses the fast service tier.
         * - `ultrafast` - Uses the ultrafast service tier.
         */
        service_tier?: 'auto' | 'default' | 'flex' | 'priority' | 'fast' | 'ultrafast' | null;
        /**
         * Configuration for text generated by the agent.
         */
        text?: AgentsAPI.AgentTextParam | null;
        /**
         * Tools available to the agent. Omit to inherit, or pass null to clear them. The
         * resolved tool list must fit within 3 MiB (3,145,728 bytes) of compact UTF-8
         * JSON.
         */
        tools?: Array<AgentsAPI.AgentToolParam> | null;
    }
    /**
     * Optional spending limit in USD cents. Omission or null creates an unlimited
     * session.
     */
    interface SpendControl {
        /**
         * Positive USD cents, or null to remove the limit.
         */
        limit: number | null;
    }
    type SessionCreateParamsNonStreaming = SessionsAPI.SessionCreateParamsNonStreaming;
    type SessionCreateParamsStreaming = SessionsAPI.SessionCreateParamsStreaming;
}
export interface SessionCreateParamsNonStreaming extends SessionCreateParamsBase {
    /**
     * Whether to stream session events as server-sent events. Defaults to `false`.
     */
    stream?: false;
}
export interface SessionCreateParamsStreaming extends SessionCreateParamsBase {
    /**
     * Whether to stream session events as server-sent events. Defaults to `false`.
     */
    stream: true;
}
export interface SessionUpdateParams {
    /**
     * Model settings for subsequent turns. Omitted fields stay unchanged.
     */
    agent?: SessionUpdateParams.Agent;
    /**
     * Replaces all metadata. Omit to leave unchanged, or pass null or {} to clear it.
     * Up to 16 string key-value pairs, with keys up to 64 and values up to 512
     * characters.
     */
    metadata?: {
        [key: string]: string;
    } | null;
    /**
     * Omit to retain the limit; null or a null limit removes it without resetting
     * spend.
     */
    spend_control?: SessionUpdateParams.SpendControl | null;
}
export declare namespace SessionUpdateParams {
    /**
     * Model settings for subsequent turns. Omitted fields stay unchanged.
     */
    interface Agent {
        /**
         * The model for subsequent turns. Omit to keep the current model.
         */
        model?: string;
        /**
         * Reasoning settings to update. Omit to keep the current effort.
         */
        reasoning?: Agent.Reasoning;
        /**
         * Omit to keep the current tier. Null resets it to auto.
         *
         * - `auto` - Selects the service tier automatically.
         * - `default` - Uses the default service tier.
         * - `flex` - Uses the flex service tier.
         * - `priority` - Uses the priority service tier.
         * - `fast` - Uses the fast service tier.
         * - `ultrafast` - Uses the ultrafast service tier.
         */
        service_tier?: 'auto' | 'default' | 'flex' | 'priority' | 'fast' | 'ultrafast' | null;
    }
    namespace Agent {
        /**
         * Reasoning settings to update. Omit to keep the current effort.
         */
        interface Reasoning {
            /**
             * Omit to keep the current effort. Null selects the model's default effort.
             */
            effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max' | null;
        }
    }
    /**
     * Omit to retain the limit; null or a null limit removes it without resetting
     * spend.
     */
    interface SpendControl {
        /**
         * Positive USD cents, or null to remove the limit.
         */
        limit: number | null;
    }
}
export interface SessionListParams extends CursorPageParams {
    /**
     * Only return sessions whose root agent has this ID. Omit to return sessions for
     * all agents.
     */
    agent_id?: string;
    /**
     * The order in which resources are returned. Defaults to `desc`.
     *
     * - `asc` - Returns resources in ascending order.
     * - `desc` - Returns resources in descending order.
     */
    order?: 'asc' | 'desc';
}
export interface SessionCreateParamsNonStreaming {
    toolHandlers?: never;
}
export interface SessionCreateParamsStreaming {
    /** Beta: local function handlers run during iteration and are never sent to the API. */
    toolHandlers?: Record<string, AgentToolHandler>;
}
export declare namespace Sessions {
    export { type SessionCreateParams as SessionCreateParams, type SessionCreateParamsNonStreaming as SessionCreateParamsNonStreaming, type SessionCreateParamsStreaming as SessionCreateParamsStreaming, type SessionUpdateParams as SessionUpdateParams, type SessionListParams as SessionListParams, };
    export { Subagents as Subagents, type SubagentRetrieveParams as SubagentRetrieveParams, type SubagentListParams as SubagentListParams, };
    export { Artifacts as Artifacts, type SessionArtifact as SessionArtifact, type SessionArtifactDeleted as SessionArtifactDeleted, type SessionArtifactsPage as SessionArtifactsPage, type ArtifactRetrieveParams as ArtifactRetrieveParams, type ArtifactListParams as ArtifactListParams, type ArtifactDeleteParams as ArtifactDeleteParams, type ArtifactContentParams as ArtifactContentParams, };
    export { Items as Items, type ItemListParams as ItemListParams };
    export { Events as Events, type EventCreateParams as EventCreateParams };
    export { Traces as Traces, type SessionTrace as SessionTrace, type SessionTracesPage as SessionTracesPage, type TraceListParams as TraceListParams, };
    export { Turns as Turns, type Turn as Turn, type TurnsPage as TurnsPage, type TurnRetrieveParams as TurnRetrieveParams, type TurnListParams as TurnListParams, };
}
export { type AgentSessionsPage };
//# sourceMappingURL=sessions.d.mts.map