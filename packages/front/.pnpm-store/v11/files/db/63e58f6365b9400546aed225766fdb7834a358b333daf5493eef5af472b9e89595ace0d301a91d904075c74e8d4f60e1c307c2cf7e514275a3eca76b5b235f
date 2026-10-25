import { OpenAIError } from "../../../core/error.mjs";
import type { AgentSession, AgentSessionAssistantMessage } from "../../../resources/beta/agents/agents.mjs";
import type { Turn } from "../../../resources/beta/agents/sessions/turns.mjs";
/** Beta: final collection failed; partial state is evidence, not a successful result. */
export declare class AgentTurnResultError extends OpenAIError {
    name: string;
    readonly reason: 'failed' | 'cancelled' | 'requires_action' | 'observation';
    readonly session_id: string | undefined;
    readonly turn: Turn | undefined;
    readonly messages: AgentSessionAssistantMessage[];
    readonly required_actions: AgentSession['required_actions'];
    readonly cause: unknown;
    constructor(reason: 'failed' | 'cancelled' | 'requires_action' | 'observation', session_id: string | undefined, turn: Turn | undefined, messages: AgentSessionAssistantMessage[], required_actions?: AgentSession['required_actions'], cause?: unknown);
    get turn_id(): string | undefined;
}
//# sourceMappingURL=agent-turn-result-error.d.mts.map