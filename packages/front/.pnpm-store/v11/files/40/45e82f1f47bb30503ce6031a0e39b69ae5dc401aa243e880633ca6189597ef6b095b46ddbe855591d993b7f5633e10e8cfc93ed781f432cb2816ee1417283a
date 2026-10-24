import * as CompilerDOM from '@vue/compiler-dom';
import type { Code } from '../../types';
import type { TemplateCodegenContext } from './context';
import type { TemplateCodegenOptions } from './index';
export interface FailedPropExpressions {
    node: CompilerDOM.SimpleExpressionNode;
    prefix: string;
    suffix: string;
}
export declare function generateElementProps(options: TemplateCodegenOptions, ctx: TemplateCodegenContext, node: CompilerDOM.ElementNode, props: CompilerDOM.ElementNode['props'], checkUnknownProps: boolean, failedPropExps?: FailedPropExpressions[]): Generator<Code>;
export declare function generatePropExp(options: TemplateCodegenOptions, ctx: TemplateCodegenContext, prop: CompilerDOM.DirectiveNode, exp: CompilerDOM.SimpleExpressionNode | undefined): Generator<Code>;
