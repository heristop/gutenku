import type { ScriptRanges } from '../../parsers/scriptRanges';
import type { ScriptSetupRanges } from '../../parsers/scriptSetupRanges';
import type { Code, IRScript, IRScriptSetup, VueCompilerOptions } from '../../types';
export interface ScriptCodegenOptions {
    vueCompilerOptions: VueCompilerOptions;
    script: IRScript | undefined;
    scriptSetup: IRScriptSetup | undefined;
    fileName: string;
    scriptLang: string;
    scriptRanges: ScriptRanges | undefined;
    scriptSetupRanges: ScriptSetupRanges | undefined;
    templateAndStyleTypes: Set<string>;
    templateAndStyleCodes: Code[];
    setupBindings: Set<string>;
    localComponents: Set<string>;
    localDirectives: Set<string>;
    dotValueBindings: Set<string>;
}
export { generate as generateScript };
declare function generate(options: ScriptCodegenOptions): {
    generatedTypes: Set<string>;
    localTypes: {
        generate: () => Generator<string, void, unknown>;
        readonly PrettifyLocal: string;
        readonly WithDefaults: string;
        readonly WithSlots: string;
        readonly PropsChildren: string;
        readonly TypePropsToOption: string;
        readonly OmitIndexSignature: string;
    };
    inlayHints: import("../inlayHints").InlayHintInfo[];
    codes: Code[];
};
