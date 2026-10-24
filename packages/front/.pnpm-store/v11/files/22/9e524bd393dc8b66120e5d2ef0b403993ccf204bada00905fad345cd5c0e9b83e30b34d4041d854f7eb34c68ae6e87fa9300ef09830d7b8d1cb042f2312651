import { IconifyIconCustomisations } from "../customisations/defaults.js";
import { IconifyIcon } from "../icon/defaults.js";
import { SVGViewBox } from "./viewbox.js";
/**
 * Interface for getSVGData() result
 */
export interface IconifyIconBuildResult {
  attributes: {
    width?: string;
    height?: string;
    viewBox: string;
  };
  viewBox: SVGViewBox;
  body: string;
}
/**
 * Check if value should be unset. Allows multiple keywords
 */
export declare const isUnsetKeyword: (value: unknown) => value is "none" | "undefined" | "unset";
/**
 * Get SVG attributes and content from icon + customisations
 *
 * Does not generate style to make it compatible with frameworks that use objects for style, such as React.
 * Instead, it generates 'inline' value. If true, rendering engine should add verticalAlign: -0.125em to icon.
 *
 * Customisations should be normalised by platform specific parser.
 * Result should be converted to <svg> by platform specific parser.
 * Use replaceIDs to generate unique IDs for body.
 */
export declare function iconToSVG(icon: IconifyIcon, customisations?: IconifyIconCustomisations): IconifyIconBuildResult;