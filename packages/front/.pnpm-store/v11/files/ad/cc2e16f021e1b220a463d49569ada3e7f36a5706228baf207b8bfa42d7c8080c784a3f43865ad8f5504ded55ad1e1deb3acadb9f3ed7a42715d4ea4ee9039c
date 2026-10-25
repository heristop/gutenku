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
exports.tsCodegen = exports.serviceScriptRE = void 0;
const shared_1 = require("@vue/shared");
const alien_signals_1 = require("alien-signals");
const path = __importStar(require("path-browserify"));
const script_1 = require("../codegen/script");
const style_1 = require("../codegen/style");
const template_1 = require("../codegen/template");
const compilerOptions_1 = require("../compilerOptions");
const scriptRanges_1 = require("../parsers/scriptRanges");
const scriptSetupRanges_1 = require("../parsers/scriptSetupRanges");
const vueCompilerOptions_1 = require("../parsers/vueCompilerOptions");
const signals_1 = require("../utils/signals");
exports.serviceScriptRE = /^script_(?:js|jsx|ts|tsx)$/;
exports.tsCodegen = new WeakMap();
const validLangs = new Set(['js', 'jsx', 'ts', 'tsx']);
const plugin = ({ modules: { typescript: ts }, vueCompilerOptions, }) => {
    return {
        version: 2.2,
        getEmbeddedCodes(_fileName, ir) {
            const lang = computeLang(ir);
            return [{ lang, id: 'script_' + lang }];
        },
        resolveEmbeddedCode(fileName, ir, embeddedFile) {
            if (exports.serviceScriptRE.test(embeddedFile.id)) {
                let codegen = exports.tsCodegen.get(ir);
                if (!codegen) {
                    exports.tsCodegen.set(ir, codegen = useCodegen(ts, vueCompilerOptions, fileName, ir));
                }
                const generatedScript = codegen.getGeneratedScript();
                embeddedFile.content = [...generatedScript.codes];
            }
        },
    };
};
function computeLang(ir) {
    let lang = ir.scriptSetup?.lang ?? ir.script?.lang;
    if (ir.script && ir.scriptSetup) {
        if (ir.scriptSetup.lang !== 'js') {
            lang = ir.scriptSetup.lang;
        }
        else {
            lang = ir.script.lang;
        }
    }
    if (lang && validLangs.has(lang)) {
        return lang;
    }
    return 'ts';
}
exports.default = plugin;
function useCodegen(ts, vueCompilerOptions, fileName, ir) {
    const getResolvedOptions = (0, alien_signals_1.computed)(() => {
        const options = (0, vueCompilerOptions_1.parseVueCompilerOptions)(ir.comments);
        if (options) {
            const resolver = new compilerOptions_1.CompilerOptionsResolver(ts, () => undefined /* does not support resolving target="auto" */);
            resolver.addConfig(options, path.dirname(fileName));
            return resolver.build(vueCompilerOptions);
        }
        return vueCompilerOptions;
    });
    const getIsVapor = (0, alien_signals_1.computed)(() => getResolvedOptions().vapor || !!(ir.scriptSetup?.attrs.vapor || ir.template?.attrs.vapor));
    const getScriptRanges = (0, alien_signals_1.computed)(() => ir.script && validLangs.has(ir.script.lang)
        ? (0, scriptRanges_1.parseScriptRanges)(ts, ir.script.ast, getResolvedOptions())
        : undefined);
    const getScriptSetupRanges = (0, alien_signals_1.computed)(() => ir.scriptSetup && validLangs.has(ir.scriptSetup.lang)
        ? (0, scriptSetupRanges_1.parseScriptSetupRanges)(ts, ir.scriptSetup.ast, getResolvedOptions())
        : undefined);
    const getBindingFlags = (0, alien_signals_1.computed)(() => {
        const flags = new Map(getScriptSetupRanges()?.bindings);
        const scriptRanges = getScriptRanges();
        if (ir.scriptSetup && scriptRanges) {
            for (const [name, flag] of scriptRanges.bindings) {
                if (!flags.has(name)) {
                    flags.set(name, flag);
                }
            }
        }
        return flags;
    });
    const getImportedComponents = (0, signals_1.computedSet)(() => {
        const names = new Set();
        for (const [name, flags] of getBindingFlags()) {
            if (flags & 4 /* BindingFlag.Component */) {
                names.add(name);
            }
        }
        return names;
    });
    const getSetupBindings = (0, signals_1.computedSet)(() => new Set(getBindingFlags().keys()));
    const getScriptSetupBindings = (0, signals_1.computedSet)(() => new Set(getScriptSetupRanges()?.bindings.keys()));
    const getSetupConsts = (0, signals_1.computedSet)(() => {
        const names = new Set();
        for (const [name, flags] of getBindingFlags()) {
            if (flags & 2 /* BindingFlag.Const */) {
                names.add(name);
            }
        }
        const { defineProps } = getScriptSetupRanges() ?? {};
        if (defineProps?.destructured) {
            for (const name of defineProps.destructured.keys()) {
                names.add(name);
            }
            if (defineProps.destructuredRest) {
                names.add(defineProps.destructuredRest);
            }
        }
        return names;
    });
    const getSetupRefs = (0, signals_1.computedSet)(() => {
        return new Set(getScriptSetupRanges()?.useTemplateRef
            .map(({ name }) => name)
            .filter(name => name !== undefined));
    });
    const hasDefineSlots = (0, alien_signals_1.computed)(() => !!getScriptSetupRanges()?.defineSlots);
    const getSetupPropsAssignName = (0, alien_signals_1.computed)(() => getScriptSetupRanges()?.defineProps?.name);
    const getSetupSlotsAssignName = (0, alien_signals_1.computed)(() => getScriptSetupRanges()?.defineSlots?.name);
    const getInheritAttrs = (0, alien_signals_1.computed)(() => {
        const value = getScriptSetupRanges()?.defineOptions?.inheritAttrs
            ?? getScriptRanges()?.exportDefault?.options?.inheritAttrs;
        return value !== 'false';
    });
    const getComponentName = (0, alien_signals_1.computed)(() => {
        let name;
        const componentOptions = getScriptRanges()?.exportDefault?.options;
        if (ir.script && componentOptions?.name) {
            name = ir.script.content.slice(componentOptions.name.start + 1, componentOptions.name.end - 1);
        }
        else {
            const { defineOptions } = getScriptSetupRanges() ?? {};
            if (ir.scriptSetup && defineOptions?.name) {
                name = defineOptions.name;
            }
            else {
                const baseName = path.basename(fileName);
                name = baseName.slice(0, baseName.lastIndexOf('.'));
            }
        }
        return (0, shared_1.capitalize)((0, shared_1.camelize)(name));
    });
    const generateTemplatePass = (dotValueBindings) => {
        if (getResolvedOptions().skipTemplateCodegen || !ir.template) {
            return;
        }
        return (0, template_1.generateTemplate)({
            typescript: ts,
            vueCompilerOptions: getResolvedOptions(),
            template: ir.template,
            isVapor: getIsVapor(),
            scriptLang: computeLang(ir),
            componentName: getComponentName(),
            importedComponents: getImportedComponents(),
            setupRefs: getSetupRefs(),
            setupConsts: getSetupConsts(),
            setupBindings: getSetupBindings(),
            dotValueBindings,
            reassertBindings: new Set([...dotValueBindings].filter(name => (getBindingFlags().get(name) ?? 0) & 1 /* BindingFlag.Variable */)),
            hasDefineSlots: hasDefineSlots(),
            propsAssignName: getSetupPropsAssignName(),
            slotsAssignName: getSetupSlotsAssignName(),
            inheritAttrs: getInheritAttrs(),
        });
    };
    const generateStylePass = (dotValueBindings) => {
        if (!ir.styles.length) {
            return;
        }
        return (0, style_1.generateStyle)({
            typescript: ts,
            vueCompilerOptions: getResolvedOptions(),
            styles: ir.styles,
            scriptLang: computeLang(ir),
            setupRefs: getSetupRefs(),
            setupConsts: getSetupConsts(),
            setupBindings: getSetupBindings(),
            dotValueBindings,
        });
    };
    const getLocalComponents = (0, signals_1.computedSet)(() => {
        const bindings = getSetupBindings();
        if (!bindings.size) {
            return bindings;
        }
        return new Set(ir.template?.ast?.components
            .flatMap(name => [(0, shared_1.camelize)(name), (0, shared_1.capitalize)((0, shared_1.camelize)(name))])
            .filter(name => bindings.has(name)));
    });
    const getLocalDirectives = (0, signals_1.computedSet)(() => {
        const bindings = getSetupBindings();
        if (!bindings.size) {
            return bindings;
        }
        // `v[A-Z]` is a naming heuristic: without type analysis there is no
        // reliable signal to tell a directive from a same-named value binding.
        // This feeds the local-directive type / completion, where false positives
        // are harmless (they only surface as extra completion candidates).
        return new Set([...bindings].filter(name => /^v[A-Z]/.test(name)));
    });
    // First pass: collect bindings used in narrowing positions (output discarded);
    // the second pass (the computeds below) finalizes every access of these with `.value`.
    const getDotValueBindings = (0, signals_1.computedSet)(() => {
        const bindings = getSetupBindings();
        if (!bindings.size) {
            return bindings;
        }
        const names = [];
        for (const generated of [generateTemplatePass(new Set()), generateStylePass(new Set())]) {
            names.push(...generated?.dotValueAccesses ?? []);
        }
        return new Set(names);
    });
    const getGeneratedTemplate = (0, alien_signals_1.computed)(() => generateTemplatePass(getDotValueBindings()));
    const getGeneratedStyle = (0, alien_signals_1.computed)(() => generateStylePass(getDotValueBindings()));
    const getReferencedBindings = (0, signals_1.computedSet)(() => {
        const bindings = getSetupBindings();
        if (!bindings.size) {
            return bindings;
        }
        return new Set([
            ...getGeneratedTemplate()?.contextAccesses.keys() ?? [],
            ...getGeneratedStyle()?.contextAccesses.keys() ?? [],
        ].filter(name => bindings.has(name)));
    });
    const getUsedSetupBindings = (0, signals_1.computedSet)(() => {
        return new Set([
            ...getReferencedBindings(),
            ...getLocalComponents(),
        ]);
    });
    const getGeneratedScript = (0, alien_signals_1.computed)(() => {
        return (0, script_1.generateScript)({
            vueCompilerOptions: getResolvedOptions(),
            fileName,
            script: ir.script,
            scriptSetup: ir.scriptSetup,
            scriptLang: computeLang(ir),
            setupBindings: getScriptSetupBindings(),
            localComponents: getLocalComponents(),
            localDirectives: getLocalDirectives(),
            dotValueBindings: getDotValueBindings(),
            scriptRanges: getScriptRanges(),
            scriptSetupRanges: getScriptSetupRanges(),
            templateAndStyleTypes: new Set([
                ...getGeneratedTemplate()?.generatedTypes ?? [],
                ...getGeneratedStyle()?.generatedTypes ?? [],
            ]),
            templateAndStyleCodes: [
                ...getGeneratedStyle()?.codes ?? [],
                ...getGeneratedTemplate()?.codes ?? [],
            ],
        });
    });
    return {
        getScriptRanges,
        getScriptSetupRanges,
        getGeneratedScript,
        getGeneratedTemplate,
        getImportedComponents,
        getSetupBindings,
        getLocalComponents,
        getUsedSetupBindings,
    };
}
//# sourceMappingURL=vue-tsx.js.map