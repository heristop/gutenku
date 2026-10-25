import type * as ts from 'typescript';
import type { TextRange } from '../types';
export declare const enum BindingFlag {
    None = 0,
    Variable = 1,
    Const = 2,
    Component = 4
}
export declare function parseBindings(ts: typeof import('typescript'), ast: ts.SourceFile, componentExtsensions: string[]): Map<string, BindingFlag>;
export declare function getClosestMultiLineCommentRange(ts: typeof import('typescript'), node: ts.Node, parents: ts.Node[], ast: ts.SourceFile): TextRange | undefined;
export declare function getUnwrappedExpression(ts: typeof import('typescript'), node: ts.Node): ts.Node;
