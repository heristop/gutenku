import type { ScriptSetupRanges } from '../../parsers/scriptSetupRanges';
import type { Code, IRScriptSetup } from '../../types';
import type { ScriptCodegenContext } from './context';
import type { ScriptCodegenOptions } from './index';
export declare function generateScriptSetupImports(scriptSetup: IRScriptSetup, scriptSetupRanges: ScriptSetupRanges): Generator<Code>;
export declare function generateGeneric(options: ScriptCodegenOptions, ctx: ScriptCodegenContext, scriptSetup: IRScriptSetup, scriptSetupRanges: ScriptSetupRanges, generic: NonNullable<IRScriptSetup['generic']>, body: Iterable<Code>): Generator<Code>;
export declare function generateSetupFunction(options: ScriptCodegenOptions, ctx: ScriptCodegenContext, scriptSetup: IRScriptSetup, scriptSetupRanges: ScriptSetupRanges, body: Iterable<Code>, output?: Iterable<Code>): Generator<Code>;
export declare function generateMacros(options: ScriptCodegenOptions): Generator<Code>;
