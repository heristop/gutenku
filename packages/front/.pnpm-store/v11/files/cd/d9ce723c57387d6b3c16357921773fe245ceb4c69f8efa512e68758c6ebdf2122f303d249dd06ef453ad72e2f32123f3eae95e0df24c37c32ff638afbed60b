import * as CompilerDOM from '@vue/compiler-dom';
import type { Code, IRBlock } from '../../types';
import type { TemplateCodegenOptions } from './index';
export declare const references: WeakMap<IRBlock, [version: string, [className: string, offset: number][]]>;
export declare function generateStyleScopedClassReferences({ template, typescript: ts }: TemplateCodegenOptions, node: CompilerDOM.ElementNode): Generator<Code>;
export declare function generateStyleScopedClassReference(block: IRBlock, className: string, offset: number, fullStart?: number): Generator<Code>;
