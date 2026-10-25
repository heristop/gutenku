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
exports.references = void 0;
exports.generateStyleScopedClassReferences = generateStyleScopedClassReferences;
exports.generateStyleScopedClassReference = generateStyleScopedClassReference;
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const shared_1 = require("../../utils/shared");
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const escaped_1 = require("../utils/escaped");
const classNameEscapeRE = /([\\'])/;
// For language-service/lib/plugins/vue-scoped-class-links.ts usage
exports.references = new WeakMap();
function* generateStyleScopedClassReferences({ template, typescript: ts }, node) {
    for (const prop of node.props) {
        if (prop.type === CompilerDOM.NodeTypes.ATTRIBUTE
            && prop.name === 'class'
            && prop.value) {
            const [text, start] = (0, shared_1.normalizeAttributeValue)(prop.value);
            for (const [className, offset] of forEachClassName(text)) {
                yield* generateStyleScopedClassReference(template, className, start + offset);
            }
        }
        else if (prop.type === CompilerDOM.NodeTypes.DIRECTIVE
            && prop.arg?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION
            && prop.exp?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION
            && prop.arg.content === 'class') {
            const content = '(' + prop.exp.content + ')';
            const startOffset = prop.exp.loc.start.offset - 1;
            const ast = (0, utils_1.getTypeScriptAST)(ts, template, content);
            const literals = [];
            for (const node of (0, utils_1.forEachNode)(ts, ast)) {
                if (!ts.isExpressionStatement(node)
                    || !ts.isParenthesizedExpression(node.expression)) {
                    continue;
                }
                const { expression } = node.expression;
                if (ts.isStringLiteralLike(expression)) {
                    literals.push(expression);
                }
                else if (ts.isArrayLiteralExpression(expression)) {
                    yield* walkArrayLiteral(expression);
                }
                else if (ts.isObjectLiteralExpression(expression)) {
                    yield* walkObjectLiteral(expression);
                }
            }
            for (const literal of literals) {
                const start = literal.end - literal.text.length - 1 + startOffset;
                for (const [className, offset] of forEachClassName(literal.text)) {
                    yield* generateStyleScopedClassReference(template, className, start + offset);
                }
            }
            function* walkArrayLiteral(node) {
                const { elements } = node;
                for (const element of elements) {
                    if (ts.isStringLiteralLike(element)) {
                        literals.push(element);
                    }
                    else if (ts.isObjectLiteralExpression(element)) {
                        yield* walkObjectLiteral(element);
                    }
                }
            }
            function* walkObjectLiteral(node) {
                const { properties } = node;
                for (const property of properties) {
                    if (ts.isPropertyAssignment(property)) {
                        const { name } = property;
                        if (ts.isIdentifier(name)) {
                            const text = (0, shared_1.getNodeText)(ts, name, ast);
                            yield* generateStyleScopedClassReference(template, text, name.end - text.length + startOffset);
                        }
                        else if (ts.isStringLiteral(name)) {
                            literals.push(name);
                        }
                        else if (ts.isComputedPropertyName(name)) {
                            const { expression } = name;
                            if (ts.isStringLiteralLike(expression)) {
                                literals.push(expression);
                            }
                        }
                    }
                    else if (ts.isShorthandPropertyAssignment(property)) {
                        const text = (0, shared_1.getNodeText)(ts, property.name, ast);
                        yield* generateStyleScopedClassReference(template, text, property.name.end - text.length + startOffset);
                    }
                }
            }
        }
    }
}
function* forEachClassName(content) {
    let offset = 0;
    for (const className of content.split(' ')) {
        yield [className, offset];
        offset += className.length + 1;
    }
}
function* generateStyleScopedClassReference(block, className, offset, fullStart = offset) {
    if (!className) {
        yield `/** @type {${names_1.names.StyleScopedClasses}['`;
        yield ['', 'template', offset, codeFeatures_1.codeFeatures.completion];
        yield `']} */${utils_1.endOfLine}`;
        return;
    }
    const cache = exports.references.get(block);
    if (!cache || cache[0] !== block.content) {
        const arr = [];
        exports.references.set(block, [block.content, arr]);
        arr.push([className, offset]);
    }
    else {
        cache[1].push([className, offset]);
    }
    yield `/** @type {${names_1.names.StyleScopedClasses}[`;
    const boundary = yield* boundary_1.Boundary.start(block.name, fullStart, offset + className.length, codeFeatures_1.codeFeatures.navigationAndCompletion);
    yield `'`;
    yield* (0, escaped_1.generateEscaped)(className, block.name, offset, boundary.features, classNameEscapeRE);
    yield `'`;
    yield boundary.end();
    yield `]} */${utils_1.endOfLine}`;
}
//# sourceMappingURL=styleScopedClasses.js.map