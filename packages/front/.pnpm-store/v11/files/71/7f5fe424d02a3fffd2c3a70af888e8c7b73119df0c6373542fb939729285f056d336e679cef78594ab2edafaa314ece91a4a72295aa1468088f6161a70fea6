/**
 * Icon name
 */
export interface IconifyIconName {
  readonly provider: string;
  readonly prefix: string;
  readonly name: string;
}
/**
 * Icon source: icon object without name
 */
export type IconifyIconSource = Omit<IconifyIconName, 'name'>;
/**
 * Expression to test part of icon name.
 *
 * Used when loading icons from Iconify API due to project naming convension.
 * Ignored when using custom icon sets - convension does not apply.
 */
export declare const matchIconName: RegExp;
/**
 * Convert string icon name to IconifyIconName object.
 */
export declare const stringToIcon: (value: string, validate?: boolean, allowSimpleName?: boolean, provider?: string) => IconifyIconName | null;
/**
 * Check if icon is valid.
 *
 * This function is not part of stringToIcon because validation is not needed for most code.
 */
export declare const validateIconName: (icon: IconifyIconName | null, allowSimpleName?: boolean) => boolean;