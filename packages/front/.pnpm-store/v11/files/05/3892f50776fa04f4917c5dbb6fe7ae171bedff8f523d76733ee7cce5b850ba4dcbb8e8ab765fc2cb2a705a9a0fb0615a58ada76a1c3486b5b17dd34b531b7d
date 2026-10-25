import type { Code, IRStyle, VueCompilerOptions } from '../../types';
export interface StyleCodegenOptions {
    typescript: typeof import('typescript');
    vueCompilerOptions: VueCompilerOptions;
    styles: readonly IRStyle[];
    scriptLang: string;
    setupRefs: Set<string>;
    setupConsts: Set<string>;
    setupBindings: Set<string>;
    dotValueBindings: Set<string>;
}
export { generate as generateStyle };
declare function generate(options: StyleCodegenOptions): {
    getCommentInfo: () => {
        ignoreError?: boolean;
        expectError?: {
            token: number;
            node: import("@vue/compiler-dom").CommentNode;
        };
        generic?: {
            content: string;
            offset: number;
        };
    };
    enter: (node: import("@vue/compiler-dom").RootNode | import("@vue/compiler-dom").TemplateChildNode | import("@vue/compiler-dom").SimpleExpressionNode) => boolean;
    exit: () => Generator<Code>;
    resolveCodeFeatures: (features: import("../../types").VueCodeInformation) => import("../../types").VueCodeInformation;
    getInternalVariable: () => string;
    scopes: {
        has(value: string): boolean;
        readonly size: number;
        declare(...variables: string[]): void;
        end(): Generator<Code, any, any>;
        add(value: string): /*elided*/ any;
        clear(): void;
        delete(value: string): boolean;
        forEach(callbackfn: (value: string, value2: string, set: Set<string>) => void, thisArg?: any): void;
        [Symbol.iterator](): SetIterator<string>;
        entries(): SetIterator<[string, string]>;
        keys(): SetIterator<string>;
        values(): SetIterator<string>;
        readonly [Symbol.toStringTag]: string;
    }[];
    scope: () => {
        has(value: string): boolean;
        readonly size: number;
        declare(...variables: string[]): void;
        end(): Generator<Code, any, any>;
        add(value: string): any;
        clear(): void;
        delete(value: string): boolean;
        forEach(callbackfn: (value: string, value2: string, set: Set<string>) => void, thisArg?: any): void;
        [Symbol.iterator](): SetIterator<string>;
        entries(): SetIterator<[string, string]>;
        keys(): SetIterator<string>;
        values(): SetIterator<string>;
        readonly [Symbol.toStringTag]: string;
    };
    contextAccesses: Map<string, Map<string, Set<number>>>;
    dotValueAccesses: Set<string>;
    accessLog: string[];
    accessVariable: (source: string, name: string, offset?: number, dotValue?: boolean) => void;
    generateAutoImport: () => Generator<Code>;
    conditions: {
        text: string;
        accesses: string[];
    }[];
    generateConditionGuards: () => Generator<string, void, unknown>;
    hoistVars: Map<string, string>;
    getHoistVariable: (originalVar: string) => string;
    generateHoistVariables: () => Generator<string, void, unknown>;
    templateRefs: Map<string, {
        typeExp: string;
        offset: number;
    }[]>;
    addTemplateRef: (name: string, typeExp: string, offset: number) => void;
    components: (() => string)[];
    dollarVars: Set<string>;
    inlayHints: import("../inlayHints").InlayHintInfo[];
    generatedTypes: Set<string>;
    inheritedAttrVars: Set<string>;
    singleRootElTypes: Set<string>;
    singleRootNodes: Set<import("@vue/compiler-dom").ElementNode | null>;
    slots: {
        name: string;
        offset?: number;
        tagRange: [number, number];
        propsVar: string;
    }[];
    dynamicSlots: {
        expVar: string;
        propsVar: string;
    }[];
    inVFor: boolean;
    codes: Code[];
};
