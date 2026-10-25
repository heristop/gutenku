"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalTypesGenerator = getLocalTypesGenerator;
const utils_1 = require("./utils");
function getLocalTypesGenerator(vueCompilerOptions, lang) {
    const used = new Set();
    const isTs = (0, utils_1.isTsLang)(lang);
    const WithDefaults = defineHelper(`__VLS_WithDefaults`, () => isTs
        ? `
type __VLS_WithDefaults<P, D> = {
	[K in keyof P & string]: K extends keyof D
		? ${PrettifyLocal.name}<P[K] & { default: D[K] }>
		: P[K]
};
`.trimStart()
        : jsTypedef(`P, D`, `__VLS_WithDefaults`, `{ [K in keyof Pick<P, keyof P>]: K extends keyof D ? ${PrettifyLocal.name}<P[K] & { default: D[K] }> : P[K] }`));
    const PrettifyLocal = defineHelper(`__VLS_PrettifyLocal`, () => isTs
        ? `type __VLS_PrettifyLocal<T> = (T extends any ? { [K in keyof T]: T[K]; } : { [K in keyof T as K]: T[K]; }) & {}${utils_1.endOfLine}`
        : jsTypedef(`T`, `__VLS_PrettifyLocal`, `(T extends any ? { [K in keyof T]: T[K]; } : { [K in keyof T as K]: T[K]; }) & {}`));
    const WithSlots = defineHelper(`__VLS_WithSlots`, () => isTs
        ? `
type __VLS_WithSlots<T, S> = T & {
	new(): {
		$slots: S;
	}
};
`.trimStart()
        : jsTypedef(`T, S`, `__VLS_WithSlots`, `T & { new(): { $slots: S; } }`));
    const PropsChildren = defineHelper(`__VLS_PropsChildren`, () => isTs
        ? `
type __VLS_PropsChildren<S> = {
	[K in keyof (
		boolean extends (
			// @ts-ignore
			JSX.ElementChildrenAttribute extends never
				? true
				: false
		)
			? never
			// @ts-ignore
			: JSX.ElementChildrenAttribute
	)]?: S;
};
`.trimStart()
        // The single-line form lets the preceding @ts-ignore cover the whole typedef,
        // mirroring the inline @ts-ignore guards of the TS form.
        : `// @ts-ignore${utils_1.newLine}/** @template S @typedef {{ [K in keyof (boolean extends (JSX.ElementChildrenAttribute extends never ? true : false) ? never : JSX.ElementChildrenAttribute)]?: S; }} __VLS_PropsChildren */${utils_1.newLine}`);
    const TypePropsToOption = defineHelper(`__VLS_TypePropsToOption`, () => isTs
        ? `
type __VLS_TypePropsToOption<T> = {
	[K in keyof T & string]-?: {} extends Pick<T, K>
		? { type: import('${vueCompilerOptions.lib}').PropType<Required<T>[K]> }
		: { type: import('${vueCompilerOptions.lib}').PropType<T[K]>, required: true }
};
`.trimStart()
        : jsTypedef(`T`, `__VLS_TypePropsToOption`, `{ [K in keyof T]-?: {} extends Pick<T, K> ? { type: import('${vueCompilerOptions.lib}').PropType<Required<T>[K]> } : { type: import('${vueCompilerOptions.lib}').PropType<T[K]>, required: true } }`));
    const OmitIndexSignature = defineHelper(`__VLS_OmitIndexSignature`, () => isTs
        ? `type __VLS_OmitIndexSignature<T> = { [K in keyof T as {} extends Record<K, unknown> ? never : K]: T[K]; }${utils_1.endOfLine}`
        : jsTypedef(`T`, `__VLS_OmitIndexSignature`, `{ [K in keyof T as {} extends Record<K, unknown> ? never : K]: T[K] }`));
    const helpers = {
        [PrettifyLocal.name]: PrettifyLocal,
        [WithDefaults.name]: WithDefaults,
        [WithSlots.name]: WithSlots,
        [PropsChildren.name]: PropsChildren,
        [TypePropsToOption.name]: TypePropsToOption,
        [OmitIndexSignature.name]: OmitIndexSignature,
    };
    used.clear();
    return {
        generate,
        get PrettifyLocal() {
            return PrettifyLocal.name;
        },
        get WithDefaults() {
            return WithDefaults.name;
        },
        get WithSlots() {
            return WithSlots.name;
        },
        get PropsChildren() {
            return PropsChildren.name;
        },
        get TypePropsToOption() {
            return TypePropsToOption.name;
        },
        get OmitIndexSignature() {
            return OmitIndexSignature.name;
        },
    };
    function* generate() {
        for (const name of used) {
            yield helpers[name].generate();
        }
        used.clear();
    }
    function jsTypedef(params, name, body) {
        return `/**${utils_1.newLine} * @template ${params}${utils_1.newLine} * @typedef {${body}} ${name}${utils_1.newLine} */${utils_1.newLine}`;
    }
    function defineHelper(name, generate) {
        return {
            get name() {
                used.add(name);
                return name;
            },
            generate,
        };
    }
}
//# sourceMappingURL=localTypes.js.map