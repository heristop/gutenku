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
exports.generateComponent = generateComponent;
exports.generateElement = generateElement;
exports.generateFragment = generateFragment;
const CompilerDOM = __importStar(require("@vue/compiler-dom"));
const shared_1 = require("@vue/shared");
const muggle_string_1 = require("muggle-string");
const shared_2 = require("../../utils/shared");
const codeFeatures_1 = require("../codeFeatures");
const inlayHints_1 = require("../inlayHints");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const camelized_1 = require("../utils/camelized");
const stringLiteralKey_1 = require("../utils/stringLiteralKey");
const elementDirectives_1 = require("./elementDirectives");
const elementEvents_1 = require("./elementEvents");
const elementProps_1 = require("./elementProps");
const interpolation_1 = require("./interpolation");
const propertyAccess_1 = require("./propertyAccess");
const styleScopedClasses_1 = require("./styleScopedClasses");
const templateChild_1 = require("./templateChild");
const vSlot_1 = require("./vSlot");
function* generateComponent(options, ctx, node) {
    let { tag, props } = node;
    let [startTagOffset, endTagOffset] = (0, shared_2.getElementTagOffsets)(node, options.template);
    let isExpression = false;
    let isIsShorthand = false;
    if (tag.includes('.')) {
        isExpression = true;
    }
    else if (tag === 'component') {
        for (const prop of node.props) {
            if (prop.type === CompilerDOM.NodeTypes.DIRECTIVE
                && prop.name === 'bind'
                && prop.arg?.loc.source === 'is'
                && prop.exp?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
                isIsShorthand = prop.arg.loc.end.offset === prop.exp.loc.end.offset;
                if (isIsShorthand) {
                    ctx.inlayHints.push((0, inlayHints_1.createVBindShorthandInlayHintInfo)(prop.exp.loc, 'is'));
                }
                isExpression = true;
                tag = prop.exp.content;
                startTagOffset = prop.exp.loc.start.offset;
                endTagOffset = undefined;
                props = props.filter(p => p !== prop);
                break;
            }
        }
    }
    const componentVar = ctx.getInternalVariable();
    if (isExpression) {
        yield `const ${componentVar} = `;
        yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, isIsShorthand
            ? codeFeatures_1.codeFeatures.withoutHighlightAndCompletion
            : codeFeatures_1.codeFeatures.all, tag, startTagOffset, `(`, `)`);
        if (endTagOffset !== undefined) {
            yield ` || `;
            yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, codeFeatures_1.codeFeatures.withoutCompletion, tag, endTagOffset, `(`, `)`);
        }
        yield `${utils_1.endOfLine}`;
    }
    else {
        const originalNames = new Set([
            (0, shared_1.capitalize)((0, shared_1.camelize)(tag)),
            (0, shared_1.camelize)(tag),
            tag,
        ]);
        const matchedImportedComponent = [...originalNames].find(name => options.importedComponents.has(name));
        if (matchedImportedComponent) {
            // navigation & auto import support
            yield `const ${componentVar} = `;
            yield* (0, camelized_1.generateCamelized)(matchedImportedComponent[0] + tag.slice(1), 'template', startTagOffset, {
                ...codeFeatures_1.codeFeatures.withoutHighlightAndCompletion,
                ...codeFeatures_1.codeFeatures.importCompletionOnly,
            });
            if (endTagOffset !== undefined) {
                yield ` || `;
                yield* (0, camelized_1.generateCamelized)(matchedImportedComponent[0] + tag.slice(1), 'template', endTagOffset, codeFeatures_1.codeFeatures.withoutHighlightAndCompletion);
            }
            yield utils_1.endOfLine;
        }
        else {
            yield* (0, utils_1.generateTypedVar)('let', componentVar, options.scriptLang, function* () {
                yield `${names_1.names.WithComponent}<'${tag}', ${names_1.names.LocalComponents}, ${names_1.names.GlobalComponents}`;
                yield originalNames.has(options.componentName)
                    ? `, typeof ${names_1.names.export}`
                    : `, void`;
                for (const name of originalNames) {
                    yield `, '${name}'`;
                }
                yield `>[`;
                yield* (0, stringLiteralKey_1.generateStringLiteralKey)(tag, startTagOffset, {
                    ...codeFeatures_1.codeFeatures.semanticWithoutHighlight,
                    ...options.vueCompilerOptions.checkUnknownComponents
                        ? codeFeatures_1.codeFeatures.verification
                        : codeFeatures_1.codeFeatures.doNotReportTs2339AndTs2551,
                });
                yield `]`;
            });
            if (utils_1.identifierRE.test((0, shared_1.camelize)(tag))) {
                // navigation support
                yield `/** @ts-ignore @type {`;
                for (const offset of [startTagOffset, endTagOffset]) {
                    if (offset === undefined) {
                        continue;
                    }
                    yield ` | typeof ${names_1.names.components}.`;
                    yield* (0, camelized_1.generateCamelized)(tag, 'template', offset, codeFeatures_1.codeFeatures.navigation);
                    if (tag[0] !== tag[0].toUpperCase()) {
                        yield ` | typeof ${names_1.names.components}.`;
                        yield* (0, camelized_1.generateCamelized)((0, shared_1.capitalize)(tag), 'template', offset, codeFeatures_1.codeFeatures.navigation);
                    }
                    if (tag.includes('-')) {
                        yield ` | typeof ${names_1.names.components}[`;
                        yield* (0, stringLiteralKey_1.generateStringLiteralKey)(tag, offset, codeFeatures_1.codeFeatures.navigation);
                        yield `]`;
                    }
                }
                yield `} */${utils_1.newLine}`;
                // auto import support
                yield* (0, camelized_1.generateCamelized)(tag, 'template', startTagOffset, codeFeatures_1.codeFeatures.importCompletionOnly);
                yield utils_1.endOfLine;
            }
        }
    }
    let isCtxVarUsed = false;
    let isPropsVarUsed = false;
    const getCtxVar = () => (isCtxVarUsed = true, ctxVar);
    const getPropsVar = () => (isPropsVarUsed = true, propsVar);
    ctx.components.push(getCtxVar);
    const functionalVar = ctx.getInternalVariable();
    const vnodeVar = ctx.getInternalVariable();
    const ctxVar = ctx.getInternalVariable();
    const propsVar = ctx.getInternalVariable();
    const failedPropExps = [];
    const propCodes = [...(0, elementProps_1.generateElementProps)(options, ctx, node, props, options.vueCompilerOptions.checkUnknownProps, failedPropExps)];
    const propsStr = (0, muggle_string_1.toString)(propCodes);
    yield `// @ts-ignore${utils_1.newLine}`;
    yield `const ${functionalVar} = ${options.vueCompilerOptions.checkUnknownProps ? names_1.names.asFunctionalComponent0 : names_1.names.asFunctionalComponent1}(${componentVar}, new ${componentVar}({${utils_1.newLine}`;
    yield `// @ts-ignore${utils_1.newLine}`;
    yield propsStr
        .replace(/\/\/(.*)$/gm, (_, body) => `/*${body.replaceAll('*/', '*\\/')} */`)
        .replace(/\n/g, ' ');
    yield `}))${utils_1.endOfLine}`;
    yield `const `;
    const boundary = yield* boundary_1.Boundary.start('template', node.loc.start.offset, node.loc.end.offset, codeFeatures_1.codeFeatures.doNotReportTs6133);
    yield vnodeVar;
    yield boundary.end();
    yield ` = ${functionalVar}`;
    const commentInfo = ctx.getCommentInfo();
    if (commentInfo.generic) {
        const { content, offset } = commentInfo.generic;
        const boundary = yield* boundary_1.Boundary.start('template', offset, offset + content.length, codeFeatures_1.codeFeatures.verification);
        yield `<`;
        yield [content, 'template', offset, codeFeatures_1.codeFeatures.all];
        yield `>`;
        yield boundary.end();
    }
    const shouldInheritAttrs = hasVBindAttrs(options, ctx, node);
    yield `(`;
    const boundary2 = yield* boundary_1.Boundary.start('template', startTagOffset, startTagOffset + tag.length, shouldInheritAttrs && options.vueCompilerOptions.checkRequiredFallthroughAttributes
        ? {}
        : codeFeatures_1.codeFeatures.verification);
    yield `{`;
    yield [``, 'template', node.loc.start.offset, { __propsCompletion: true }];
    yield utils_1.newLine;
    yield* propCodes;
    yield `}`;
    yield boundary2.end();
    yield `, ...${names_1.names.functionalComponentArgsRest}(${functionalVar}))${utils_1.endOfLine}`;
    yield* generateFailedExpressions(options, ctx, failedPropExps);
    yield* (0, elementEvents_1.generateElementEvents)(options, ctx, node, componentVar, getCtxVar, getPropsVar);
    yield* (0, elementDirectives_1.generateElementDirectives)(options, ctx, node);
    const templateRef = getTemplateRef(node);
    const isSingleRoot = ctx.singleRootNodes.has(node)
        && !options.vueCompilerOptions.fallthroughComponentNames.includes((0, shared_2.hyphenateTag)(tag));
    const inferRootEl = ctx.dollarVars.has('$el') || options.vueCompilerOptions.inferComponentDollarEl;
    const inferTemplateRefs = options.vueCompilerOptions.inferTemplateDollarRefs
        || options.vueCompilerOptions.inferComponentDollarRefs
        || options.setupRefs.size > 0;
    if ((templateRef && inferTemplateRefs) || (isSingleRoot && inferRootEl)) {
        const componentInstanceVar = ctx.getInternalVariable();
        yield* (0, utils_1.generateTypedVar)('var', componentInstanceVar, options.scriptLang, function* () {
            yield `Parameters<NonNullable<typeof ${getCtxVar()}['expose']>>[0]`;
        });
        if (templateRef && inferTemplateRefs) {
            let typeExp = `typeof ${ctx.getHoistVariable(componentInstanceVar)} | null`;
            if (ctx.inVFor) {
                typeExp = `(${typeExp})[]`;
            }
            ctx.addTemplateRef(templateRef[0], typeExp, templateRef[1]);
        }
        if (isSingleRoot && inferRootEl) {
            ctx.singleRootElTypes.add(`NonNullable<typeof ${componentInstanceVar}>['$el']`);
        }
    }
    if (shouldInheritAttrs) {
        if (options.vueCompilerOptions.checkRequiredFallthroughAttributes) {
            const restsVar = ctx.getInternalVariable();
            yield `var ${restsVar} = ${names_1.names.omit}(${getPropsVar()}, {\n${propsStr}})${utils_1.endOfLine}`;
            ctx.inheritedAttrVars.add(restsVar);
        }
        else {
            ctx.inheritedAttrVars.add(getPropsVar());
        }
    }
    yield* (0, styleScopedClasses_1.generateStyleScopedClassReferences)(options, node);
    const slotDir = node.props.find(CompilerDOM.isVSlot);
    if (slotDir || node.children.length) {
        yield* (0, vSlot_1.generateVSlot)(options, ctx, node, slotDir, getCtxVar());
    }
    if (isCtxVarUsed) {
        yield* (0, utils_1.generateTypedVar)('var', ctxVar, options.scriptLang, function* () {
            yield `${names_1.names.ExtractComponentContext}<typeof ${componentVar}, typeof ${vnodeVar}>`;
        });
    }
    if (isPropsVarUsed) {
        yield* (0, utils_1.generateTypedVar)('var', propsVar, options.scriptLang, function* () {
            yield `${names_1.names.ExtractComponentProps}<typeof ${componentVar}, typeof ${vnodeVar}>`;
        });
    }
    ctx.components.pop();
}
function* generateElement(options, ctx, node) {
    const [startTagOffset, endTagOffset] = (0, shared_2.getElementTagOffsets)(node, options.template);
    const failedPropExps = [];
    yield `${options.vueCompilerOptions.checkUnknownProps ? names_1.names.asFunctionalElement0 : names_1.names.asFunctionalElement1}(${names_1.names.intrinsics}`;
    yield* (0, propertyAccess_1.generatePropertyAccess)(options, ctx, node.tag, startTagOffset, codeFeatures_1.codeFeatures.withoutHighlightAndCompletion);
    if (endTagOffset !== undefined) {
        yield `, `;
        yield names_1.names.intrinsics;
        yield* (0, propertyAccess_1.generatePropertyAccess)(options, ctx, node.tag, endTagOffset, codeFeatures_1.codeFeatures.withoutHighlightAndCompletion);
    }
    yield `)(`;
    const boundary = yield* boundary_1.Boundary.start('template', startTagOffset, startTagOffset + node.tag.length, codeFeatures_1.codeFeatures.verification);
    yield `{${utils_1.newLine}`;
    yield* (0, elementProps_1.generateElementProps)(options, ctx, node, node.props, options.vueCompilerOptions.checkUnknownProps, failedPropExps);
    yield `}`;
    yield boundary.end();
    yield `)${utils_1.endOfLine}`;
    yield* generateFailedExpressions(options, ctx, failedPropExps);
    yield* (0, elementDirectives_1.generateElementDirectives)(options, ctx, node);
    const templateRef = getTemplateRef(node);
    if (templateRef) {
        let typeExp = `${names_1.names.Elements}['${node.tag}']`;
        if (ctx.inVFor) {
            typeExp += `[]`;
        }
        ctx.addTemplateRef(templateRef[0], typeExp, templateRef[1]);
    }
    if (ctx.singleRootNodes.has(node) && (ctx.dollarVars.has('$el') || options.vueCompilerOptions.inferComponentDollarEl)) {
        ctx.singleRootElTypes.add(`${names_1.names.Elements}['${node.tag}']`);
    }
    if (hasVBindAttrs(options, ctx, node)) {
        ctx.inheritedAttrVars.add(`${names_1.names.intrinsics}.${node.tag}`);
    }
    yield* (0, styleScopedClasses_1.generateStyleScopedClassReferences)(options, node);
    for (const child of node.children) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, child);
    }
}
function* generateFragment(options, ctx, node) {
    const [startTagOffset] = (0, shared_2.getElementTagOffsets)(node, options.template);
    const failedPropExps = [];
    // special case for <template v-for="..." :key="..." />
    if (node.props.length) {
        yield `${options.vueCompilerOptions.checkUnknownProps ? names_1.names.asFunctionalElement0 : names_1.names.asFunctionalElement1}(${names_1.names.intrinsics}.template)(`;
        const boundary = yield* boundary_1.Boundary.start('template', startTagOffset, startTagOffset + node.tag.length, codeFeatures_1.codeFeatures.verification);
        yield `{${utils_1.newLine}`;
        yield* (0, elementProps_1.generateElementProps)(options, ctx, node, node.props, options.vueCompilerOptions.checkUnknownProps, failedPropExps);
        yield `}`;
        yield boundary.end();
        yield `)${utils_1.endOfLine}`;
        yield* generateFailedExpressions(options, ctx, failedPropExps);
    }
    for (const child of node.children) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, child);
    }
}
function* generateFailedExpressions(options, ctx, failedPropExps) {
    for (const { node, prefix, suffix } of failedPropExps) {
        yield* (0, interpolation_1.generateInterpolation)(options, ctx, options.template, codeFeatures_1.codeFeatures.all, node.loc.source, node.loc.start.offset, prefix, suffix);
        yield utils_1.endOfLine;
    }
}
function getTemplateRef(node) {
    for (const prop of node.props) {
        if (prop.type === CompilerDOM.NodeTypes.ATTRIBUTE
            && prop.name === 'ref'
            && prop.value) {
            return (0, shared_2.normalizeAttributeValue)(prop.value);
        }
    }
}
function hasVBindAttrs(options, ctx, node) {
    return options.vueCompilerOptions.fallthroughAttributes && ((options.inheritAttrs && ctx.singleRootNodes.has(node))
        || node.props.some(prop => prop.type === CompilerDOM.NodeTypes.DIRECTIVE
            && prop.name === 'bind'
            && prop.exp?.loc.source === '$attrs'));
}
//# sourceMappingURL=element.js.map