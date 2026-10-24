import { Alias, IProjectConfig, PathLike } from '../interfaces';
export interface ITrieContainer<T> {
    add(name: string, data: T): void;
}
export interface INormalizeAliasEntryParams {
    aliasKey: string;
    targetPaths: string[];
    config: IProjectConfig;
}
export interface IBuildAliasTrieParams<T extends ITrieContainer<Alias>> {
    config: IProjectConfig;
    paths?: PathLike;
    trie: T;
}
interface IRawAliasData {
    prefix: string;
    suffix: string;
    hasWildcard: boolean;
    shouldPrefixMatchWildly: boolean;
    paths: string[];
}
export declare function normalizeAliasEntry(params: INormalizeAliasEntryParams): IRawAliasData;
export declare function buildAliasTrie<T extends ITrieContainer<Alias>>(params: IBuildAliasTrieParams<T>): T;
export {};
