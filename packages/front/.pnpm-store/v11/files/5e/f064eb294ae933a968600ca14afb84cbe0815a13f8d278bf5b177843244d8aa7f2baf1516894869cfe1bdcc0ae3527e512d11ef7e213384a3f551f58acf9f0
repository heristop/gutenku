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
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const compile_1 = require("../template/compile");
const shouldAddSuffixRE = /(?<=<[^>/]+)$/;
const plugin = () => {
    return {
        version: 2.2,
        compileSFCTemplate(lang, template, options) {
            if (lang === 'html' || lang === 'md') {
                let addedSuffix = false;
                // #4583
                if (shouldAddSuffixRE.test(template)) {
                    template += '>';
                    addedSuffix = true;
                }
                const ast = (0, compile_1.compileTemplate)(template, options);
                return {
                    ast,
                    code: '',
                    preamble: '',
                    __addedSuffix: addedSuffix,
                };
            }
        },
        updateSFCTemplate(oldResult, change) {
            const newSource = oldResult.ast.source.slice(0, change.start)
                + change.newText
                + oldResult.ast.source.slice(change.end);
            // @ts-expect-error
            if (oldResult.__addedSuffix) {
                const originalTemplate = newSource.slice(0, -1); // remove added '>'
                if (!shouldAddSuffixRE.test(originalTemplate)) {
                    return undefined;
                }
            }
            const lengthDiff = change.newText.length - (change.end - change.start);
            let hitNodes = [];
            if (tryUpdateNode(oldResult.ast) && hitNodes.length) {
                hitNodes = hitNodes.sort((a, b) => a.loc.source.length - b.loc.source.length);
                const hitNode = hitNodes[0];
                if (hitNode.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
                    return oldResult;
                }
            }
            function tryUpdateNode(node) {
                if (withinChangeRange(node.loc)) {
                    hitNodes.push(node);
                }
                if (tryUpdateNodeLoc(node.loc)) {
                    if (node.type === CompilerDOM.NodeTypes.ROOT) {
                        for (const child of node.children) {
                            if (!tryUpdateNode(child)) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.ELEMENT) {
                        if (withinChangeRange(node.loc)) {
                            // if not self closing, should not hit tag name
                            const start = node.loc.start.offset + 2;
                            const end = node.loc.start.offset + node.loc.source.lastIndexOf('</');
                            if (!withinChangeRange({ start: { offset: start }, end: { offset: end }, source: '' })) {
                                return false;
                            }
                        }
                        for (const prop of node.props) {
                            if (!tryUpdateNode(prop)) {
                                return false;
                            }
                        }
                        for (const child of node.children) {
                            if (!tryUpdateNode(child)) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.ATTRIBUTE) {
                        if (node.value && !tryUpdateNode(node.value)) {
                            return false;
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.DIRECTIVE) {
                        if (node.arg && withinChangeRange(node.arg.loc) && node.name === 'slot') {
                            return false;
                        }
                        if (node.exp && withinChangeRange(node.exp.loc) && node.name === 'for') { // #2266
                            return false;
                        }
                        if (node.arg && !tryUpdateNode(node.arg)) {
                            return false;
                        }
                        if (node.exp && !tryUpdateNode(node.exp)) {
                            return false;
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.COMPOUND_EXPRESSION) {
                        for (const childNode of node.children) {
                            if (typeof childNode === 'object') {
                                if (!tryUpdateNode(childNode)) {
                                    return false;
                                }
                            }
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.IF) {
                        for (const branch of node.branches) {
                            if (branch.condition && !tryUpdateNode(branch.condition)) {
                                return false;
                            }
                            for (const child of branch.children) {
                                if (!tryUpdateNode(child)) {
                                    return false;
                                }
                            }
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.FOR) {
                        for (const child of [
                            node.parseResult.source,
                            node.parseResult.value,
                            node.parseResult.key,
                            node.parseResult.index,
                        ]) {
                            if (child) {
                                if (!tryUpdateNode(child)) {
                                    return false;
                                }
                                if (child.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
                                    const content = child.content.trim();
                                    if (content.startsWith('(') || content.endsWith(')')) {
                                        return false;
                                    }
                                }
                            }
                        }
                        for (const child of node.children) {
                            if (!tryUpdateNode(child)) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.INTERPOLATION) {
                        if (!tryUpdateNode(node.content)) {
                            return false;
                        }
                        if (node.content.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
                            const { content } = node.content;
                            if (content.includes('{{') || content.includes('}}')) {
                                return false;
                            }
                        }
                    }
                    else if (node.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
                        if (withinChangeRange(node.loc)) { // TODO: review this (slot name?)
                            if (node.isStatic) {
                                return false;
                            }
                            else if (!node.loc.source) {
                                // :class="..." -> :class=""
                                return false;
                            }
                            else {
                                node.content = node.loc.source;
                            }
                        }
                    }
                    return true;
                }
                return false;
            }
            function tryUpdateNodeLoc(loc) {
                delete loc.__endOffset;
                if (withinChangeRange(loc)) {
                    loc.source = loc.source.slice(0, change.start - loc.start.offset)
                        + change.newText
                        + loc.source.slice(change.end - loc.start.offset);
                    loc.__endOffset = loc.end.offset;
                    loc.end.offset += lengthDiff;
                    return true;
                }
                else if (change.end <= loc.start.offset) {
                    loc.__endOffset = loc.end.offset;
                    loc.start.offset += lengthDiff;
                    loc.end.offset += lengthDiff;
                    return true;
                }
                else if (change.start >= loc.end.offset) {
                    return true; // no need update
                }
                return false;
            }
            function withinChangeRange(loc) {
                const originalLocEnd = loc.__endOffset ?? loc.end.offset;
                return change.start >= loc.start.offset && change.end <= originalLocEnd;
            }
        },
    };
};
exports.default = plugin;
//# sourceMappingURL=vue-template-html.js.map