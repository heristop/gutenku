"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTurnResult = void 0;
const output_text_1 = require("../../agents/output-text.js");
/** Beta: the completed final assistant messages from one hosted root turn. */
class AgentTurnResult {
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
        return this.messages.map(output_text_1.outputText).join('');
    }
}
exports.AgentTurnResult = AgentTurnResult;
//# sourceMappingURL=agent-turn-result.js.map