export declare class PathCache {
    configFile?: string;
    useCache: boolean;
    existsCache?: Map<string, boolean>;
    absoluteCache?: Map<string, string>;
    fileExtensions: string[];
    constructor(useCache: boolean, fileExtensions?: string[], configFile?: string);
    existsResolvedAlias(path: string): boolean;
    getAbsoluteAliasPath(basePath: string, aliasPath: string): string;
    private getAAP;
    private exists;
}
