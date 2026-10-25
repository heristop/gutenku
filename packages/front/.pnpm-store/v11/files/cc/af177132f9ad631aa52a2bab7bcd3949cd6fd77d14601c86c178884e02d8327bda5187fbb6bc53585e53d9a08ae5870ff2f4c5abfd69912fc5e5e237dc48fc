import { OpenAIError } from "../../../core/error.mjs";
/** Beta: final collection failed; partial state is evidence, not a successful result. */
export class AgentTurnResultError extends OpenAIError {
    constructor(reason, session_id, turn, messages, required_actions = [], cause) {
        super(`Could not collect the agent turn result: ${reason}`);
        this.name = 'AgentTurnResultError';
        this.reason = reason;
        this.session_id = session_id;
        this.turn = turn;
        this.messages = messages;
        this.required_actions = required_actions;
        this.cause = cause;
    }
    get turn_id() {
        return this.turn?.id;
    }
}
//# sourceMappingURL=agent-turn-result-error.mjs.map