import type * as ts from 'typescript';
import type { TemplateCodegenContext } from './context';
export interface DeclarationItem {
    id: ts.Identifier;
    isShorthand: boolean;
    isNarrowing: boolean;
    skipped: boolean;
    inTypeQuery: boolean;
    isNewOperand: boolean;
}
export declare function forEachDeclarations(ts: typeof import('typescript'), node: ts.Node, ast: ts.SourceFile, ctx: TemplateCodegenContext, scope: ReturnType<TemplateCodegenContext['scope']>, inNarrowing: boolean): Generator<DeclarationItem>;
export declare function shouldIdentifierSkipped(ctx: TemplateCodegenContext, text: string): boolean;
