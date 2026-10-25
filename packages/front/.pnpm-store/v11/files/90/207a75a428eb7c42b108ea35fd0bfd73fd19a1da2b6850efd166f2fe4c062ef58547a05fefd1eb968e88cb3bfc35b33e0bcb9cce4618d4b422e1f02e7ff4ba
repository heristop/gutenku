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
exports.generateVFor = generateVFor;
exports.parseVForNode = parseVForNode;
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const collectBindings_1 = require("../../utils/collectBindings");
const shared_1 = require("../../utils/shared");
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const interpolation_1 = require("./interpolation");
const templateChild_1 = require("./templateChild");
function* generateVFor(options, ctx, node) {
    const { source } = node.parseResult;
    const { leftExpressionRange, leftExpressionText } = parseVForNode(node);
    const scope = ctx.scope();
    let bindingNames = [];
    const defaultInitializerRanges = [];
    if (leftExpressionRange && leftExpressionText) {
        const wrap = `const [`;
        const collectAst = (0, utils_1.getTypeScriptAST)(options.typescript, options.template, `${wrap}${leftExpressionText}]`);
        bindingNames = (0, collectBindings_1.collectBindingNames)(options.typescript, collectAst, collectAst);
        const declaration = collectAst.statements[0].declarationList.declarations[0];
        const initializers = [];
        collectDefaultInitializers(options.typescript, declaration.name, initializers);
        for (const initializer of initializers) {
            const { start, end } = (0, shared_1.getStartEnd)(options.typescript, initializer, collectAst);
            defaultInitializerRanges.push([start - wrap.length, end - wrap.length]);
        }
        defaultInitializerRanges.sort((a, b) => a[0] - b[0]);
    }
    // Evaluate the source before the loop bindings enter scope (`v-for="x in x"` reads the outer `x`);
    // destructuring defaults (`{ a, b = a }`) are interpolated after the declaration to see the sibling aliases.
    let sourceAlias;
    if (source.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
        sourceAlias = ctx.getInternalVariable();
        // tryAsConstant keeps inline literal sources from widening to `number[]` (#6067).
        yield `const ${sourceAlias} = ${names_1.names.tryAsConstant}(`;
        yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, codeFeatures_1.codeFeatures.all, source.content, source.loc.start.offset, `(`, `)`);
        yield `)`;
        yield utils_1.endOfLine;
    }
    scope.declare(...bindingNames);
    yield `for (const [`;
    if (leftExpressionRange && leftExpressionText) {
        let lastOffset = 0;
        for (const [start, end] of defaultInitializerRanges) {
            if (start > lastOffset) {
                yield [
                    leftExpressionText.slice(lastOffset, start),
                    'template',
                    leftExpressionRange.start + lastOffset,
                    codeFeatures_1.codeFeatures.all,
                ];
            }
            yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, codeFeatures_1.codeFeatures.all, leftExpressionText.slice(start, end), leftExpressionRange.start + start);
            lastOffset = end;
        }
        if (lastOffset < leftExpressionText.length) {
            yield [
                leftExpressionText.slice(lastOffset),
                'template',
                leftExpressionRange.start + lastOffset,
                codeFeatures_1.codeFeatures.all,
            ];
        }
    }
    yield `] of `;
    if (sourceAlias !== undefined) {
        yield `${names_1.names.vFor}(${names_1.names.nonNull}(`;
        yield sourceAlias;
        yield `))`; // #3102
    }
    else {
        yield (0, utils_1.asType)('any', options.scriptLang);
    }
    yield `) {${utils_1.newLine}`;
    const { inVFor } = ctx;
    ctx.inVFor = true;
    for (const child of node.children) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, child, false, true);
    }
    ctx.inVFor = inVFor;
    yield* scope.end();
    yield `}${utils_1.newLine}`;
}
function parseVForNode(node) {
    const { value, key, index } = node.parseResult;
    const leftExpressionRange = (value || key || index)
        ? {
            start: (value ?? key ?? index).loc.start.offset,
            end: (index ?? key ?? value).loc.end.offset,
        }
        : undefined;
    const leftExpressionText = leftExpressionRange
        ? node.loc.source.slice(leftExpressionRange.start - node.loc.start.offset, leftExpressionRange.end - node.loc.start.offset)
        : undefined;
    return {
        leftExpressionRange,
        leftExpressionText,
    };
}
function collectDefaultInitializers(ts, pattern, out) {
    if (ts.isIdentifier(pattern)) {
        return;
    }
    for (const element of pattern.elements) {
        if (!ts.isBindingElement(element)) {
            continue;
        }
        if (!ts.isIdentifier(element.name)) {
            collectDefaultInitializers(ts, element.name, out);
        }
        if (element.initializer) {
            out.push(element.initializer);
        }
    }
}
//# sourceMappingURL=vFor.js.map