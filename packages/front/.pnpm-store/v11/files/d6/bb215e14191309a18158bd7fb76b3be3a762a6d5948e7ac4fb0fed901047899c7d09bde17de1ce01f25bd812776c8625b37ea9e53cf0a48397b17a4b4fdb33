import type { Code, IRBlock, VueCodeInformation, VueCompilerOptions } from '../../types';
import type { TemplateCodegenContext } from './context';
export declare function generateInterpolation(options: IdentifierOptions & {
    typescript: typeof import('typescript');
}, ctx: TemplateCodegenContext, block: IRBlock, features: VueCodeInformation, code: string, start: number, prefix?: string, suffix?: string, inNarrowing?: boolean): Generator<Code>;
interface IdentifierOptions {
    setupRefs: Set<string>;
    setupConsts: Set<string>;
    setupBindings: Set<string>;
    dotValueBindings: Set<string>;
    vueCompilerOptions: VueCompilerOptions;
    scriptLang: string;
}
export declare function generateIdentifier(options: IdentifierOptions, ctx: TemplateCodegenContext, codes: Iterable<Code>, name: string, source: string, start: number, end: number, isNarrowing?: boolean, inTypeQuery?: boolean, isNewOperand?: boolean): Generator<Code>;
export {};
