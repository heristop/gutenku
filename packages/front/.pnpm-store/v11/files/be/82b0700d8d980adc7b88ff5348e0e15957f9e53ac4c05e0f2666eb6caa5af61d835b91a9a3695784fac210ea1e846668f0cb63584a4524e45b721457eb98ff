import { a as CompiledSheet, c as StructuralProgram, f as CompactPlan } from "./compiler-DCqAdgKg.mjs";
//#region src/plan-decode.d.ts
export declare function decodePlan(plan: CompactPlan): CompiledSheet;
//#endregion
//#region src/runtime.d.ts
export interface DocumentTokens {
  tags: Set<string>;
  classes: Set<string>;
  ids: Set<string>;
  attrs: Set<string>;
  /**
   * Codepoints of the document's rendered text, used to skip `@font-face`
   * rules whose `unicode-range` covers no character in the document. Absent
   * when the text could not be read exactly, which disables that check.
   */
  chars?: Set<number>;
  /** Exact results for structural programs evaluated during the scan */
  matchedPrograms?: Map<StructuralProgram, boolean>;
}
/**
 * Scan HTML in a single pass, collecting the tag names, class names, ids and
 * attribute names present in the document, and evaluating any structural
 * programs against it. If `data-beasties-container` elements are present,
 * only tokens (and program completions) within those subtrees count.
 */
export interface ScanOptions {
  /**
   * Collect the codepoints of the document's text, which `@font-face` rules
   * with a `unicode-range` are matched against. Skipping the walk is worth it
   * when no compiled sheet has such a rule.
   * @default true
   */
  chars?: boolean;
}
export declare function scanHtml(html: string, programs?: StructuralProgram[], options?: ScanOptions): DocumentTokens;
/** Collect structural programs referenced by the compiled sheets */
export declare function collectPrograms(sheets: CompiledSheet[]): StructuralProgram[];
export interface RuntimeOptions {
  /**
   * Controls which keyframes rules are inlined _(default: `'critical'`)_
   */
  keyframes?: "critical" | "all" | "none" | boolean;
  /**
   * Inline critical font-face rules _(default: `false`)_
   */
  inlineFonts?: boolean;
  /**
   * Preload critical fonts _(default: `true` when `fonts` is set)_
   *
   * Only faces whose family is declared by the critical CSS are preloaded, and
   * a face with a `unicode-range` only when the document's text needs it.
   */
  preloadFonts?: boolean;
  /**
   * Shorthand for setting `inlineFonts` + `preloadFonts`
   */
  fonts?: boolean;
}
export interface CriticalResult {
  css: string;
  /** Font URLs that should be preloaded */
  fontPreloads: string[];
  /**
   * The rules *not* inlined, i.e. what the external stylesheet still needs to
   * provide. Only populated when `inverse` is requested.
   */
  inverseCss?: string;
}
/**
 * Evaluate a compiled sheet against scanned document tokens, producing the
 * critical CSS subset.
 */
export declare function renderCriticalCss(sheet: CompiledSheet, tokens: DocumentTokens, options?: RuntimeOptions & {
  inverse?: boolean;
}): CriticalResult;
/** Emit every rule in the sheet, as when a stylesheet is inlined in full */
export declare function renderFullCss(sheet: CompiledSheet): string;
/**
 * The mechanism to use for lazy-loading stylesheets, mirroring the classic
 * beasties `preload` option.
 */
export type PreloadStrategy = "body" | "media" | "media-script" | "swap" | "swap-high" | "swap-low" | "js" | "js-lazy";
export interface ProcessorOptions extends RuntimeOptions {
  /**
   * Which preload strategy to use for the original stylesheet links.
   * _(default: move stylesheet links to the end of the document and insert preload links in their place)_
   */
  preload?: PreloadStrategy | false;
  /**
   * Add `<noscript>` fallback to JS-based strategies _(default: `true`)_
   */
  noscriptFallback?: boolean;
  /**
   * CSP nonce to set on every `<style>` and `<script>` element beasties
   * injects. A processor is typically long-lived and a nonce must be unique
   * per response, so pass it to `process()` instead unless it is genuinely
   * constant for the lifetime of the processor.
   */
  nonce?: string;
  /**
   * Cache rendered critical CSS keyed by the set of tokens found in the
   * document, so pages with the same shape don't re-evaluate the compiled
   * sheets _(default: `true`, keeping up to 100 entries)_
   */
  cache?: boolean | {
    maxSize?: number;
  };
  /**
   * Inline stylesheets smaller than this many bytes in full, dropping their
   * `<link>` entirely _(default: `0`, disabled)_
   */
  inlineThreshold?: number;
  /**
   * If the rules left for the external stylesheet to provide would be below
   * this many bytes, inline the stylesheet in full instead and drop its
   * `<link>` _(default: `0`, disabled)_
   */
  minimumExternalSize?: number;
  /**
   * Receives warnings, e.g. for `<link rel="stylesheet">` tags with no
   * matching compiled sheet _(default: no warnings are emitted)_
   */
  logger?: {
    warn?: (message: string) => void;
  };
}
/**
 * Create a `process(html)` function which inlines critical CSS from the
 * compiled sheets into rendered HTML.
 */
export interface ProcessOptions {
  /**
   * CSP nonce to set on every `<style>` and `<script>` element injected into
   * this document, overriding any nonce given to `createProcessor`.
   */
  nonce?: string;
}
export declare function createProcessor(plans: Array<CompiledSheet | CompactPlan>, options?: ProcessorOptions): {
  process: (html: string, processOptions?: ProcessOptions) => string;
  extract: (html: string) => CriticalResult;
};
//#endregion
export type { CompactPlan };