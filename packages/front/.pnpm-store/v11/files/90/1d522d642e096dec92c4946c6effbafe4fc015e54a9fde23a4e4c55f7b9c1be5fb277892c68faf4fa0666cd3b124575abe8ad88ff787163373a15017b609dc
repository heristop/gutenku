export interface IProjectReferenceInfo {
    rootDir: string;
    outDir: string;
}
interface IResolvedProjectReferenceInfo extends IProjectReferenceInfo {
    configFile: string;
}
interface IProjectReferenceLoadResult {
    hasReferences: boolean;
    references: IResolvedProjectReferenceInfo[];
    missing: string[];
}
export interface IFindMatchingRefParams {
    configFile?: string;
    sourcePath: string;
}
export interface IResolveRefTargetParams {
    reference: IProjectReferenceInfo;
    sourcePath: string;
    fileExtensions: string[];
}
export declare function resolveReferencePath(refPath: string, baseDir: string): string;
export declare function loadProjectReferenceDetails(configFile?: string): IProjectReferenceLoadResult;
export declare function loadProjectReferences(configFile?: string): IProjectReferenceInfo[];
export declare function findMatchingReference(params: IFindMatchingRefParams): IProjectReferenceInfo | null;
export declare function resolveReferenceTargetPath(params: IResolveRefTargetParams): string | null;
export {};
