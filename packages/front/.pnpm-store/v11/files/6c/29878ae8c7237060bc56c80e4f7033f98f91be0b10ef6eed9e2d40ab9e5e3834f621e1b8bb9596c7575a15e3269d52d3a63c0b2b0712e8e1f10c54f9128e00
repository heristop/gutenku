"use strict";
var _AgentOutputParseError_rawResult;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOutputParseError = void 0;
const tslib_1 = require("../../../internal/tslib.js");
const error_1 = require("../../../core/error.js");
/** Beta: hosted execution completed, but local output parsing failed. */
class AgentOutputParseError extends error_1.OpenAIError {
    constructor(result) {
        super('The completed agent output could not be parsed');
        this.name = 'AgentOutputParseError';
        _AgentOutputParseError_rawResult.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _AgentOutputParseError_rawResult, result, "f");
    }
    /** Inspect the completed output explicitly; ordinary error logging omits it. */
    get raw_result() {
        return tslib_1.__classPrivateFieldGet(this, _AgentOutputParseError_rawResult, "f");
    }
}
exports.AgentOutputParseError = AgentOutputParseError;
_AgentOutputParseError_rawResult = new WeakMap();
//# sourceMappingURL=output-parse-error.js.map