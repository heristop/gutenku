import { Alias } from '../interfaces';
export interface IRewriteImportStatementParams {
    orig: string;
    alias: Alias;
    relativeAliasPath: string;
    requiredModule?: string;
}
export declare function formatRelativeAliasPath(file: string, absoluteAliasPath: string): string;
export declare function rewriteImportStatement(params: IRewriteImportStatementParams): string;
