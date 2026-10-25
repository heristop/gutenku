import { StringReplacer } from '../interfaces';
import { newImportStatementRegex, newStringRegex } from './import-regex';
declare class ImportPathResolver {
    source: string;
    readonly sourcePath: string;
    constructor(source: string, sourcePath: string);
    get sourceDir(): string;
    replaceSourceImportPaths(replacer: StringReplacer): this;
    resolveFullImportPaths(ext?: string): this;
    private resolveFullPath;
    static newStringRegex: typeof newStringRegex;
    static newImportStatementRegex: typeof newImportStatementRegex;
    static resolveFullImportPaths(code: string, path: string, ext?: string): string;
    static replaceSourceImportPaths(code: string, path: string, replacer: StringReplacer): string;
}
export { newImportStatementRegex, newStringRegex };
export declare const resolveFullImportPaths: typeof ImportPathResolver.resolveFullImportPaths;
export declare const replaceSourceImportPaths: typeof ImportPathResolver.replaceSourceImportPaths;
