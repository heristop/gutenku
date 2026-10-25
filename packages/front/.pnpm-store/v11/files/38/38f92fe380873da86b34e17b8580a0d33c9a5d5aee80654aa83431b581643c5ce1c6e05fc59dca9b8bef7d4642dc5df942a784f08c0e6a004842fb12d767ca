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
exports.createTemplateCodegenContext = createTemplateCodegenContext;
const language_core_1 = require("@volar/language-core");
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const codeFeatures_1 = require("../codeFeatures");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const directiveCommentRE = /^<!--\s*@vue-(?<name>[-\w]+)\b(?<content>[\s\S]*)-->$/;
// Reserved words can never be auto-imported bindings, and emitting them as
// bare array elements is a syntax error (#5267: `[class,]`).
const reservedWords = new Set([
    'arguments',
    'await',
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'eval',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'implements',
    'import',
    'in',
    'instanceof',
    'interface',
    'let',
    'new',
    'null',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'static',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
]);
function createTemplateCodegenContext() {
    // directive comments ---------------------------------------------------------
    const stack = [];
    const commentBuffer = [];
    function getCommentInfo() {
        return stack[stack.length - 1];
    }
    function enter(node) {
        if (node.type === CompilerDOM.NodeTypes.COMMENT) {
            commentBuffer.push(node);
            return false;
        }
        const info = {};
        const comments = [...commentBuffer];
        commentBuffer.length = 0;
        for (const comment of comments) {
            const match = comment.loc.source.match(directiveCommentRE);
            if (match) {
                const { name, content } = match.groups;
                switch (name) {
                    case 'skip': {
                        return false;
                    }
                    case 'ignore': {
                        info.ignoreError = true;
                        break;
                    }
                    case 'expect-error': {
                        info.expectError = {
                            token: 0,
                            node: comment,
                        };
                        break;
                    }
                    case 'generic': {
                        const text = content.trim();
                        if (text.startsWith('{') && text.endsWith('}')) {
                            info.generic = {
                                content: text.slice(1, -1),
                                offset: comment.loc.start.offset + comment.loc.source.indexOf('{') + 1,
                            };
                        }
                        break;
                    }
                }
            }
        }
        stack.push(info);
        return true;
    }
    function* exit() {
        const info = stack.pop();
        commentBuffer.length = 0;
        if (info.expectError !== undefined) {
            const boundary = yield* boundary_1.Boundary.start('template', info.expectError.node.loc.start.offset, info.expectError.node.loc.end.offset, {
                verification: {
                    shouldReport: () => info.expectError.token === 0,
                },
            });
            yield `// @ts-expect-error`;
            yield boundary.end();
            yield `${utils_1.newLine}${utils_1.endOfLine}`;
        }
    }
    function resolveCodeFeatures(features) {
        if (features.verification && stack.length) {
            const data = stack[stack.length - 1];
            if (data.ignoreError) {
                return {
                    ...features,
                    verification: false,
                };
            }
            if (data.expectError !== undefined) {
                return {
                    ...features,
                    verification: {
                        shouldReport: (source, code) => {
                            if ((0, language_core_1.shouldReportDiagnostics)(features, source, code)) {
                                data.expectError.token++;
                            }
                            return false;
                        },
                    },
                };
            }
        }
        return features;
    }
    // internal variables ---------------------------------------------------------
    let variableId = 0;
    function getInternalVariable() {
        return `__VLS_${variableId++}`;
    }
    // scopes ---------------------------------------------------------------------
    class Scope extends Set {
        declare(...variables) {
            for (const name of variables) {
                this.add(name);
            }
        }
        end() {
            scopes.pop();
            return generateAutoImport();
        }
    }
    const scopes = [];
    function scope() {
        const scope = new Scope();
        scopes.push(scope);
        return scope;
    }
    // context accesses -----------------------------------------------------------
    const contextAccesses = new Map();
    const dotValueAccesses = new Set();
    // Ordered log of accessed names; event-handler closures slice from a mark
    // to find the names accessed within their body.
    const accessLog = [];
    function accessVariable(source, name, offset, dotValue = false) {
        accessLog.push(name);
        let map = contextAccesses.get(name);
        if (!map) {
            contextAccesses.set(name, map = new Map());
        }
        let arr = map.get(source);
        if (!arr) {
            map.set(source, arr = new Set());
        }
        if (offset !== undefined) {
            arr.add(offset);
        }
        if (dotValue) {
            dotValueAccesses.add(name);
        }
    }
    function* generateAutoImport() {
        const all = [...contextAccesses.entries()];
        if (!all.some(([, offsets]) => offsets.size)) {
            return;
        }
        yield `// @ts-ignore${utils_1.newLine}`; // #2304
        yield `[`;
        for (const [varName, map] of all) {
            for (const [source, offsets] of map) {
                if (!reservedWords.has(varName)) {
                    for (const offset of offsets) {
                        yield [varName, source, offset, codeFeatures_1.codeFeatures.importCompletionOnly];
                        yield `,`;
                    }
                }
                offsets.clear();
            }
        }
        yield `]${utils_1.endOfLine}`;
    }
    // conditions -----------------------------------------------------------------
    // Active branch conditions with the names each accessed; the guards are
    // replayed inside inline-handler closures.
    const conditions = [];
    function* generateConditionGuards() {
        for (const condition of conditions) {
            if (condition.accesses.length && condition.accesses.every(name => scopes.some(scope => scope.has(name)))) {
                continue;
            }
            yield `if (!${condition.text}) throw 0${utils_1.endOfLine}`;
        }
    }
    // hoist vars -----------------------------------------------------------------
    const hoistVars = new Map();
    function getHoistVariable(originalVar) {
        let name = hoistVars.get(originalVar);
        if (name === undefined) {
            hoistVars.set(originalVar, name = `__VLS_${variableId++}`);
        }
        return name;
    }
    function* generateHoistVariables() {
        // trick to avoid TS 4081 (#5186)
        if (hoistVars.size) {
            yield `var `;
            let first = true;
            for (const [originalVar, hoistVar] of hoistVars) {
                if (!first) {
                    yield `, `;
                }
                first = false;
                yield `${hoistVar} = ${originalVar}!`;
            }
            yield utils_1.endOfLine;
        }
    }
    // template refs --------------------------------------------------------------
    const templateRefs = new Map();
    function addTemplateRef(name, typeExp, offset) {
        let refs = templateRefs.get(name);
        if (!refs) {
            templateRefs.set(name, refs = []);
        }
        refs.push({ typeExp, offset });
    }
    // others ---------------------------------------------------------------------
    const components = [];
    const dollarVars = new Set();
    const inlayHints = [];
    const generatedTypes = new Set();
    const inheritedAttrVars = new Set();
    const singleRootElTypes = new Set();
    const singleRootNodes = new Set();
    const slots = [];
    const dynamicSlots = [];
    return {
        getCommentInfo,
        enter,
        exit,
        resolveCodeFeatures,
        getInternalVariable,
        scopes,
        scope,
        contextAccesses,
        dotValueAccesses,
        accessLog,
        accessVariable,
        generateAutoImport,
        conditions,
        generateConditionGuards,
        hoistVars,
        getHoistVariable,
        generateHoistVariables,
        templateRefs,
        addTemplateRef,
        components,
        dollarVars,
        inlayHints,
        generatedTypes,
        inheritedAttrVars,
        singleRootElTypes,
        singleRootNodes,
        slots,
        dynamicSlots,
        inVFor: false,
    };
}
//# sourceMappingURL=context.js.map