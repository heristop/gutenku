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
exports.generateElementEvents = generateElementEvents;
exports.generateEventArg = generateEventArg;
exports.generateEventExpression = generateEventExpression;
exports.generateModelEventExpression = generateModelEventExpression;
exports.isCompoundExpression = isCompoundExpression;
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const shared_1 = require("@vue/shared");
const utils_1 = require("../../parsers/utils");
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_2 = require("../utils");
const boundary_1 = require("../utils/boundary");
const camelized_1 = require("../utils/camelized");
const interpolation_1 = require("./interpolation");
function* generateElementEvents(options, ctx, node, componentOriginalVar, getCtxVar, getPropsVar) {
    const definitions = {};
    for (const prop of node.props) {
        if (prop.type === CompilerDOM.NodeTypes.DIRECTIVE
            && (prop.name === 'on'
                && (prop.arg?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION && prop.arg.isStatic)
                || options.vueCompilerOptions.strictVModel
                    && prop.name === 'model'
                    && (!prop.arg || prop.arg.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION && prop.arg.isStatic))) {
            let source = prop.arg?.loc.source ?? 'model-value';
            let offset = prop.arg?.loc.start.offset;
            let propPrefix = 'on-';
            let emitPrefix = '';
            if (prop.name === 'model') {
                propPrefix = 'onUpdate:';
                emitPrefix = 'update:';
            }
            else if (source.startsWith('vue:')) {
                source = source.slice('vue:'.length);
                offset = offset + 'vue:'.length;
                propPrefix = 'onVnode-';
                emitPrefix = 'vnode-';
            }
            const propName = (0, shared_1.camelize)(propPrefix + source);
            const emitName = emitPrefix + source;
            const key = [
                prop.name,
                propName,
                ...prop.modifiers.map(modifier => modifier.content),
            ].join('+');
            definitions[key] ??= {
                propPrefix,
                emitPrefix,
                propName,
                emitName,
                items: [],
            };
            definitions[key].items.push({
                prop,
                source,
                offset,
            });
        }
    }
    if (!Object.keys(definitions).length) {
        return;
    }
    const emitsVar = ctx.getInternalVariable();
    yield* (0, utils_2.generateTypedVar)('let', emitsVar, options.scriptLang, function* () {
        yield `${names_1.names.ResolveEmits}<typeof ${componentOriginalVar}, typeof ${getCtxVar()}.emit>`;
    });
    for (const { propPrefix, emitPrefix, propName, emitName, items } of Object.values(definitions)) {
        const eventVar = ctx.getInternalVariable();
        const eventType = `${options.vueCompilerOptions.checkUnknownEvents ? '' : 'Record<string, unknown> & '}Partial<${names_1.names.ResolveEvent}<typeof ${getPropsVar()}, typeof ${emitsVar}, '${propName}', '${emitName}', '${(0, shared_1.camelize)(emitName)}'>>`;
        if ((0, utils_2.isTsLang)(options.scriptLang)) {
            yield `const ${eventVar}: ${eventType} = {${utils_2.newLine}`;
        }
        else {
            yield `/** @type {${eventType}} */${utils_2.newLine}const ${eventVar} = {${utils_2.newLine}`;
        }
        for (const { prop, source, offset } of items) {
            if (prop.name === 'on') {
                yield `/** @type {typeof ${emitsVar}.`;
                yield* generateEventArg(options, source, offset, emitPrefix.slice(0, -1), codeFeatures_1.codeFeatures.navigation);
                yield `} */${utils_2.newLine}`;
            }
            if (prop.name === 'on') {
                yield* generateEventArg(options, source, offset, propPrefix.slice(0, -1));
                yield `: `;
                yield* generateEventExpression(options, ctx, prop);
            }
            else {
                yield `'${propName}': `;
                yield* generateModelEventExpression(options, ctx, prop);
            }
            yield `,${utils_2.newLine}`;
        }
        yield `}${utils_2.endOfLine}`;
        yield `void ${eventVar}${utils_2.endOfLine}`;
    }
}
function* generateEventArg(options, name, start, directive = 'on', features) {
    features ??= {
        ...codeFeatures_1.codeFeatures.semanticWithoutHighlight,
        ...codeFeatures_1.codeFeatures.navigationWithoutRename,
        ...options.vueCompilerOptions.checkUnknownEvents
            ? codeFeatures_1.codeFeatures.verification
            : codeFeatures_1.codeFeatures.doNotReportTs2353AndTs2561,
    };
    if (directive.length) {
        name = (0, shared_1.capitalize)(name);
    }
    const boundary = yield* boundary_1.Boundary.start('template', start, start + name.length, features);
    if (utils_2.identifierRE.test((0, shared_1.camelize)(name))) {
        yield directive;
        yield* (0, camelized_1.generateCamelized)(name, 'template', start, boundary.features);
    }
    else {
        yield `'`;
        yield directive;
        yield* (0, camelized_1.generateCamelized)(name, 'template', start, boundary.features);
        yield `'`;
        yield boundary.end();
    }
}
function* generateEventExpression(options, ctx, prop) {
    if (prop.exp?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
        const ast = (0, utils_2.getTypeScriptAST)(options.typescript, options.template, prop.exp.content);
        const isCompound = isCompoundExpression(options.typescript, ast);
        const interpolation = (0, interpolation_1.generateInterpolation)(options, ctx, options.template, codeFeatures_1.codeFeatures.all, prop.exp.content, prop.exp.loc.start.offset, isCompound ? `` : `(`, isCompound ? `` : `)`);
        if (isCompound) {
            const scope = ctx.scope();
            scope.declare('$event');
            const accessMark = ctx.accessLog.length;
            const codes = [];
            for (const code of interpolation) {
                codes.push(code);
            }
            yield `// @ts-ignore${utils_2.newLine}`;
            yield `(...[$event]) => {${utils_2.newLine}`;
            // consume $event to avoid TS6133 when the expression doesn't use it
            yield `void $event${utils_2.endOfLine}`;
            yield* generateReasserts(options, ctx, accessMark);
            yield* ctx.generateConditionGuards();
            if (isSingleExpression(options.typescript, ast)) {
                yield `return (`;
                yield* codes;
                yield `)`;
            }
            else {
                yield* codes;
            }
            yield utils_2.endOfLine;
            yield* scope.end();
            yield `}`;
            ctx.inlayHints.push({
                blockName: 'template',
                offset: prop.exp.loc.start.offset,
                setting: 'vue.inlayHints.inlineHandlerLeading',
                label: '$event =>',
                paddingRight: true,
                tooltip: [
                    '`$event` is a hidden parameter, you can use it in this callback.',
                    'To hide this hint, set `vue.inlayHints.inlineHandlerLeading` to `false` in IDE settings.',
                    '[More info](https://github.com/vuejs/language-tools/issues/2445#issuecomment-1444771420)',
                ].join('\n\n'),
            });
        }
        else {
            yield* interpolation;
        }
    }
    else {
        yield `() => {}`;
    }
}
function* generateModelEventExpression(options, ctx, prop) {
    if (prop.exp?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
        const accessMark = ctx.accessLog.length;
        const codes = [...(0, interpolation_1.generateInterpolation)(options, ctx, options.template, codeFeatures_1.codeFeatures.verification, prop.exp.content, prop.exp.loc.start.offset, undefined, undefined, true)];
        yield `// @ts-ignore${utils_2.newLine}`;
        yield `(...[$event]) => {${utils_2.newLine}`;
        yield* generateReasserts(options, ctx, accessMark);
        yield* ctx.generateConditionGuards();
        yield* codes;
        yield ` = $event${utils_2.endOfLine}`;
        yield `}`;
    }
    else {
        yield `() => {}`;
    }
}
// Assertion narrowing does not flow into nested closures for imports and
// `let`/`var` bindings (TS limitation), so re-assert those bindings at closure tops.
function* generateReasserts(options, ctx, accessMark) {
    const reasserts = new Set();
    const collect = (name) => {
        if (options.reassertBindings.has(name) && !ctx.scopes.some(scope => scope.has(name))) {
            reasserts.add(name);
        }
    };
    for (const name of ctx.accessLog.slice(accessMark)) {
        collect(name);
    }
    for (const condition of ctx.conditions) {
        for (const name of condition.accesses) {
            collect(name);
        }
    }
    for (const name of reasserts) {
        yield `${names_1.names.withDotValue}(${name}, ${(0, utils_2.getRefBrandArgument)(options.vueCompilerOptions, options.scriptLang)})${utils_2.endOfLine}`;
    }
}
function isCompoundExpression(ts, ast) {
    if (ast.statements.length === 0) {
        return false;
    }
    if (ast.statements.length === 1 && ast.text[ast.endOfFileToken.pos - 1] !== ';') {
        const statement = ast.statements[0];
        if (ts.isExpressionStatement(statement)) {
            const node = (0, utils_1.getUnwrappedExpression)(ts, statement.expression);
            if (ts.isArrowFunction(node)
                || ts.isIdentifier(node)
                || ts.isElementAccessExpression(node)
                || ts.isPropertyAccessExpression(node)) {
                return false;
            }
        }
        else if (ts.isFunctionDeclaration(statement)) {
            return false;
        }
    }
    return true;
}
function isSingleExpression(ts, ast) {
    if (ast.statements.length === 1 && ast.text[ast.endOfFileToken.pos - 1] !== ';') {
        const statement = ast.statements[0];
        if (ts.isExpressionStatement(statement)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=elementEvents.js.map