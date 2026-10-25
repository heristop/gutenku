interface SnippetMark {
  name?: string | null;
  buffer: string;
  position: number;
  line: number;
  column: number;
  snippet?: string | null;
}
/**
 * A YAML error. Unlike an ordinary `Error`, it adds a source snippet showing
 * the location of the problem to the error message, when available.
 *
 * @category Main
 */
declare class YAMLException extends Error {
  reason: string;
  mark?: SnippetMark;
  /**
   * Optional `mark` contains source snippet data. Usually, use
   * {@link YAMLException.throwAt} instead of passing it directly.
   */
  constructor(reason: string, mark?: SnippetMark);
  /**
   * Returns the formatted error, omitting the source snippet in compact mode.
   */
  toString(compact?: boolean): string;
  /**
   * Builds a YAMLException with a source snippet and throws it. `source` is
   * the raw input text; `position` is an offset into it.
   */
  static throwAt(source: string, position: number, message: string, filename?: string): never;
}
export { YAMLException };