import { PathLike } from '../interfaces';
export interface IResolveRelativePathsParams {
    paths: PathLike;
    configDir: string;
    rootDir: string;
}
export declare function replaceConfigDirPlaceholder(path: string, configDir: string): string;
export declare function resolveDirectoryPath(dir: string, configDir: string, baseConfigDir: string | null): string;
export declare function applyBaseConfigDirToPaths(paths: PathLike, baseConfigDir: string): PathLike;
export declare function resolvePathsWithoutBaseUrl(params: IResolveRelativePathsParams): PathLike;
