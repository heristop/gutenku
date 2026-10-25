import { CustomCollectionIconLoader, CustomHMRIconLoader } from "./types.js";
export declare function normalizePath(path: string): string;
export declare function isCustomHMRIconLoader(loader: CustomCollectionIconLoader): loader is CustomHMRIconLoader;
export type FindModulesFn<T> = (id: string) => T | undefined;
export type CollectIconModulesFn<T> = (collection: string, icon: string, findModules: FindModulesFn<T>) => T[] | undefined;
export interface HMRSupport<T> {
  hmrCustomIconResolvers: CustomHMRIconLoader[];
  handleHotUpdate: (svgFilePath: string, findModules: FindModulesFn<T>) => T[] | undefined;
  resolveSVGIconPath: (collectionName: string, iconName: string) => string | undefined;
}
export declare function collectCustomHMRIconResolvers(customCollections?: Record<string, CustomCollectionIconLoader>): Map<string, CustomHMRIconLoader>;
export declare function createHMRHelper<T>(collectIconModules: CollectIconModulesFn<T>, customCollections?: Record<string, CustomCollectionIconLoader>): HMRSupport<T>;