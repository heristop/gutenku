var _AgentOutputParseError_rawResult;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "../../../internal/tslib.mjs";
import { OpenAIError } from "../../../core/error.mjs";
/** Beta: hosted execution completed, but local output parsing failed. */
export class AgentOutputParseError extends OpenAIError {
    constructor(result) {
        super('The completed agent output could not be parsed');
        this.name = 'AgentOutputParseError';
        _AgentOutputParseError_rawResult.set(this, void 0);
        __classPrivateFieldSet(this, _AgentOutputParseError_rawResult, result, "f");
    }
    /** Inspect the completed output explicitly; ordinary error logging omits it. */
    get raw_result() {
        return __classPrivateFieldGet(this, _AgentOutputParseError_rawResult, "f");
    }
}
_AgentOutputParseError_rawResult = new WeakMap();
//# sourceMappingURL=output-parse-error.mjs.map