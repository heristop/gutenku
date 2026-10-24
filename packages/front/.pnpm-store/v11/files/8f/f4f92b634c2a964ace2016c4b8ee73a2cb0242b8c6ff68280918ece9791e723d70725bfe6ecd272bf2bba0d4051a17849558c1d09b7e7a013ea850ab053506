"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplate = generate;
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const context_1 = require("./context");
const objectProperty_1 = require("./objectProperty");
const styleScopedClasses_1 = require("./styleScopedClasses");
const templateChild_1 = require("./templateChild");
function generate(options) {
    // The references registry accumulates across codegen passes; start clean.
    styleScopedClasses_1.references.delete(options.template);
    const ctx = (0, context_1.createTemplateCodegenContext)();
    const codeGenerator = generateWorker(options, ctx);
    const codes = [];
    for (const code of codeGenerator) {
        if (typeof code === 'object') {
            code[3] = ctx.resolveCodeFeatures(code[3]);
        }
        codes.push(code);
    }
    return { ...ctx, codes };
}
function* generateWorker(options, ctx) {
    const scope = ctx.scope();
    const { slotsAssignName, propsAssignName, vueCompilerOptions, template, } = options;
    if (slotsAssignName) {
        scope.declare(slotsAssignName);
    }
    if (propsAssignName) {
        scope.declare(propsAssignName);
    }
    if (vueCompilerOptions.inferTemplateDollarSlots) {
        ctx.dollarVars.add('$slots');
    }
    if (vueCompilerOptions.inferTemplateDollarAttrs) {
        ctx.dollarVars.add('$attrs');
    }
    if (vueCompilerOptions.inferTemplateDollarRefs) {
        ctx.dollarVars.add('$refs');
    }
    if (vueCompilerOptions.inferTemplateDollarEl) {
        ctx.dollarVars.add('$el');
    }
    if (template.ast) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, template.ast);
    }
    yield* ctx.generateHoistVariables();
    yield* generateSlotsType(options, ctx);
    yield* generateInheritedAttrsType(options, ctx);
    yield* generateTemplateRefsType(options, ctx);
    yield* generateRootElType(options, ctx);
    if (ctx.dollarVars.size) {
        yield* (0, utils_1.generateTypedVar)('var', names_1.names.dollars, options.scriptLang, function* () {
            yield `{${utils_1.newLine}`;
            if (ctx.dollarVars.has('$slots')) {
                const type = ctx.generatedTypes.has(names_1.names.Slots) ? names_1.names.Slots : `{}`;
                yield `$slots: ${type}${utils_1.endOfLine}`;
            }
            if (ctx.dollarVars.has('$attrs')) {
                yield `$attrs: import('${vueCompilerOptions.lib}').ComponentPublicInstance['$attrs']`;
                if (ctx.generatedTypes.has(names_1.names.InheritedAttrs)) {
                    yield ` & ${names_1.names.InheritedAttrs}`;
                }
                yield utils_1.endOfLine;
            }
            if (ctx.dollarVars.has('$refs')) {
                const type = ctx.generatedTypes.has(names_1.names.TemplateRefs) ? names_1.names.TemplateRefs : `{}`;
                yield `$refs: ${type}${utils_1.endOfLine}`;
            }
            if (ctx.dollarVars.has('$el')) {
                const type = ctx.generatedTypes.has(names_1.names.RootEl) ? names_1.names.RootEl : `any`;
                yield `$el: ${type}${utils_1.endOfLine}`;
            }
            yield `} & { [K in keyof import('${vueCompilerOptions.lib}').ComponentPublicInstance]: unknown }`;
        });
    }
    yield* scope.end();
}
function* generateSlotsType(options, ctx) {
    if (options.hasDefineSlots) {
        ctx.generatedTypes.add(names_1.names.Slots);
        return;
    }
    if (!ctx.slots.length && !ctx.dynamicSlots.length) {
        return;
    }
    ctx.generatedTypes.add(names_1.names.Slots);
    yield* (0, utils_1.generateTypeAlias)(names_1.names.Slots, options.scriptLang, function* () {
        yield `{}`;
        for (const { expVar, propsVar } of ctx.dynamicSlots) {
            yield `${utils_1.newLine}& { [K in NonNullable<typeof ${expVar}>]?: (props: typeof ${propsVar}) => any }`;
        }
        for (const slot of ctx.slots) {
            yield `${utils_1.newLine}& { `;
            if (slot.name && slot.offset !== undefined) {
                yield* (0, objectProperty_1.generateObjectProperty)(options, ctx, slot.name, slot.offset, codeFeatures_1.codeFeatures.navigation);
            }
            else {
                const boundary = yield* boundary_1.Boundary.start('template', ...slot.tagRange, codeFeatures_1.codeFeatures.navigation);
                yield `default`;
                yield boundary.end();
            }
            yield `?: (props: typeof ${slot.propsVar}) => any }`;
        }
    });
}
function* generateInheritedAttrsType(options, ctx) {
    if (!ctx.inheritedAttrVars.size) {
        return;
    }
    ctx.generatedTypes.add(names_1.names.InheritedAttrs);
    const type = [...ctx.inheritedAttrVars].map(name => `typeof ${name}`).join(` & `);
    yield* (0, utils_1.generateTypeAlias)(names_1.names.InheritedAttrs, options.scriptLang, function* () {
        yield options.vueCompilerOptions.checkRequiredFallthroughAttributes
            ? type
            : `Partial<${type}>`;
    });
}
function* generateTemplateRefsType(options, ctx) {
    if (!ctx.templateRefs.size
        || !(options.vueCompilerOptions.inferTemplateDollarRefs
            || options.vueCompilerOptions.inferComponentDollarRefs
            || options.setupRefs.size)) {
        return;
    }
    ctx.generatedTypes.add(names_1.names.TemplateRefs);
    yield* (0, utils_1.generateTypeAlias)(names_1.names.TemplateRefs, options.scriptLang, function* () {
        yield `{}`;
        for (const [name, refs] of ctx.templateRefs) {
            yield `${utils_1.newLine}& `;
            if (refs.length >= 2) {
                yield `(`;
            }
            for (let i = 0; i < refs.length; i++) {
                const { typeExp, offset } = refs[i];
                if (i) {
                    yield ` | `;
                }
                yield `{ `;
                yield* (0, objectProperty_1.generateObjectProperty)(options, ctx, name, offset, codeFeatures_1.codeFeatures.navigation);
                yield `: ${typeExp} }`;
            }
            if (refs.length >= 2) {
                yield `)`;
            }
        }
    });
}
function* generateRootElType(options, ctx) {
    if (!ctx.singleRootElTypes.size || ctx.singleRootNodes.has(null)) {
        return;
    }
    ctx.generatedTypes.add(names_1.names.RootEl);
    yield* (0, utils_1.generateTypeAlias)(names_1.names.RootEl, options.scriptLang, function* () {
        for (const type of ctx.singleRootElTypes) {
            yield `${utils_1.newLine}| ${type}`;
        }
    });
}
//# sourceMappingURL=index.js.map