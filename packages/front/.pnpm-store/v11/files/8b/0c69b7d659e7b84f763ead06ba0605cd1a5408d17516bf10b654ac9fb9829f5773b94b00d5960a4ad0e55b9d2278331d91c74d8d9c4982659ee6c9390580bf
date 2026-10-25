"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComponent = generateComponent;
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const merge_1 = require("../utils/merge");
function* generateComponent(options, ctx, scriptSetup, scriptSetupRanges) {
    yield `(await import('${options.vueCompilerOptions.lib}')).defineComponent({${utils_1.newLine}`;
    if (scriptSetupRanges.defineExpose) {
        yield `setup: () => ${names_1.names.exposed},${utils_1.newLine}`;
    }
    const emitOptionCodes = [...generateEmitsOption(options, scriptSetupRanges)];
    yield* emitOptionCodes;
    yield* generatePropsOption(options, ctx, scriptSetup, scriptSetupRanges, !!emitOptionCodes.length);
    if (options.vueCompilerOptions.target >= 3.5
        && options.vueCompilerOptions.inferComponentDollarRefs
        && options.templateAndStyleTypes.has(names_1.names.TemplateRefs)) {
        yield `__typeRefs: ${(0, utils_1.asType)(names_1.names.TemplateRefs, options.scriptLang)},${utils_1.newLine}`;
    }
    if (options.vueCompilerOptions.target >= 3.5
        && options.vueCompilerOptions.inferComponentDollarEl
        && options.templateAndStyleTypes.has(names_1.names.RootEl)) {
        yield `__typeEl: ${(0, utils_1.asType)(names_1.names.RootEl, options.scriptLang)},${utils_1.newLine}`;
    }
    yield `})`;
}
function* generateEmitsOption(options, scriptSetupRanges) {
    const typeCodes = options.vueCompilerOptions.target >= 3.5 && !scriptSetupRanges.defineEmits?.hasUnionTypeArg
        ? [...generateTypeEmitsOption(scriptSetupRanges)]
        : [];
    const runtimeCodes = !typeCodes.length
        ? [...generateRuntimeEmitsOption(options, scriptSetupRanges)]
        : [];
    if (typeCodes.length) {
        yield `__typeEmits: ${(0, utils_1.asType)(typeCodes.join(` & `), options.scriptLang)},${utils_1.newLine}`;
    }
    else if (runtimeCodes.length) {
        yield `emits: `;
        yield* (0, merge_1.generateSpreadMerge)(...runtimeCodes);
        yield `,${utils_1.newLine}`;
    }
}
function* generateTypeEmitsOption(scriptSetupRanges) {
    if (scriptSetupRanges.defineModel.length) {
        yield names_1.names.ModelEmit;
    }
    if (scriptSetupRanges.defineEmits?.typeArg) {
        yield names_1.names.Emit;
    }
}
function* generateRuntimeEmitsOption(options, scriptSetupRanges) {
    if (scriptSetupRanges.defineModel.length) {
        yield (0, utils_1.asType)(`${names_1.names.NormalizeEmits}<typeof ${names_1.names.modelEmit}>`, options.scriptLang);
    }
    if (scriptSetupRanges.defineEmits) {
        yield (0, utils_1.asType)(`${names_1.names.NormalizeEmits}<typeof ${scriptSetupRanges.defineEmits.name ?? names_1.names.emit}>`, options.scriptLang);
    }
}
function* generatePropsOption(options, ctx, scriptSetup, scriptSetupRanges, hasEmitsOption) {
    const typeCodes = options.vueCompilerOptions.target >= 3.5 && !scriptSetupRanges.defineProps?.arg
        ? [...generateTypePropsOption(options, ctx, hasEmitsOption)]
        : [];
    const runtimeCodes = scriptSetupRanges.withDefaults || !typeCodes.length
        ? [...generateRuntimePropsOption(options, ctx, scriptSetup, scriptSetupRanges, hasEmitsOption)]
        : [];
    if (typeCodes.length) {
        if (options.vueCompilerOptions.target >= 3.6 && scriptSetupRanges.withDefaults?.arg) {
            yield `__defaults: ${names_1.names.defaults},${utils_1.newLine}`;
        }
        yield `__typeProps: `;
        yield* (0, merge_1.generateSpreadMerge)(...typeCodes);
        yield `,${utils_1.newLine}`;
    }
    if (runtimeCodes.length) {
        yield `props: `;
        yield* (0, merge_1.generateSpreadMerge)(...runtimeCodes);
        yield `,${utils_1.newLine}`;
    }
}
function* generateTypePropsOption(options, ctx, hasEmitsOption) {
    if (options.templateAndStyleTypes.has(names_1.names.InheritedAttrs)) {
        const attrsType = hasEmitsOption
            ? `Omit<${names_1.names.InheritedAttrs}, keyof ${names_1.names.EmitProps}>`
            : names_1.names.InheritedAttrs;
        yield (0, utils_1.asType)(attrsType, options.scriptLang);
    }
    if (ctx.generatedTypes.has(names_1.names.PublicProps)) {
        yield (0, utils_1.asType)(names_1.names.PublicProps, options.scriptLang);
    }
}
function* generateRuntimePropsOption(options, ctx, scriptSetup, scriptSetupRanges, hasEmitsOption) {
    if (options.templateAndStyleTypes.has(names_1.names.InheritedAttrs)) {
        const attrsType = hasEmitsOption
            ? `Omit<${names_1.names.InheritedAttrs}, keyof ${names_1.names.EmitProps}>`
            : names_1.names.InheritedAttrs;
        const propsType = `${ctx.localTypes.TypePropsToOption}<${names_1.names.PickNotAny}<${ctx.localTypes.OmitIndexSignature}<${attrsType}>, {}>>`;
        yield (0, utils_1.asType)(propsType, options.scriptLang);
    }
    if (ctx.generatedTypes.has(names_1.names.PublicProps) && options.vueCompilerOptions.target < 3.6) {
        let propsType = `${ctx.localTypes.TypePropsToOption}<${names_1.names.PublicProps}>`;
        if (scriptSetupRanges.withDefaults?.arg) {
            propsType = `${ctx.localTypes.WithDefaults}<${propsType}, typeof ${names_1.names.defaults}>`;
        }
        yield (0, utils_1.asType)(propsType, options.scriptLang);
    }
    if (scriptSetupRanges.defineProps?.arg) {
        const { arg } = scriptSetupRanges.defineProps;
        yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.navigation);
    }
}
//# sourceMappingURL=component.js.map