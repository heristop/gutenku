//#region src/plan.d.ts
/**
 * A string, or a one-based index into the plan's string pool. References are
 * biased by one so that `0` is free to mean "field absent" in the slots typed
 * `PooledString | 0`.
 */
type PooledString = string | number;
type CompactPlan = [version: 1, href: string | 0, size: number, pool: string[], wraps: PooledString[][], rules: CompactRule[]];
/** `[flags, ...present fields in flag order]` */
type CompactRule = unknown[];
//#endregion
//#region src/plan-encode.d.ts
declare function encodePlan(sheet: CompiledSheet): CompactPlan;
//#endregion
//#region src/compiler.d.ts
/**
 * Tokens which must all be present in the document for a selector to
 * possibly match. This is a necessary (not sufficient) condition: selectors
 * with combinators may be kept even though they don't match structurally.
 *
 * When `program` is present, the runtime evaluates it for an exact structural
 * match during its scan pass, and the token fields serve only as a fallback
 * for scans that did not evaluate programs.
 */
interface TokenCondition {
  classes?: string[];
  ids?: string[];
  tags?: string[];
  attrs?: string[];
  program?: StructuralProgram;
}
interface AttrTest {
  name: string;
  action: "exists" | "equals" | "element" | "start" | "end" | "any" | "hyphen";
  value?: string;
  ignoreCase?: boolean;
}
/** A single compound selector (no combinators); empty object matches any element */
interface CompoundTest {
  tag?: string;
  ids?: string[];
  classes?: string[];
  attrs?: AttrTest[];
}
type Combinator = " " | ">" | "+" | "~";
/**
 * A compiled selector for exact structural matching in a single streaming
 * pass: `compounds` are separated by `combinators` (one fewer than compounds).
 */
interface StructuralProgram {
  compounds: CompoundTest[];
  combinators: Combinator[];
}
/** `true` means the selector is always critical. */
type SelectorMatch = TokenCondition | true;
interface CompiledRule {
  /** Pre-serialized css text for atomic rules (at-rules, nested rules, markers) */
  css?: string;
  /** Selector list, parallel to `match`, for rules whose selectors can be subset at runtime */
  selectors?: string[];
  /** Pre-serialized `{...}` body for `selectors` */
  body?: string;
  /** Per-selector conditions (parallel to `selectors`), or rule-level conditions for atomic rules */
  match?: SelectorMatch[];
  /** Rule is always critical (markers, @import, etc.) */
  always?: true;
  /** Chain of enclosing at-rule wrappers, each ending with `{` */
  wrap?: string[];
  /** Normalized font families referenced by this rule's declarations */
  fontsUsed?: string[];
  /** Animation names referenced by this rule's declarations */
  keyframesUsed?: string[];
  /** This rule is an @font-face */
  fontFace?: {
    family?: string;
    src?: string;
    /** `unicode-range` as flattened `[start, end, ...]` codepoint pairs */
    ranges?: number[];
  };
  /** This rule is a @keyframes block with this name */
  keyframes?: string;
}
interface CompiledSheet {
  href?: string;
  rules: CompiledRule[];
  /** Total size in bytes of the source stylesheet, for stats/thresholds */
  size: number;
  warnings: string[];
}
interface CompileOptions {
  /** Identifier used to match this sheet against `<link>` hrefs at runtime */
  href?: string;
  /**
   * Always include rules matching these selectors or patterns in the critical CSS.
   */
  allowRules?: Array<string | RegExp>;
  /**
   * Use PostCSS safe parser for fault-tolerant CSS parsing _(default: `true`)_
   */
  safeParser?: boolean;
  /**
   * Compile selectors that need structural matching (combinators, compound
   * co-occurrence, attribute values) into match programs the runtime evaluates
   * exactly during its scan pass _(default: `true`)_.
   *
   * When disabled, such selectors fall back to token presence checks, which
   * are cheaper but may over-inline rules whose parts all exist in the
   * document without matching structurally.
   */
  exact?: boolean;
}
declare function compileSheet(css: string, options?: CompileOptions): CompiledSheet;
//#endregion
export { CompiledSheet as a, StructuralProgram as c, encodePlan as d, CompactPlan as f, CompiledRule as i, TokenCondition as l, Combinator as n, CompoundTest as o, CompileOptions as r, SelectorMatch as s, AttrTest as t, compileSheet as u };