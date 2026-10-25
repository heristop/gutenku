import { FormatOptions } from "./_chunks/_format.mjs";
/**
 * Converts a [JSON](https://www.json.org/json-en.html) string into an object.
 *
 * Indentation status is auto-detected and preserved when stringifying back using `stringifyJSON`
 */
export declare function parseJSON<T = unknown>(text: string, options?: JSONParseOptions): T;
/**
 * Converts a JavaScript value to a [JSON](https://www.json.org/json-en.html) string.
 *
 * Indentation status is auto detected and preserved when using value from parseJSON.
 */
export declare function stringifyJSON(value: any, options?: JSONStringifyOptions): string;
export interface JSONParseOptions extends FormatOptions {
  /**
   * A function that transforms the results. This function is called for each member of the object.
   */
  reviver?: (this: any, key: string, value: any) => any;
}
export interface JSONStringifyOptions extends FormatOptions {
  /**
   * A function that transforms the results. This function is called for each member of the object.
   */
  replacer?: (this: any, key: string, value: any) => any;
}