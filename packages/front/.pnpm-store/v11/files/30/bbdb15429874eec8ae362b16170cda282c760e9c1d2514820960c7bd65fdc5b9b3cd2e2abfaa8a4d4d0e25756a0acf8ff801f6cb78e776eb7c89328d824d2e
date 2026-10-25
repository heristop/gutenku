"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = void 0;
const util_1 = require("util");
function formatDebugPayload(message, obj) {
    if (obj === undefined) {
        return `tsc-alias debug: ${message}`;
    }
    const formattedObj = (0, util_1.inspect)(obj, {
        showHidden: true,
        depth: Infinity,
        colors: true
    });
    return `tsc-alias debug: ${message} ${formattedObj}`;
}
class Output {
    constructor(verbose, debugMode = false) {
        var _a, _b;
        this.debug = (message, obj) => {
            if (!this.debugMode)
                return;
            console.debug(formatDebugPayload(message, obj));
        };
        if (typeof verbose === 'object' && verbose !== null) {
            this.verb = (_a = verbose.verbose) !== null && _a !== void 0 ? _a : false;
            this.debugMode = (_b = verbose.debug) !== null && _b !== void 0 ? _b : false;
            return;
        }
        this.verb = Boolean(verbose);
        this.debugMode = debugMode;
    }
    set verbose(value) {
        if (value) {
            this.verb = value;
        }
    }
    info(message) {
        if (!this.verb)
            return;
        console.log(`tsc-alias info: ${message}`);
    }
    error(message, exitProcess = false) {
        console.error(`\x1b[41mtsc-alias error:\x1b[0m \x1b[31m${message}\x1b[0m`);
        if (exitProcess) {
            process.exit(1);
        }
    }
    clear() {
        console.clear();
    }
    assert(claim, message) {
        if (!claim) {
            this.error(message, true);
        }
    }
}
exports.Output = Output;
//# sourceMappingURL=output.js.map