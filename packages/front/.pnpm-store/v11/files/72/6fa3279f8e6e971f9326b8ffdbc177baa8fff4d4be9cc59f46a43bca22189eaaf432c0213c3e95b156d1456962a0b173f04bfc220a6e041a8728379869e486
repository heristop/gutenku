import type * as ts from 'typescript';
import type { TextRange, VueCompilerOptions } from '../types';
export interface ScriptRanges extends ReturnType<typeof parseScriptRanges> {
}
export declare function parseScriptRanges(ts: typeof import('typescript'), sourceFile: ts.SourceFile, vueCompilerOptions: VueCompilerOptions): {
    bindings: Map<string, import("./utils").BindingFlag>;
    exportDefault: (TextRange<ts.Node> & {
        expression: TextRange<ts.Expression>;
        isObjectLiteral: boolean;
        options?: {
            isObjectLiteral: boolean;
            expression: TextRange;
            args: TextRange<ts.ObjectLiteralExpression>;
            components: TextRange<ts.ObjectLiteralExpression> | undefined;
            directives: TextRange | undefined;
            name: TextRange<ts.StringLiteral> | undefined;
            inheritAttrs: string | undefined;
        };
    }) | undefined;
};
export declare function parseOptionsFromExtression(ts: typeof import('typescript'), exp: ts.Node, sourceFile: ts.SourceFile): {
    isObjectLiteral: boolean;
    expression: TextRange<ts.Node>;
    args: TextRange<ts.ObjectLiteralExpression>;
    argsNode: ts.ObjectLiteralExpression;
    components: TextRange<ts.ObjectLiteralExpression> | undefined;
    componentsNode: ts.ObjectLiteralExpression | undefined;
    directives: TextRange<ts.ObjectLiteralExpression> | undefined;
    name: TextRange<ts.StringLiteral> | undefined;
    nameNode: ts.StringLiteral | undefined;
    inheritAttrs: string | undefined;
} | undefined;
