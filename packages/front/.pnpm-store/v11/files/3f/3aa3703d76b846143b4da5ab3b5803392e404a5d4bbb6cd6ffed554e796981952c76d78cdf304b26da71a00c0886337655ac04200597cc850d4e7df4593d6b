import { IconifyIconBuildResult } from "./build.js";
import { IconifyIcon } from "@iconify/types";
/**
 * Parsed SVG content
 */
export interface ParsedSVGContent {
  attribs: Record<string, string>;
  body: string;
}
/**
 * Extract attributes and content from SVG
 */
export declare function parseSVGContent(content: string): ParsedSVGContent | undefined;
/**
 * Convert parsed SVG to IconifyIconBuildResult
 */
export declare function buildParsedSVG(data: ParsedSVGContent): IconifyIconBuildResult | undefined;
/**
 * Convert parsed SVG to IconifyIcon
 */
export declare function convertParsedSVG(data: ParsedSVGContent): IconifyIcon | undefined;