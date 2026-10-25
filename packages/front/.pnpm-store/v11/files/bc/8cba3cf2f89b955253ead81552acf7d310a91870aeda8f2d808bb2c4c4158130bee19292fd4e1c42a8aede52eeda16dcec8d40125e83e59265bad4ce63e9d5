import type { ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ExportSpecifier, ImportDeclaration, ImportDeclarationSpecifier, ImportPhase, Program } from "@yuku-toolchain/types";
/** One imported binding, one record per specifier. */
export interface CollectedImport {
    /** The module specifier string. */
    source: string;
    /** The local binding name. */
    local: string;
    /** The imported name: `"default"`, `"*"` for namespaces, or the export name. */
    imported: string;
    /** True for `import type` and `import { type x }`. */
    typeOnly: boolean;
    /** Stage 3 phase modifier, or null. */
    phase: ImportPhase | null;
    specifier: ImportDeclarationSpecifier;
    declaration: ImportDeclaration;
}
/**
 * The imported bindings of one declaration, one record per specifier.
 * Type-only imports are included with `typeOnly` set, side-effect
 * imports introduce no bindings and yield no records. Composes with a
 * walk: `ImportDeclaration(node) { records.push(...collectImportDeclaration(node)) }`.
 */
export declare function collectImportDeclaration(declaration: ImportDeclaration): CollectedImport[];
/** Every imported binding of a program, in source order. */
export declare function collectImports(program: Program): CollectedImport[];
/** One exported name, one record per binding or specifier. */
export interface CollectedExport {
    /** The exported name, or null for bare `export *`. */
    exported: string | null;
    /** The local name backing the export, or null for re-exports and anonymous defaults. */
    local: string | null;
    /** The re-export source specifier, or null for local exports. */
    source: string | null;
    /** True for `export type` and `export { type x }`. */
    typeOnly: boolean;
    node: ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration | ExportSpecifier;
}
/**
 * The exports of one declaration: declaration forms expand to one
 * record per bound name, specifiers to one record each, and `export *`
 * to a single record with a null `exported`. Composes with a walk.
 */
export declare function collectExportDeclaration(statement: ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration): CollectedExport[];
/** Every export of a program, in source order. */
export declare function collectExports(program: Program): CollectedExport[];
