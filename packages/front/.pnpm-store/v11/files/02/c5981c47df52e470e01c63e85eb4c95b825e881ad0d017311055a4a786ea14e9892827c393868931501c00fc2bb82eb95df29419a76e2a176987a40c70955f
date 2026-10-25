import { CSSUnformattedItem, IconCSSIconSetOptions, IconContentIconSetOptions } from "./types.js";
import { IconifyJSON } from "@iconify/types";
interface CSSData {
  common?: CSSUnformattedItem;
  css: CSSUnformattedItem[];
  errors: string[];
}
/**
 * Get data for getIconsCSS()
 */
export declare function getIconsCSSData(iconSet: IconifyJSON, names: string[], options?: IconCSSIconSetOptions): CSSData;
/**
 * Get CSS for icons as background/mask
 */
export declare function getIconsCSS(iconSet: IconifyJSON, names: string[], options?: IconCSSIconSetOptions): string;
/**
 * Get CSS for icons as content
 */
export declare function getIconsContentCSS(iconSet: IconifyJSON, names: string[], options: IconContentIconSetOptions): string;