import type { VirtualCode } from '@volar/language-core';
import type { Code, IR, VueLanguagePluginReturn } from '../types';
export declare class VueEmbeddedCode {
    id: string;
    lang: string;
    content: Code[];
    parentCodeId?: string;
    embeddedCodes: VueEmbeddedCode[];
    constructor(id: string, lang: string, content: Code[]);
}
export declare function useEmbeddedCodes(plugins: VueLanguagePluginReturn[], fileName: string, ir: IR): () => VirtualCode[];
