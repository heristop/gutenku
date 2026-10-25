import type { CursorPage } from "../../../core/pagination.mjs";
/** Retain server cursor metadata for legacy Agents items with nullable IDs.
 * @internal
 * @yields {T} Each item in server order, failing if pagination cannot advance.
 */
export declare function agentItems<T extends {
    id?: string | null;
}>(load: (after: string | undefined) => PromiseLike<CursorPage<T>>): AsyncGenerator<T, void, undefined>;
//# sourceMappingURL=pages.d.mts.map