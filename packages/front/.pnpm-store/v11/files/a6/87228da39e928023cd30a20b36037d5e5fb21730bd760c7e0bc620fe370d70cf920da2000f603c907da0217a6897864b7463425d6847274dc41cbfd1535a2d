import { Alias, FileExtensions, IConfig, IOutput, IProjectConfig, PathLike, ReplaceTscAliasPathsOptions } from '../interfaces';
import { TrieNode } from '../utils';
export interface ICreateProjectConfigParams {
    configFile: string;
    baseUrl: string;
    outDir: string;
    options: ReplaceTscAliasPathsOptions;
    fileExtensions?: Partial<FileExtensions>;
}
export interface ICreateFinalConfigParams {
    projectConfig: IProjectConfig;
    output: IOutput;
    paths?: PathLike;
    aliasTrie?: TrieNode<Alias>;
}
export declare function resolveConfigFilePath(configFile?: string): string;
export declare function createProjectConfig(params: ICreateProjectConfigParams): IProjectConfig;
export declare function createFinalConfig(params: ICreateFinalConfigParams): IConfig;
