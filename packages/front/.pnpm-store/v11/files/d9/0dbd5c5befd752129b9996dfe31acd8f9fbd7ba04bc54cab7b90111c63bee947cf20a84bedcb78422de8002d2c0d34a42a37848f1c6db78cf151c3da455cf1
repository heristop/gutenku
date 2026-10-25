"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const runTsc_1 = require("@volar/typescript/lib/quickstart/runTsc");
const core = __importStar(require("@vue/language-core"));
const path = __importStar(require("node:path"));
const windowsPathRE = /\\/g;
const retryToken = new Error('[Vue] Extensions changed');
function run(tscPath) {
    const runExtensions = new Set(['.vue']);
    const main = () => (0, runTsc_1.runTsc)(resolveTscPath(tscPath), [...runExtensions], (ts, options) => {
        const { configFilePath } = options.options;
        const vueOptions = typeof configFilePath === 'string'
            ? core.createParsedCommandLine(ts, ts.sys, configFilePath.replace(windowsPathRE, '/')).vueOptions
            : core.createParsedCommandLineByJson(ts, ts.sys, (options.host ?? ts.sys).getCurrentDirectory(), {})
                .vueOptions;
        const allExtensions = core.getAllExtensions(vueOptions);
        if (allExtensions.every(ext => runExtensions.has(ext))) {
            const vueLanguagePlugin = core.createVueLanguagePlugin(ts, options.options, vueOptions, id => id);
            return { languagePlugins: [vueLanguagePlugin] };
        }
        else {
            for (const ext of allExtensions) {
                runExtensions.add(ext);
            }
            throw retryToken;
        }
    });
    while (true) {
        try {
            return main();
        }
        catch (err) {
            if (err !== retryToken) {
                throw err;
            }
        }
    }
}
function resolveTscPath(tscPath = require.resolve('typescript/lib/tsc')) {
    try {
        const { name } = require(path.join(tscPath, '..', '..', 'package.json'));
        if (name === '@typescript/typescript6') {
            // `typescript` may be aliased to `@typescript/typescript6`,
            // which keeps tsc in its full TypeScript 6 dependency (`@typescript/old`)
            return require.resolve('@typescript/old/lib/tsc', { paths: [path.dirname(tscPath)] });
        }
    }
    catch { }
    return tscPath;
}
//# sourceMappingURL=index.js.map