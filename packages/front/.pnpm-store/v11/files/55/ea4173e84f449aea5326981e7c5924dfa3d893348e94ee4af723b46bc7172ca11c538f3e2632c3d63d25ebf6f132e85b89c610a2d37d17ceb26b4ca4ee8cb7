/**
 * Icon mode
 */
export type IconCSSMode = 'mask' | 'background';
/**
 * Selector for icon
 */
export interface IconCSSIconSelectorOptions {
  pseudoSelector?: boolean;
  iconSelector?: string;
}
/**
 * Selector for icon when generating data from icon set
 */
export interface IconCSSSelectorOptions extends IconCSSIconSelectorOptions {
  commonSelector?: string;
  overrideSelector?: string;
}
/**
 * Options common for both multiple icons and single icon
 */
export interface IconCSSSharedOptions {
  varName?: string | null;
  forceSquare?: boolean;
  color?: string;
  rules?: Record<string, string>;
}
/**
 * Mode
 */
export interface IconCSSModeOptions {
  mode?: IconCSSMode;
}
/**
 * Options for generating common code
 *
 * Requires mode
 */
export interface IconCSSCommonCodeOptions extends IconCSSSharedOptions, IconCSSIconSelectorOptions, Required<IconCSSModeOptions> {}
/**
 * Options for generating data for one icon
 */
export interface IconCSSItemOptions extends IconCSSSharedOptions, Required<IconCSSModeOptions> {}
/**
 * Selector for icon
 */
export interface IconContentIconSelectorOptions {
  iconSelector?: string;
}
/**
 * Options common for both multiple icons and single icon
 */
export interface IconContentSharedOptions {
  height: number;
  width?: number;
  color?: string;
  rules?: Record<string, string>;
}
/**
 * Options for generating data for one icon
 */
export type IconContentItemOptions = IconContentSharedOptions;
/**
 * Formatting modes. Same as in SASS
 */
export type CSSFormatMode = 'expanded' | 'compact' | 'compressed';
/**
 * Item to format
 */
export interface CSSUnformattedItem {
  selector: string | string[];
  rules: Record<string, string>;
}
/**
 * Formatting options
 */
export interface IconCSSFormatOptions {
  format?: CSSFormatMode;
}
/**
 * Options for generating data for one icon as background/mask
 */
export interface IconCSSIconOptions extends IconCSSSharedOptions, IconCSSIconSelectorOptions, IconCSSModeOptions, IconCSSFormatOptions {
  customise?: (content: string) => string;
}
/**
 * Options for generating data for one icon as content
 */
export interface IconContentIconOptions extends IconContentSharedOptions, IconContentIconSelectorOptions, IconCSSFormatOptions {
  customise?: (content: string) => string;
}
/**
 * Options for generating multiple icons as background/mask
 */
export interface IconCSSIconSetOptions extends IconCSSSharedOptions, IconCSSSelectorOptions, IconCSSModeOptions, IconCSSFormatOptions {
  customise?: (content: string, name: string) => string;
}
/**
 * Options for generating multiple icons as content
 */
export interface IconContentIconSetOptions extends IconContentSharedOptions, IconContentIconSelectorOptions, IconCSSFormatOptions {
  customise?: (content: string, name: string) => string;
}