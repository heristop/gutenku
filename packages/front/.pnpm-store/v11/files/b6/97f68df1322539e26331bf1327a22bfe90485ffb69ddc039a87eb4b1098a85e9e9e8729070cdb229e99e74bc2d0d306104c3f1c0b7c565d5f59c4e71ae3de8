import { AsyncLocalStorage } from "node:async_hooks";
//#region src/index.d.ts
export declare const isSupported: boolean;
export interface Options {
  skipNodeModules?: boolean;
}
export declare const depsStore: AsyncLocalStorage<Set<string>>;
export declare function init({ skipNodeModules }?: Options): () => void;
export declare function unregister(): void;
export declare function clearRequireCache(): void;
//#endregion