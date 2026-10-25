/**
 * True if the Unicode code point `cp` can start an identifier: any
 * character with the `ID_Start` property, plus `$` and `_`. Takes a
 * numeric code point as from `codePointAt`.
 */
export declare function isIdentifierStart(cp: number): boolean;
/**
 * True if the Unicode code point `cp` can appear after the first
 * character of an identifier: any character with the `ID_Continue`
 * property, plus `$`, `_`, and the ZWNJ and ZWJ joiners.
 */
export declare function isIdentifierChar(cp: number): boolean;
/**
 * True if `name` is a valid ECMAScript `IdentifierName`, the grammar an
 * identifier token must satisfy. Validates a raw string, not a node.
 * Reserved words are syntactically identifier names, so
 * `isIdentifierName("class")` is true, see {@link isValidIdentifier}.
 */
export declare function isIdentifierName(name: string): boolean;
/**
 * True if `word` is a reserved keyword of the core grammar. Does not
 * include `enum`, `await`, or the strict-mode-only words, see
 * {@link isReservedWord} and {@link isStrictReservedWord}.
 */
export declare function isKeyword(word: string): boolean;
/**
 * True if `word` is unconditionally reserved: `enum` in any context,
 * and `await` when `inModule`.
 */
export declare function isReservedWord(word: string, inModule?: boolean): boolean;
/**
 * True if `word` is reserved in strict mode: everything
 * {@link isReservedWord} covers, plus `let`, `static`, `yield`, and
 * friends.
 */
export declare function isStrictReservedWord(word: string, inModule?: boolean): boolean;
/** True for `eval` and `arguments`, reserved only as strict-mode binding targets. */
export declare function isStrictBindOnlyReservedWord(word: string): boolean;
/**
 * True if `word` is reserved as a strict-mode binding target:
 * everything {@link isStrictReservedWord} covers, plus `eval` and
 * `arguments`.
 */
export declare function isStrictBindReservedWord(word: string, inModule?: boolean): boolean;
/**
 * True if `name` can be used as an identifier binding: a valid
 * {@link isIdentifierName} that, when `reserved` is true (the default),
 * is neither a keyword nor a strict-mode reserved word. The check to
 * reach for when turning an arbitrary string into a local binding name.
 */
export declare function isValidIdentifier(name: string, reserved?: boolean): boolean;
