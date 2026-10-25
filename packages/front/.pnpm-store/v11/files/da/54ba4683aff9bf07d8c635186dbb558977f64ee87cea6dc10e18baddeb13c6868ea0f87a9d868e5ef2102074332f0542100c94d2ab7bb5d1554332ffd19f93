import { Awaitable, CustomHMRIconLoader, CustomIconLoader } from "./types.js";
/**
 * @returns A {@link CustomIconLoader} for loading icons from a directory.
 */
export declare function FileSystemIconLoader(dir: string, transform?: (svg: string) => Awaitable<string>): CustomIconLoader;
/**
 * Creates a {@link CustomHMRIconLoader} collection from a directory with HMR support.
 *
 * @example
 * ```ts
 * customCollections: {
 *   ...FileSystemHMRIconLoader('./src/icons', 'custom-icons')
 * }
 * ```
 *
 * @param dir The directory relative to the root.
 * @param collectionName The collection name.
 * @param transform The SVG transformer.
 */
export declare function FileSystemHMRIconLoader(dir: string, collectionName: string, transform?: (svg: string) => Awaitable<string>): Record<string, CustomHMRIconLoader>;