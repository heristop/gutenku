import { ExtendedIconifyIcon, IconifyJSON } from "@iconify/types";
/**
 * Callback to call for each icon.
 *
 * If data === null, icon is missing.
 */
export type SplitIconSetCallback = (name: string, data: ExtendedIconifyIcon | null) => unknown;
export type SplitIconSetAsyncCallback = (name: string, data: ExtendedIconifyIcon | null) => Promise<unknown>;
/**
 * Extract icons from an icon set
 *
 * Returns list of icons that were found in icon set
 */
export declare function parseIconSet(data: IconifyJSON, callback: SplitIconSetCallback): string[];
/**
 * Async version of parseIconSet()
 */
export declare function parseIconSetAsync(data: IconifyJSON, callback: SplitIconSetAsyncCallback): Promise<string[]>;