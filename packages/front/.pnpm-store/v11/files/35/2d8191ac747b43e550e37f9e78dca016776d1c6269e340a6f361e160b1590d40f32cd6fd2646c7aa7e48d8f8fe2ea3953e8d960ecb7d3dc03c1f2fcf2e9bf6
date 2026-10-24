import * as CompilerDOM from '@vue/compiler-dom';
import type { Code, VueCodeInformation } from '../../types';
import type { InlayHintInfo } from '../inlayHints';
export type TemplateCodegenContext = ReturnType<typeof createTemplateCodegenContext>;
export declare function createTemplateCodegenContext(): {
    getCommentInfo: () => {
        ignoreError?: boolean;
        expectError?: {
            token: number;
            node: CompilerDOM.CommentNode;
        };
        generic?: {
            content: string;
            offset: number;
        };
    };
    enter: (node: CompilerDOM.RootNode | CompilerDOM.TemplateChildNode | CompilerDOM.SimpleExpressionNode) => boolean;
    exit: () => Generator<Code>;
    resolveCodeFeatures: (features: VueCodeInformation) => VueCodeInformation;
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
    inlayHints: InlayHintInfo[];
    generatedTypes: Set<string>;
    inheritedAttrVars: Set<string>;
    singleRootElTypes: Set<string>;
    singleRootNodes: Set<CompilerDOM.ElementNode | null>;
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
};
