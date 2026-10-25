"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTurnResultError = void 0;
const error_1 = require("../../../core/error.js");
/** Beta: final collection failed; partial state is evidence, not a successful result. */
class AgentTurnResultError extends error_1.OpenAIError {
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
exports.AgentTurnResultError = AgentTurnResultError;
//# sourceMappingURL=agent-turn-result-error.js.map