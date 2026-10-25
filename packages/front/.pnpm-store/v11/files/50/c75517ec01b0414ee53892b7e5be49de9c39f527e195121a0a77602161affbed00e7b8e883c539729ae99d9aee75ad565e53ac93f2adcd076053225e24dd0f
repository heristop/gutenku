import { FileExtensions, IOutput, ReplaceTscAliasPathsOptions } from '../interfaces';
export interface IApplyConfigOverridesParams {
    options: ReplaceTscAliasPathsOptions;
    output: IOutput;
    fileExtensions?: Partial<FileExtensions>;
    resolveFullPaths?: boolean;
    verbose?: boolean;
}
export interface IResolveEffectiveOutDirParams {
    options: ReplaceTscAliasPathsOptions;
    outDir?: string;
    declarationDir?: string;
    output: IOutput;
}
export declare function applyConfigOverrides(params: IApplyConfigOverridesParams): void;
export declare function resolveEffectiveOutDir(params: IResolveEffectiveOutDirParams): string;
