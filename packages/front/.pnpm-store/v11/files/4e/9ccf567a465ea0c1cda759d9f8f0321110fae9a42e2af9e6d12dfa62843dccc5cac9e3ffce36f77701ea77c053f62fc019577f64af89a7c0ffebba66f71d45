//#region src/index.d.ts
interface ParsedTrace {
  column?: number;
  function?: string;
  line?: number;
  source: string;
}
declare function captureRawStackTrace(): string | undefined;
declare function captureStackTrace(): ParsedTrace[];
declare function parseRawStackTrace(stacktrace: string): ParsedTrace[];
//#endregion
export { ParsedTrace, captureRawStackTrace, captureStackTrace, parseRawStackTrace };