import { outputText } from "../../agents/output-text.mjs";
/** Beta: the completed final assistant messages from one hosted root turn. */
export class AgentTurnResult {
    constructor(turn, messages) {
        this.turn = turn;
        this.messages = messages;
    }
    get session_id() {
        return this.turn.session_id;
    }
    get turn_id() {
        return this.turn.id;
    }
    get output_text() {
        return this.messages.map(outputText).join('');
    }
}
//# sourceMappingURL=agent-turn-result.mjs.map