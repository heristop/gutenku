"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScriptSetupImports = generateScriptSetupImports;
exports.generateGeneric = generateGeneric;
exports.generateSetupFunction = generateSetupFunction;
exports.generateMacros = generateMacros;
const shared_1 = require("@vue/shared");
const codeFeatures_1 = require("../codeFeatures");
const names_1 = require("../names");
const utils_1 = require("../utils");
const boundary_1 = require("../utils/boundary");
const camelized_1 = require("../utils/camelized");
const transform_1 = require("../utils/transform");
const component_1 = require("./component");
function* generateScriptSetupImports(scriptSetup, scriptSetupRanges) {
    yield [
        scriptSetup.content.slice(0, Math.max(scriptSetupRanges.importSectionEndOffset, scriptSetupRanges.leadingCommentEndOffset)),
        'scriptSetup',
        0,
        codeFeatures_1.codeFeatures.all,
    ];
}
function* generateGeneric(options, ctx, scriptSetup, scriptSetupRanges, generic, body) {
    yield `(`;
    if (typeof generic === 'object') {
        const boundary = yield* boundary_1.Boundary.start('main', generic.offset, generic.offset + generic.text.length, codeFeatures_1.codeFeatures.verification);
        yield `<`;
        yield [generic.text, 'main', generic.offset, codeFeatures_1.codeFeatures.all];
        if (!generic.text.trimEnd().endsWith(`,`)) {
            yield `,`;
        }
        yield `>`;
        yield boundary.end();
    }
    yield `(${utils_1.newLine}`
        + `	${names_1.names.props}: NonNullable<Awaited<typeof ${names_1.names.setup}>>['props'],${utils_1.newLine}`
        + `	${names_1.names.ctx}?: ${ctx.localTypes.PrettifyLocal}<Pick<NonNullable<Awaited<typeof ${names_1.names.setup}>>, 'attrs' | 'emit' | 'slots'>>,${utils_1.newLine}`
        + `	${names_1.names.exposed}?: NonNullable<Awaited<typeof ${names_1.names.setup}>>['expose'],${utils_1.newLine}`
        + `	${names_1.names.setup} = (async () => {${utils_1.newLine}`;
    yield* body;
    const propTypes = [];
    const emitTypes = [];
    const { vueCompilerOptions } = options;
    if (ctx.generatedTypes.has(names_1.names.PublicProps)) {
        propTypes.push(names_1.names.PublicProps);
    }
    if (scriptSetupRanges.defineProps?.arg) {
        yield `const ${names_1.names.propsOption} = `;
        yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.defineProps.arg.start, scriptSetupRanges.defineProps.arg.end, codeFeatures_1.codeFeatures.navigation);
        yield utils_1.endOfLine;
        propTypes.push(`import('${vueCompilerOptions.lib}').${vueCompilerOptions.target >= 3.3 ? `ExtractPublicPropTypes` : `ExtractPropTypes`}<typeof ${names_1.names.propsOption}>`);
    }
    if (scriptSetupRanges.defineEmits || scriptSetupRanges.defineModel.length) {
        propTypes.push(names_1.names.EmitProps);
    }
    if (options.templateAndStyleTypes.has(names_1.names.InheritedAttrs)) {
        propTypes.push(names_1.names.InheritedAttrs);
    }
    if (scriptSetupRanges.defineEmits) {
        emitTypes.push(`typeof ${scriptSetupRanges.defineEmits.name ?? names_1.names.emit}`);
    }
    if (scriptSetupRanges.defineModel.length) {
        emitTypes.push(`typeof ${names_1.names.modelEmit}`);
    }
    yield `return {} as {${utils_1.newLine}`;
    yield `	props: `;
    yield vueCompilerOptions.target >= 3.4
        ? `import('${vueCompilerOptions.lib}').PublicProps`
        : vueCompilerOptions.target >= 3
            ? `import('${vueCompilerOptions.lib}').VNodeProps`
                + ` & import('${vueCompilerOptions.lib}').AllowedComponentProps`
                + ` & import('${vueCompilerOptions.lib}').ComponentCustomProps`
            : `globalThis.JSX.IntrinsicAttributes`;
    if (propTypes.length) {
        yield ` & ${ctx.localTypes.PrettifyLocal}<${propTypes.join(` & `)}>`;
    }
    yield ` & (typeof globalThis extends { __VLS_PROPS_FALLBACK: infer P } ? P : {})${utils_1.endOfLine}`;
    yield `	expose: (exposed: `;
    yield scriptSetupRanges.defineExpose
        ? `import('${vueCompilerOptions.lib}').ShallowUnwrapRef<typeof ${names_1.names.exposed}>`
        : `{}`;
    if (options.vueCompilerOptions.inferComponentDollarRefs
        && options.templateAndStyleTypes.has(names_1.names.TemplateRefs)) {
        yield ` & { $refs: ${names_1.names.TemplateRefs}; }`;
    }
    if (options.vueCompilerOptions.inferComponentDollarEl
        && options.templateAndStyleTypes.has(names_1.names.RootEl)) {
        yield ` & { $el: ${names_1.names.RootEl}; }`;
    }
    yield `) => void${utils_1.endOfLine}`;
    yield `	attrs: any${utils_1.endOfLine}`;
    yield `	slots: ${hasSlotsType(options) ? names_1.names.Slots : `{}`}${utils_1.endOfLine}`;
    yield `	emit: ${emitTypes.length ? emitTypes.join(` & `) : `{}`}${utils_1.endOfLine}`;
    yield `}${utils_1.endOfLine}`;
    yield `})(),${utils_1.newLine}`; // __VLS_setup = (async () => {
    yield `) => ({} as import('${vueCompilerOptions.lib}').VNode & { __ctx?: NonNullable<Awaited<typeof ${names_1.names.setup}>> }))${utils_1.endOfLine}`;
}
function* generateSetupFunction(options, ctx, scriptSetup, scriptSetupRanges, body, output) {
    const transforms = [];
    for (const { defaultPropsArg } of scriptSetupRanges.defineModel) {
        if (defaultPropsArg) {
            transforms.push({
                range: [defaultPropsArg.end, defaultPropsArg.end],
                *generate() {
                    yield `: `;
                    if (scriptSetupRanges.defineProps?.typeArg) {
                        yield names_1.names.Props;
                    }
                    else {
                        // FIXME: (props: typeof props) => ... would cause TS2502
                        yield `typeof `;
                        yield scriptSetupRanges.defineProps?.name ?? names_1.names.props;
                    }
                },
            });
        }
    }
    if (scriptSetupRanges.defineProps) {
        const { name, statement, callExp, typeArg } = scriptSetupRanges.defineProps;
        const _callExp = scriptSetupRanges.withDefaults?.callExp ?? callExp;
        transforms.push(...generateDefineWithTypeTransforms(scriptSetup, statement, _callExp, typeArg, name, names_1.names.props, names_1.names.Props));
    }
    if (scriptSetupRanges.defineEmits) {
        const { name, statement, callExp, typeArg } = scriptSetupRanges.defineEmits;
        transforms.push(...generateDefineWithTypeTransforms(scriptSetup, statement, callExp, typeArg, name, names_1.names.emit, names_1.names.Emit));
    }
    if (scriptSetupRanges.defineSlots) {
        const { name, statement, callExp, typeArg } = scriptSetupRanges.defineSlots;
        transforms.push(...generateDefineWithTypeTransforms(scriptSetup, statement, callExp, typeArg, name, names_1.names.slots, names_1.names.Slots));
        if (!name) {
            transforms.push((0, transform_1.insert)(statement.end, function* () {
                yield `${utils_1.newLine}void ${names_1.names.slots}${utils_1.endOfLine}`;
            }));
        }
    }
    if (scriptSetupRanges.defineExpose) {
        const { callExp, arg, typeArg } = scriptSetupRanges.defineExpose;
        if (typeArg) {
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                yield `let ${names_1.names.exposed}!: `;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, typeArg.start, typeArg.end, codeFeatures_1.codeFeatures.all);
                yield utils_1.endOfLine;
            }), (0, transform_1.replace)(typeArg.start, typeArg.end, function* () {
                yield `typeof ${names_1.names.exposed}`;
            }));
        }
        else if (arg) {
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                yield `const ${names_1.names.exposed} = `;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.all);
                yield utils_1.endOfLine;
            }), (0, transform_1.replace)(arg.start, arg.end, function* () {
                yield names_1.names.exposed;
            }));
        }
        else {
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                yield `const ${names_1.names.exposed} = {}${utils_1.endOfLine}`;
            }));
        }
    }
    if (options.vueCompilerOptions.inferTemplateDollarAttrs) {
        for (const { callExp } of scriptSetupRanges.useAttrs) {
            const type = `typeof ${names_1.names.dollars}.$attrs`;
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                yield (0, utils_1.isTsLang)(options.scriptLang) ? `(` : `/** @type {${type}} */ (`;
            }), (0, transform_1.insert)(callExp.end, function* () {
                yield (0, utils_1.isTsLang)(options.scriptLang) ? ` as ${type})` : `)`;
            }));
        }
    }
    for (const { callExp, exp, arg } of scriptSetupRanges.useCssModule) {
        const type = options.templateAndStyleTypes.has(names_1.names.StyleModules)
            ? names_1.names.StyleModules
            : `{}`;
        if (arg) {
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                if ((0, utils_1.isTsLang)(options.scriptLang)) {
                    yield `(`;
                }
                else {
                    yield `/** @type {Omit<${type}, '$style'>[`;
                    yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.withoutSemantic);
                    yield `]} */ (`;
                }
            }), (0, transform_1.insert)(callExp.end, function* () {
                if ((0, utils_1.isTsLang)(options.scriptLang)) {
                    yield ` as Omit<${type}, '$style'>[`;
                    yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.withoutSemantic);
                    yield `])`;
                }
                else {
                    yield `)`;
                }
            }), (0, transform_1.replace)(arg.start, arg.end, function* () {
                yield (0, utils_1.asType)('any', options.scriptLang);
            }));
        }
        else {
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                yield (0, utils_1.isTsLang)(options.scriptLang) ? `(` : `/** @type {${type}['$style']} */ (`;
            }), (0, transform_1.insert)(callExp.end, function* () {
                if ((0, utils_1.isTsLang)(options.scriptLang)) {
                    yield ` as ${type}[`;
                    const boundary = yield* boundary_1.Boundary.start(scriptSetup.name, exp.start, exp.end, codeFeatures_1.codeFeatures.verification);
                    yield `'$style'`;
                    yield boundary.end();
                    yield `])`;
                }
                else {
                    yield `)`;
                }
            }));
        }
    }
    if (options.vueCompilerOptions.inferTemplateDollarSlots) {
        for (const { callExp } of scriptSetupRanges.useSlots) {
            const type = `typeof ${names_1.names.dollars}.$slots`;
            transforms.push((0, transform_1.insert)(callExp.start, function* () {
                yield (0, utils_1.isTsLang)(options.scriptLang) ? `(` : `/** @type {${type}} */ (`;
            }), (0, transform_1.insert)(callExp.end, function* () {
                yield (0, utils_1.isTsLang)(options.scriptLang) ? ` as ${type})` : `)`;
            }));
        }
    }
    for (const { callExp, arg } of scriptSetupRanges.useTemplateRef) {
        transforms.push((0, transform_1.insert)(callExp.start, function* () {
            if ((0, utils_1.isTsLang)(options.scriptLang)) {
                yield `(`;
                return;
            }
            yield `/** @type {Readonly<import('${options.vueCompilerOptions.lib}').ShallowRef<`;
            if (arg) {
                yield names_1.names.TemplateRefs;
                yield `[`;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.withoutSemantic);
                yield `]`;
            }
            else {
                yield `unknown`;
            }
            yield ` | null>>} */ (`;
        }), (0, transform_1.insert)(callExp.end, function* () {
            if ((0, utils_1.isTsLang)(options.scriptLang)) {
                yield ` as Readonly<import('${options.vueCompilerOptions.lib}').ShallowRef<`;
                if (arg) {
                    yield names_1.names.TemplateRefs;
                    yield `[`;
                    yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, arg.start, arg.end, codeFeatures_1.codeFeatures.withoutSemantic);
                    yield `]`;
                }
                else {
                    yield `unknown`;
                }
                yield ` | null>>)`;
            }
            else {
                yield `)`;
            }
        }));
        if (arg) {
            transforms.push((0, transform_1.replace)(arg.start, arg.end, function* () {
                yield (0, utils_1.asType)('any', options.scriptLang);
            }));
        }
    }
    yield* (0, transform_1.generateCodeWithTransforms)(Math.max(scriptSetupRanges.importSectionEndOffset, scriptSetupRanges.leadingCommentEndOffset), scriptSetup.content.length, transforms, (start, end) => (0, utils_1.generateSfcBlockSection)(scriptSetup, start, end, codeFeatures_1.codeFeatures.all));
    yield* generateModels(options, scriptSetup, scriptSetupRanges);
    yield* generatePublicProps(options, ctx, scriptSetup, scriptSetupRanges);
    yield* body;
    if (output) {
        if (hasSlotsType(options)) {
            yield `const ${names_1.names.base} = `;
            yield* (0, component_1.generateComponent)(options, ctx, scriptSetup, scriptSetupRanges);
            yield utils_1.endOfLine;
            yield* output;
            yield (0, utils_1.asType)(`${ctx.localTypes.WithSlots}<typeof ${names_1.names.base}, ${names_1.names.Slots}>`, options.scriptLang);
            yield utils_1.endOfLine;
        }
        else {
            yield* output;
            yield* (0, component_1.generateComponent)(options, ctx, scriptSetup, scriptSetupRanges);
            yield utils_1.endOfLine;
        }
    }
}
// An `import` (rather than `declare const`) keeps the macros resolvable in JS
// virtual files, where type-only declarations are syntax errors. Imports hoist,
// so this can be emitted after all user content: leading directives stay ahead
// of any statement, and the import-section/content junction stays intact.
function* generateMacros(options) {
    if (options.vueCompilerOptions.target >= 3.3) {
        const scriptSetup = options.scriptSetup;
        const scriptSetupRanges = options.scriptSetupRanges;
        if (!scriptSetup || !scriptSetupRanges) {
            return;
        }
        const usedMacros = [];
        const add = (canonical, exp) => {
            if (exp) {
                usedMacros.push({ canonical, alias: getRangeText(scriptSetup, exp) });
            }
        };
        add('defineProps', scriptSetupRanges.defineProps?.exp);
        add('defineEmits', scriptSetupRanges.defineEmits?.exp);
        add('defineSlots', scriptSetupRanges.defineSlots?.exp);
        add('defineExpose', scriptSetupRanges.defineExpose?.exp);
        add('withDefaults', scriptSetupRanges.withDefaults?.exp);
        if (scriptSetupRanges.defineModel.length) {
            usedMacros.push({ canonical: 'defineModel', alias: 'defineModel' });
        }
        if (scriptSetupRanges.defineOptions) {
            usedMacros.push({ canonical: 'defineOptions', alias: 'defineOptions' });
        }
        const toImport = usedMacros.filter(({ alias }) => !options.setupBindings.has(alias));
        if (toImport.length) {
            yield `const { `;
            for (const { canonical, alias } of toImport) {
                yield alias === canonical ? `${canonical}, ` : `${canonical}: ${alias}, `;
            }
            yield `} = `;
            yield (0, utils_1.asType)(`typeof import('${options.vueCompilerOptions.lib}')`, options.scriptLang);
            yield utils_1.endOfLine;
        }
    }
}
function* generateDefineWithTypeTransforms(scriptSetup, statement, callExp, typeArg, name, defaultName, typeName) {
    if (typeArg) {
        yield (0, transform_1.insert)(statement.start, function* () {
            yield `type ${typeName} = `;
            yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, typeArg.start, typeArg.end, codeFeatures_1.codeFeatures.all);
            yield utils_1.endOfLine;
        });
        yield (0, transform_1.replace)(typeArg.start, typeArg.end, function* () {
            yield typeName;
        });
    }
    if (!name) {
        if (statement.start === callExp.start && statement.end === callExp.end) {
            yield (0, transform_1.insert)(callExp.start, function* () {
                yield `const ${defaultName} = `;
            });
        }
        else if (typeArg) {
            yield (0, transform_1.replace)(statement.start, typeArg.start, function* () {
                yield `const ${defaultName} = `;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, callExp.start, typeArg.start, codeFeatures_1.codeFeatures.all);
            });
            yield (0, transform_1.replace)(typeArg.end, callExp.end, function* () {
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, typeArg.end, callExp.end, codeFeatures_1.codeFeatures.all);
                yield utils_1.endOfLine;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, statement.start, callExp.start, codeFeatures_1.codeFeatures.all);
                yield defaultName;
            });
        }
        else {
            yield (0, transform_1.replace)(statement.start, callExp.end, function* () {
                yield `const ${defaultName} = `;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, callExp.start, callExp.end, codeFeatures_1.codeFeatures.all);
                yield utils_1.endOfLine;
                yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, statement.start, callExp.start, codeFeatures_1.codeFeatures.all);
                yield defaultName;
            });
        }
    }
    else if (!utils_1.identifierRE.test(name)) {
        yield (0, transform_1.replace)(statement.start, callExp.start, function* () {
            yield `const ${defaultName} = `;
        });
        yield (0, transform_1.insert)(statement.end, function* () {
            yield utils_1.endOfLine;
            yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, statement.start, callExp.start, codeFeatures_1.codeFeatures.all);
            yield defaultName;
        });
    }
}
function* generatePublicProps(options, ctx, scriptSetup, scriptSetupRanges) {
    if (scriptSetupRanges.defineProps?.typeArg && scriptSetupRanges.withDefaults?.arg) {
        yield `const ${names_1.names.defaults} = `;
        yield* (0, utils_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.withDefaults.arg.start, scriptSetupRanges.withDefaults.arg.end, codeFeatures_1.codeFeatures.navigation);
        yield utils_1.endOfLine;
        yield `void ${names_1.names.defaults}${utils_1.endOfLine}`;
    }
    const propTypes = [];
    if (options.vueCompilerOptions.jsxSlots && hasSlotsType(options)) {
        propTypes.push(`${ctx.localTypes.PropsChildren}<${names_1.names.Slots}>`);
    }
    if (scriptSetupRanges.defineProps?.typeArg) {
        propTypes.push(names_1.names.Props);
    }
    if (scriptSetupRanges.defineModel.length) {
        propTypes.push(names_1.names.ModelProps);
    }
    const target = options.vueCompilerOptions.target;
    const used = !!scriptSetup.generic
        || target < 3.6
        || (target >= 3.5 && !scriptSetupRanges.defineProps?.arg);
    if (propTypes.length && used) {
        yield* (0, utils_1.generateTypeAlias)(names_1.names.PublicProps, options.scriptLang, function* () {
            yield propTypes.join(` & `);
        });
        ctx.generatedTypes.add(names_1.names.PublicProps);
    }
}
function hasSlotsType(options) {
    return !!(options.scriptSetupRanges?.defineSlots
        || options.templateAndStyleTypes.has(names_1.names.Slots));
}
function* generateModels(options, scriptSetup, scriptSetupRanges) {
    if (!scriptSetupRanges.defineModel.length) {
        return;
    }
    const defaultCodes = [];
    const propCodes = [];
    const emitCodes = [];
    for (const defineModel of scriptSetupRanges.defineModel) {
        const propName = defineModel.name
            ? (0, shared_1.camelize)(getRangeText(scriptSetup, defineModel.name).slice(1, -1))
            : 'modelValue';
        let modelType;
        if (defineModel.type) {
            // Infer from defineModel<T>
            modelType = getRangeText(scriptSetup, defineModel.type);
        }
        else if (defineModel.runtimeType && defineModel.localName) {
            // Infer from actual prop declaration code
            modelType = `typeof ${getRangeText(scriptSetup, defineModel.localName)}['value']`;
        }
        else if (defineModel.defaultValue && propName) {
            // Infer from defineModel({ default: T })
            modelType = `typeof ${names_1.names.defaultModels}['${propName}']`;
        }
        else {
            modelType = `any`;
        }
        if (defineModel.defaultValue) {
            defaultCodes.push(`'${propName}': ${getRangeText(scriptSetup, defineModel.defaultValue)},${utils_1.newLine}`);
        }
        propCodes.push(generateModelProp(options, scriptSetup, defineModel, propName, modelType));
        emitCodes.push(generateModelEmit(defineModel, propName, modelType));
    }
    if (defaultCodes.length) {
        yield `const ${names_1.names.defaultModels} = {${utils_1.newLine}`;
        yield* defaultCodes;
        yield `}${utils_1.endOfLine}`;
        yield `void ${names_1.names.defaultModels}${utils_1.endOfLine}`;
    }
    yield* (0, utils_1.generateTypeAlias)(names_1.names.ModelProps, options.scriptLang, function* () {
        yield `{${utils_1.newLine}`;
        for (const codes of propCodes) {
            yield* codes;
        }
        yield `}`;
    });
    yield* (0, utils_1.generateTypeAlias)(names_1.names.ModelEmit, options.scriptLang, function* () {
        yield `{${utils_1.newLine}`;
        for (const codes of emitCodes) {
            yield* codes;
        }
        yield `}`;
    });
    // avoid `defineModel<...>()` to prevent JS AST issues
    yield* (0, utils_1.generateTypedVar)('let', names_1.names.modelEmit, options.scriptLang, function* () {
        yield `${names_1.names.ShortEmits}<${names_1.names.ModelEmit}>`;
    });
}
function* generateModelProp(options, scriptSetup, defineModel, propName, modelType) {
    // In JS the alias body lives inside a JSDoc comment; user comments could
    // contain `*/` and terminate it early, so they are dropped.
    if (defineModel.comments && (0, utils_1.isTsLang)(options.scriptLang)) {
        yield scriptSetup.content.slice(defineModel.comments.start, defineModel.comments.end);
        yield utils_1.newLine;
    }
    if (defineModel.name) {
        yield* (0, camelized_1.generateCamelized)(getRangeText(scriptSetup, defineModel.name), scriptSetup.name, defineModel.name.start, codeFeatures_1.codeFeatures.navigation);
    }
    else {
        yield propName;
    }
    yield defineModel.required ? `: ` : `?: `;
    yield modelType;
    yield utils_1.endOfLine;
    if (defineModel.modifierType) {
        const modifierName = `${propName === 'modelValue' ? 'model' : propName}Modifiers`;
        const modifierType = getRangeText(scriptSetup, defineModel.modifierType);
        yield `'${modifierName}'?: Partial<Record<${modifierType}, true>>${utils_1.endOfLine}`;
    }
}
function* generateModelEmit(defineModel, propName, modelType) {
    yield `'update:${propName}': [value: `;
    yield modelType;
    if (!defineModel.required && !defineModel.defaultValue) {
        yield ` | undefined`;
    }
    yield `]${utils_1.endOfLine}`;
}
function getRangeText(scriptSetup, range) {
    return scriptSetup.content.slice(range.start, range.end);
}
//# sourceMappingURL=scriptSetup.js.map