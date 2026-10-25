import { ParsedCommandLine, Program } from "typescript";
//#region src/tsc/context.d.ts
interface ParsedProject {
  tsconfigPath: string;
  parsedConfig: ParsedCommandLine;
}
type SourceFileToProjectMap = Map<string, ParsedProject>;
interface TscContext {
  programs: Program[];
  files: Map<string, string>;
  projects: Map<string, SourceFileToProjectMap>;
}
/** Creates an empty, isolated TypeScript compiler context. */
declare function createContext(): TscContext;
/**
 * Removes a file and any dependent compiler state from a context.
 *
 * @param context - Context to invalidate.
 * @param file - File path to remove. Relative paths resolve from the process
 * working directory.
 */
declare function invalidateContextFile(context: TscContext, file: string): void;
/** Shared compiler context used when no explicit context is provided. */
declare const globalContext: TscContext;
//#endregion
export { globalContext as a, createContext as i, SourceFileToProjectMap as n, invalidateContextFile as o, TscContext as r, ParsedProject as t };